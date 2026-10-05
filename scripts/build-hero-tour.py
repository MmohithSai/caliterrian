#!/usr/bin/env python3
"""Build the homepage hero loop from the facility walkthrough footage.

Sources (local capture material in `gym assets/`, gitignored):
  IMG_25*.MOV  iPhone walkthroughs (2026-09-30), 1080p30 HEVC, HLG HDR

Every shot is a real, steady camera move: the survey picked the sharpest,
steadiest window of each clip, and where the same spot was filmed twice only
the better take is used (IMG_2510 is an accidental close-up). The cut reads as
one continuous glide: every shot trucks right, so the two clips filmed panning
left play reversed (`rev`; nobody is in frame, so it is invisible) instead of
mirrored, which would flip the signage. Frames map 1:1 onto the 30 fps output.

Per shot: tone-map HLG to SDR (Hable, so the windows keep their detail), crop
(separate 16:9 and 9:16 windows; the source is only 1080p, so landscape zooms
stay near 1), match exposure and white balance to the other shots, apply the
site grade from grade-facility-stills.py (baked into a 3D LUT), a soft
vignette and light adaptive sharpening. Shots are joined with dissolves and
the last one dissolves back into the first, so the loop has no seam. Masters
stay near-lossless (CRF 8) until the final encode.

Outputs (public/hero/), each encoded to a quality target, not a byte budget:
  tour-landscape[.av1].mp4       1920x1080 (no 1440p tier: the source is 1080p)
  tour-portrait[.av1].mp4        720x1280, portrait phones (a 9:16 window of
                                 1080p is 608 px wide, so more pixels add nothing)
H.264 plays on every browser/phone; the .av1 twin is roughly half the size and
is served only where AV1 decodes in hardware. Plus one WebP poster per
orientation and src/data/tourCues.js (caption timings).

Usage: python scripts/build-hero-tour.py            full build
       python scripts/build-hero-tour.py 3 5        rebuild shots 3 and 5, reuse the rest
       python scripts/build-hero-tour.py --encode   re-encode from the existing masters
"""
import importlib.util
import json
import os
import re
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
TMP = Path(".hero-tmp/tour")      # relative: absolute C:/ paths break ffmpeg filter parsing
SRC_DIR = Path("gym assets")
OUT = Path("public/hero")
CUES_JS = Path("src/data/tourCues.js")

FPS = 30
XFADE = 0.6   # dissolve between shots (s); pans match, so it reads as one glide
LOOP = 0.6    # tail -> head wrap dissolve; consumes shot 1's first LOOP seconds
# Rendition -> (master, output size or None for the master's own, H.264 level, VBV cap kbps).
# Level 4.0 so the oldest phones still decode it in hardware.
RENDITIONS = {
    "landscape": ("landscape", None, "4.0", 10000),
    "portrait": ("portrait", None, "4.0", 6000),
}
# Quality targets, not byte budgets (the script prints VMAF against the master).
# The footage is dense (turf, ribbed sheet metal, rubber tiles) and sharpened,
# so the encode is set to keep that texture rather than smooth it: CRF 24 / 32
# measured VMAF ~97 but visibly flattened fine detail. A ~5 MB byte budget (an
# earlier cut) scored in the low 80s and looked soft.
H264_CRF = 20
AV1_CRF = 28
# Laplacian variance at 640 px (dissolves excluded). The 9:16 windows of 1080p
# hold less detail; in-focus frames of bare wall + terrace tile there measure ~130.
SHARP_FLOOR = {"landscape": 150, "portrait": 120}
JITTER_MAX = 0.25   # px rms at 640 px of high-pass frame-to-frame motion; fail above this
SIZE = {"landscape": (1920, 1080), "portrait": (720, 1280)}   # masters
# HLG (BT.2020) -> SDR BT.709 full-range 16-bit RGB. npl=203 puts HLG reference
# white at 1.0; Mobius stays linear through the midtones and only rolls off the
# window highlights. (Hable compressed the mids too and laid a grey haze over
# every shot.)
TONEMAP = ("zscale=t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,tonemap=mobius:desat=0,"
           "zscale=t=bt709:m=bt709:r=full,format=gbrp16le")

# Every shot pans at the same medium pace: PACE is the target camera speed (px
# per output frame of global motion, measured at 640 px wide; ~5% of the frame
# width per second). Shots filmed faster are slowed to it with motion-
# compensated interpolation (flow_frames); slower ones play at their own speed (never sped
# up — people in frame would hurry). Holds are equal, so the rhythm is even.
PACE = 1.1
HOLD = 4.2    # seconds per shot including its dissolve in -> ~3.6 s between captions

# One entry per shot, in play order. at = source in-point (s); dur = seconds on
# screen (default HOLD). rev plays the window backwards (flips a left pan into
# a right one). speed overrides the automatic PACE retime (1 = real time).
# zoom/cx/cy frame the 16:9 window (zoom >= 1, centre as a fraction of the
# frame); pzoom/pcx/pcy the 9:16 one. ev nudges the automatic exposure match.
EDL = [
    # Opener (and poster): the rig with a coach on the rope. Already slower than
    # PACE, and the whole clip — shot 1 also gives up LOOP to the wrap dissolve.
    dict(src="IMG_2511.MOV", at=0.0, dur=4.36, pcx=0.84,
         name="Freestyle Area", blurb="Monkey bars, climbing rope and crash mats"),
    # The calmest of the four takes of this pan (2502 runs ~2x PACE).
    dict(src="IMG_2504.MOV", at=0.2, pcx=0.40,
         name="Strength Lab", blurb="Racks, plates and adjustable benches"),
    dict(src="IMG_2503.MOV", at=1.0, pcx=0.45,
         name="Skill Arena", blurb="Gymnastic rings and the pull-up rig"),
    # Filmed panning left; reversed. Starts after the tyre has left the foreground.
    dict(src="IMG_2506.MOV", at=1.3, rev=True, pcx=0.74,
         name="Freestyle Area", blurb="Parallel bars and wall bars"),
    # Filmed panning left; reversed. The early, sharpest stretch: rope, SkiErg, open door.
    dict(src="IMG_2508.MOV", at=0.0, rev=True, pcx=0.45,
         name="Performance Lane", blurb="Turf lane, climbing rope and SkiErg"),
    # The door opens onto the terrace.
    dict(src="IMG_2509.MOV", at=10.2, pcx=0.55,
         name="Outdoor Terrace", blurb="Open-air space off the turf lane"),
    # Back to the rig, so the wrap to shot 1 stays in one zone.
    dict(src="IMG_2513.MOV", at=0.8, pcx=0.45,
         name="Freestyle Area", blurb="Crash-mat runway and plyo boxes"),
]
for _s in EDL:
    _s.setdefault("dur", HOLD)


# The facility stills' grade (scripts/grade-facility-stills.py), tuned for a
# full-bleed video under the hero scrims: a touch brighter than the cards.
HERO_GRADE = dict(
    black_point=0.045,
    mid_gamma=1.06,
    hi_knee=0.80,        # the white sheet-metal walls roll off…
    hi_slope=0.70,       # …gently: Mobius has already tamed the windows
    contrast=1.20,
    saturation=1.02,
    shadow_tint=(-0.012, 0.004, 0.040),
    hilite_tint=(-0.006, 0.000, 0.010),
    vignette=0.0,        # positional — applied by ffmpeg, not the LUT
)
TARGET_LUMA = 0.47       # mean display luma each shot is matched to before grading
WB_STRENGTH = 0.5        # how far toward neutral the near-white pixels are pulled
GREEN_TAME = 0.30        # saturation cut on the neon turf (0 = none)
LUT_N = 33
# Vignette is milder on the tall cut, where PI/5 swallows the top and bottom.
# No denoise: the footage is clean in daylight and any temporal filter smears
# the fine detail. 1080p phone video is soft, so two luma-only unsharp passes
# (chroma untouched, so no colour fringes): a wide one for local contrast
# ("clarity") and a tight one for edge detail. Checked at 1:1 for halos on dark
# bars against the bright sheet metal.
SHARPEN = "unsharp=lx=13:ly=13:la=0.5:cx=3:cy=3:ca=0,unsharp=lx=5:ly=5:la=1.0:cx=3:cy=3:ca=0"
FINISH = {"landscape": f"vignette=angle=PI/5,{SHARPEN}", "portrait": f"vignette=angle=PI/7,{SHARPEN}"}


def run(args, capture=False):
    """Run a command; captured stdout/stderr stay bytes (frame data goes through here)."""
    print("  $", " ".join(str(a) for a in args[:12]), "..." if len(args) > 12 else "", flush=True)
    r = subprocess.run([str(a) for a in args], capture_output=capture)
    if r.returncode:
        if capture:
            print(r.stderr.decode("utf-8", "replace")[-4000:])
        sys.exit(f"command failed ({r.returncode}): {args[0]}")
    return r


def ffmpeg(*args, capture=False):
    return run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *args], capture=capture)


def probe(p, entries):
    """Values of the requested stream entries, in order (side data is skipped)."""
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", entries,
                          "-of", "default=noprint_wrappers=1:nokey=1", str(p)], capture_output=True, text=True).stdout
    return out.split()


def probe_duration(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                                capture_output=True, text=True).stdout.strip())


def source(s):
    return SRC_DIR / s["src"]


_fps = {}


def src_fps(s):
    if s["src"] not in _fps:
        n, d = probe(source(s), "stream=avg_frame_rate")[0].split("/")
        _fps[s["src"]] = float(n) / float(d)
    return _fps[s["src"]]


def frames(s):
    return round(s["dur"] * FPS)


def gray_frames(path, t0, span, w=640, h=360):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", f"{t0:.3f}", "-t", f"{span:.3f}", "-i", str(path),
                        "-vf", f"scale={w}:{h}", "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True)
    return np.frombuffer(r.stdout, np.uint8).reshape(-1, h, w).astype(np.float32)


_speed = {}


def speed(s):
    """Playback speed (<= 1) that brings the shot's mean pan to PACE; source frames per output frame."""
    if "speed" in s:
        return s["speed"]
    key = (s["src"], s["at"], s["dur"])
    if key not in _speed:
        k = 1.0
        for _ in range(3):   # the window shrinks as k drops, so re-measure over it
            fr = gray_frames(source(s), s["at"], frames(s) * k / src_fps(s))
            v = float(np.mean([np.hypot(*cv2.phaseCorrelate(fr[i - 1], fr[i])[0]) for i in range(1, len(fr))]))
            k = min(1.0, PACE / v)
        _speed[key] = 1.0 if k > 0.95 else k   # within 5% of PACE: real time, no interpolation
    return _speed[key]


def src_frames(s):
    return int(np.ceil(frames(s) * speed(s))) + 2


def window(s, orientation, w, h):
    """Crop rect (x, y, w, h) inside a w x h 16:9 frame."""
    if orientation == "landscape":
        z, cx, cy, aspect = s.get("zoom", 1.0), s.get("cx", 0.5), s.get("cy", 0.5), 16 / 9
    else:
        z, cx, cy, aspect = s.get("pzoom", 1.0), s.get("pcx", 0.5), s.get("pcy", 0.5), 9 / 16
    ch = h / z
    cw = ch * aspect
    x = min(max(cx * w - cw / 2, 0.0), w - cw)
    y = min(max(cy * h - ch / 2, 0.0), h - ch)
    return x, y, cw, ch


def ensure_sources():
    missing = [str(source(s)) for s in EDL if not source(s).exists() or source(s).stat().st_size < 1_000_000]
    if missing:
        sys.exit("missing source footage (copy it into gym assets/):\n  " + "\n  ".join(sorted(set(missing))))


def validate():
    for i, s in enumerate(EDL, 1):
        assert s.get("zoom", 1) >= 1.0 and s.get("pzoom", 1) >= 1.0, f"shot {i}: zoom below 1 would show the frame edge"
        assert s["dur"] > XFADE * 2, f"shot {i}: shorter than two dissolves"
    assert EDL[0]["dur"] > LOOP + XFADE, "shot 1 must be longer than LOOP + XFADE"


# ── colour ───────────────────────────────────────────────────────────────────

def site_grade():
    spec = importlib.util.spec_from_file_location("grade_stills", ROOT / "scripts" / "grade-facility-stills.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.grade


def sample(s, n=8, w=480, h=270):
    """n evenly spaced RGB frames (0..1) from the shot's source span, landscape window only."""
    span = frames(s) * speed(s) / src_fps(s)
    x, y, cw, ch = (int(round(v)) for v in window(s, "landscape", w, h))
    out = []
    for k in range(n):
        t = s["at"] + span * (k + 0.5) / n
        r = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", f"{t:.3f}", "-i", str(source(s)), "-frames:v", "1",
                            "-vf", f"{TONEMAP},scale={w}:{h},format=rgb24", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True)
        f = np.frombuffer(r.stdout, np.uint8).reshape(h, w, 3)
        out.append(f[y:y + ch, x:x + cw].astype(np.float32) / 255)
    return np.stack(out)


def measure(s):
    """Linear gain + per-channel white balance that bring this shot to the common exposure."""
    px = sample(s).reshape(-1, 3)
    lin = px ** 2.2
    luma = px @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    # White balance from near-neutral, well-exposed pixels (sheet metal, walls,
    # ceiling) — never from the whole frame, which the blue walls and green turf
    # would drag off.
    sat = px.max(1) - px.min(1)
    neutral = (sat < 0.12) & (luma > 0.45) & (luma < 0.95)
    if neutral.sum() > 500:
        m = lin[neutral].mean(0)
        wb = (m.mean() / m) ** WB_STRENGTH
    else:
        wb = np.ones(3, np.float32)
    # Exposure on the mean display luma, in linear light, clamped so a dark shot
    # isn't pushed into noise or a bright one flattened.
    cur = float(np.mean(((lin * wb) @ np.array([0.2126, 0.7152, 0.0722], np.float32)) ** (1 / 2.2)))
    gain = float(np.clip((TARGET_LUMA / cur) ** 2.2 * 2 ** s.get("ev", 0.0), 0.6, 1.8))
    return gain, wb, cur


def shot_lut(gain, wb, grade, path):
    """Exposure/WB match + site grade, baked into a .cube 3D LUT (red varies fastest)."""
    g = np.linspace(0, 1, LUT_N, dtype=np.float32)
    b_, g_, r_ = np.meshgrid(g, g, g, indexing="ij")
    rgb = np.stack([r_, g_, b_], -1).reshape(-1, 1, 3)
    lin = rgb ** 2.2 * gain * wb
    # Soft shoulder instead of a hard clip where the gain pushes past white.
    lin = np.where(lin > 0.8, 0.8 + 0.2 * np.tanh((lin - 0.8) / 0.2), lin)
    x = np.clip(lin, 0, 1) ** (1 / 2.2)
    if GREEN_TAME:
        # Pull saturation out of yellow-greens only (the turf), leave the blues alone.
        lum = x @ np.array([0.299, 0.587, 0.114], np.float32)
        green = np.clip((x[..., 1] - np.maximum(x[..., 0], x[..., 2])) * 4, 0, 1)
        k = 1 - GREEN_TAME * green
        x = lum[..., None] + (x - lum[..., None]) * k[..., None]
    y = grade(np.ascontiguousarray(x, dtype=np.float32), HERO_GRADE).reshape(-1, 3)
    lines = [f"LUT_3D_SIZE {LUT_N}"] + [f"{r:.6f} {g:.6f} {b:.6f}" for r, g, b in y]
    path.write_text("\n".join(lines) + "\n")


# ── shots ────────────────────────────────────────────────────────────────────

def chain(s, orientation, lut):
    sw, sh = (int(v) for v in probe(source(s), "stream=width,height")[:2])
    assert abs(sw / sh - 16 / 9) < 0.01, f"{s['src']}: window() assumes a 16:9 source"
    x, y, w, h = window(s, orientation, sw, sh)
    ev = lambda v: int(round(v / 2)) * 2
    ow, oh = SIZE[orientation]
    # Input is already tone-mapped 16-bit RGB (TONEMAP runs once, before the split).
    return (f"crop={ev(w)}:{ev(h)}:{ev(x)}:{ev(y)},"
            f"scale={ow}:{oh}:flags=lanczos,setsar=1,format=gbrp16le,"
            f"lut3d=file={lut.as_posix()}:interp=tetrahedral,"
            f"scale=out_range=limited:out_color_matrix=bt709,format=yuv420p,{FINISH[orientation]},"
            f"setparams=range=tv:color_primaries=bt709:color_trc=bt709:colorspace=bt709"
            + (",reverse" if s.get("rev") else ""))


def build_shot(i, s, grade):
    land, port = TMP / f"{i:02d}_land.mp4", TMP / f"{i:02d}_port.mp4"
    gain, wb, cur = measure(s)
    lut = TMP / f"{i:02d}.cube"
    shot_lut(gain, wb, grade, lut)
    n, k = frames(s), speed(s)
    print(f"[{i:02d}] {s['name']}: {s['src']} @ {s['at']:.2f}s, {n} frames at {k:.2f}x{' reversed' if s.get('rev') else ''}  "
          f"luma {cur:.2f} -> gain {gain:.2f}, wb {np.round(wb, 3).tolist()}")
    enc = ["-c:v", "libx264", "-preset", "fast", "-crf", "8", "-an", "-fps_mode", "cfr", "-r", str(FPS), "-frames:v", n]
    graph = f"split=2[a][b];[a]{chain(s, 'landscape', lut)}[l];[b]{chain(s, 'portrait', lut)}[p]"
    outs = ["-map", "[l]", *enc, land, "-map", "[p]", *enc, port]
    if k == 1:
        # Input seek is frame-accurate when transcoding; trim bounds the window
        # (reverse needs an end), setpts lays the frames 1:1 onto the 30 fps grid.
        ffmpeg("-ss", f"{s['at']:.3f}", "-t", f"{n / src_fps(s) + 0.5:.3f}", "-i", source(s), "-filter_complex",
               f"[0:v]trim=end_frame={n},setpts=N/{FPS}/TB,{TONEMAP},{graph}", *outs)
    else:
        # Slowed shot: optical-flow in-betweens, streamed through as 16-bit RGB.
        w, h = (int(v) for v in probe(source(s), "stream=width,height")[:2])
        enc_p = subprocess.Popen(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb48le",
                                  "-s", f"{w}x{h}", "-r", str(FPS), "-i", "-", "-filter_complex",
                                  f"[0:v]format=gbrp16le,{graph}", *map(str, outs)], stdin=subprocess.PIPE)
        for f in flow_frames(s, k, n, w, h):
            enc_p.stdin.write(f.tobytes())
        enc_p.stdin.close()
        assert enc_p.wait() == 0, f"shot {i}: encode failed"
    for p in (land, port):
        got = int((probe(p, "stream=nb_frames") or ["0"])[0])
        assert got == n, f"{p}: {got} frames, expected {n}"
    return land, port


def flow_frames(s, k, n, w, h):
    """n output frames stepping k source frames each: in-betweens are both
    neighbours warped along DIS optical flow to the exact fraction and blended.
    Unlike block-based minterpolate (jitter 0.10 px, 5% sharpness pulse on a
    test pan), every in-between lands where the motion puts it (0.01 px, 0.4%)."""
    m = src_frames(s)
    rd = subprocess.Popen(["ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", f"{s['at']:.3f}", "-t", f"{m / src_fps(s) + 0.5:.3f}",
                           "-i", str(source(s)), "-vf", f"{TONEMAP},format=rgb48le", "-frames:v", str(m),
                           "-f", "rawvideo", "-"], stdout=subprocess.PIPE)
    size = w * h * 6

    def nxt():
        b = rd.stdout.read(size)
        assert len(b) == size, f"{s['src']}: source ran out of frames"
        return np.frombuffer(b, np.uint16).reshape(h, w, 3)

    gray = lambda f: cv2.cvtColor((f >> 8).astype(np.uint8), cv2.COLOR_RGB2GRAY)
    dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    f0, f1, at, flows = nxt(), nxt(), 0, None
    for j in range(n):
        t = j * k
        i, a = int(t + 1e-6), t - int(t + 1e-6)
        while at < i:
            f0, f1, at, flows = f1, nxt(), at + 1, None
        if a < 1e-3:
            yield f0
            continue
        if flows is None:
            g0, g1 = gray(f0), gray(f1)
            flows = dis.calc(g0, g1, None), dis.calc(g1, g0, None)
        fwd, bwd = flows
        w0 = cv2.remap(f0, xx - a * fwd[..., 0], yy - a * fwd[..., 1], cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        w1 = cv2.remap(f1, xx - (1 - a) * bwd[..., 0], yy - (1 - a) * bwd[..., 1], cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        yield ((1 - a) * w0.astype(np.float32) + a * w1.astype(np.float32) + 0.5).astype(np.uint16)
    rd.communicate()   # drain the reader's last frame or two so it exits cleanly


# ── assembly ─────────────────────────────────────────────────────────────────

def offsets():
    """xfade offset of each shot after the first (s into the loop)."""
    out, off = [], EDL[0]["dur"] - LOOP - XFADE
    for s in EDL[1:]:
        out.append(off)
        off += s["dur"] - XFADE
    return out, off


def cue_times():
    return [0.0] + [round(o + XFADE / 2, 2) for o in offsets()[0]]


def concat(shots, orientation):
    """Dissolve chain + loop wrap -> near-lossless master."""
    n = len(shots)
    inputs = []
    for p in shots + [shots[0]]:
        inputs += ["-i", p]
    parts = [f"[0:v]trim=start={LOOP},setpts=PTS-STARTPTS[a0]", f"[{n}:v]trim=end={LOOP},setpts=PTS-STARTPTS[head]"]
    prev = "a0"
    offs, tail = offsets()
    for k, off in enumerate(offs, 1):
        parts.append(f"[{prev}][{k}:v]xfade=transition=fade:duration={XFADE}:offset={off:.3f}[x{k}]")
        prev = f"x{k}"
    parts.append(f"[{prev}][head]xfade=transition=fade:duration={LOOP}:offset={tail:.3f},format=yuv420p[v]")
    out = master(orientation)
    ffmpeg(*inputs, "-filter_complex", ";".join(parts), "-map", "[v]", "-c:v", "libx264", "-preset", "fast", "-crf", "8",
           "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-an", out)
    return out


def master(orientation):
    return TMP / f"loop_{orientation}.mp4"


TAGS = ["-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
        "-an", "-movflags", "+faststart"]


def vmaf(ref, dist, size):
    """VMAF of dist against ref, both brought to `size` (ref with Lanczos)."""
    w, h = size
    r = run(["ffmpeg", "-hide_banner", "-i", dist, "-i", ref, "-lavfi",
             f"[0:v]scale={w}:{h},setpts=PTS-STARTPTS[d];[1:v]scale={w}:{h}:flags=lanczos,setpts=PTS-STARTPTS[r];"
             f"[d][r]libvmaf=n_threads={os.cpu_count()}:n_subsample=3", "-f", "null", "-"], capture=True)
    m = re.search(r"VMAF score: ([\d.]+)", r.stderr.decode("utf-8", "replace"))
    return float(m.group(1)) if m else 0.0


def encode(name, h264_crf=H264_CRF, av1_crf=AV1_CRF, out_dir=OUT):
    """One rendition: H.264 CRF (plays anywhere) + AV1 CRF (hardware-decode devices only)."""
    src_name, size, level, cap = RENDITIONS[name]
    src = master(src_name)
    size = size or SIZE[src_name]
    vf = ["-vf", f"scale={size[0]}:{size[1]}:flags=lanczos"] if size != SIZE[src_name] else []
    h264 = out_dir / f"tour-{name}.mp4"
    # CRF with a VBV cap: quality-targeted, but no bitrate spike a 4G link can't stream.
    ffmpeg("-i", src, *vf, "-c:v", "libx264", "-profile:v", "high", "-level", level, "-pix_fmt", "yuv420p",
           "-preset", "slower", "-tune", "film", "-crf", str(h264_crf), "-maxrate", f"{cap}k", "-bufsize", f"{cap * 2}k",
           "-g", str(FPS * 2), "-keyint_min", str(FPS), *TAGS, h264)
    av1 = out_dir / f"tour-{name}.av1.mp4"
    ffmpeg("-i", src, *vf, "-c:v", "libsvtav1", "-preset", "4", "-crf", str(av1_crf), "-pix_fmt", "yuv420p",
           "-g", str(FPS * 2), "-svtav1-params", "tune=0:film-grain=0", *TAGS, av1)
    dur = probe_duration(h264)
    for p in (h264, av1):
        mb = p.stat().st_size / 1e6
        print(f"  {p}  {mb:.2f} MB  {mb * 8 / dur:.1f} Mbps  VMAF {vmaf(src, p, size):.1f}")
    return h264


def poster(orientation):
    """WebP of the loop's first frame (the LCP image and reduced-motion fallback)."""
    out = OUT / f"tour-{orientation}-poster.webp"
    ffmpeg("-i", master(orientation), "-frames:v", "1", "-vf", "scale=in_range=tv:out_range=pc,format=rgb24", "-c:v", "libwebp", "-quality", "90",
           "-compression_level", "6", out)
    print(f"  {out}  {out.stat().st_size / 1e3:.0f} KB")


def write_cues(cues, length):
    rows = [dict(at=at, name=s["name"], blurb=s["blurb"]) for at, s in zip(cues, EDL)]
    body = ",\n".join("  " + json.dumps(r, ensure_ascii=False) for r in rows)
    CUES_JS.write_text(
        "// Generated by scripts/build-hero-tour.py — edit the EDL there, not this file.\n"
        "// `at` = seconds into public/hero/tour-*.mp4 at which each zone caption takes over.\n"
        f"export const TOUR_CUES = [\n{body},\n];\n"
        "// Loop length (s): the last cue runs until here.\n"
        f"export const TOUR_LENGTH = {length:.2f};\n",
        encoding="utf-8",
    )
    print(f"  {CUES_JS}: {len(rows)} cues, last at {cues[-1]} s")


def raw_frames(src, w, h):
    r = ffmpeg("-i", src, "-an", "-vf", f"scale={w}:{h}", "-f", "rawvideo", "-pix_fmt", "gray", "-", capture=True)
    return np.frombuffer(r.stdout, np.uint8).reshape(-1, h, w)


def qa(out, orientation, cues):
    """Runnable check: no soft second, no residual jitter; sheets to eyeball.

    No border check: every window is a crop inside the source (validate() and
    chain() guarantee it), and dark equipment under the vignette trips cropdetect.
    """
    small = (640, 360) if orientation == "landscape" else (360, 640)
    fr8 = raw_frames(out, *small)
    sharp = [cv2.Laplacian(f, cv2.CV_64F).var() for f in fr8]
    fr = fr8.astype(np.float32)
    edges = [int(c * FPS) for c in cues] + [len(fr)]
    fading = set()
    for e in edges[1:-1]:
        fading.update(range(e - int(XFADE * FPS / 2), e + int(XFADE * FPS / 2) + 1))
    fading.update(range(len(fr) - int(LOOP * FPS), len(fr)))
    sec = {}
    for i, v in enumerate(sharp):
        if i not in fading:
            sec[i // FPS] = min(sec.get(i // FPS, 1e9), v)
    soft = {k: round(v) for k, v in sec.items() if v < SHARP_FLOOR[orientation]}
    print(f"  [{orientation}] {len(fr)} frames, {len(fr) / FPS:.1f} s; per-second min sharpness floor {SHARP_FLOOR[orientation]}: " + (f"soft seconds {soft}" if soft else "OK"))
    # Residual jitter: high-pass of frame-to-frame global motion, per shot (dissolve frames excluded).
    d = np.array([cv2.phaseCorrelate(fr[i - 1], fr[i])[0] for i in range(1, len(fr))])
    hp = d - np.stack([np.convolve(d[:, j], np.ones(9) / 9, mode="same") for j in range(2)], 1)
    worst = []
    for k in range(len(cues)):
        a, b = edges[k] + int(XFADE * FPS), edges[k + 1] - int(XFADE * FPS / 2)
        if b > a:
            worst.append(float(np.sqrt(np.mean(hp[a:b] ** 2))))
    print(f"  [{orientation}] per-shot jitter px rms @640 (limit {JITTER_MAX}): {[round(v, 2) for v in worst]} " +
          ("OK" if max(worst) <= JITTER_MAX else "FAIL"))
    ffmpeg("-i", out, "-vf", "fps=2,scale=240:-1,tile=8x8:padding=2:color=0x2E8DFF", "-frames:v", "1", TMP / f"qa-{orientation}.jpg")
    ffmpeg("-i", out, "-vf", f"select='gte(n,{len(fr) - 4})+lt(n,4)',scale=320:-1,tile=8x1:padding=2:color=0x2E8DFF",
           "-fps_mode", "passthrough", "-frames:v", "1", TMP / f"seam-{orientation}.jpg")
    print(f"  sheets: {TMP / f'qa-{orientation}.jpg'}  {TMP / f'seam-{orientation}.jpg'} (tiles: last 4 frames | first 4 frames)")
    return max(worst) <= JITTER_MAX and not soft


def main():
    os.chdir(ROOT)
    validate()
    TMP.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    args = sys.argv[1:]
    cues = cue_times()
    if "--encode" not in args:
        ensure_sources()
        only = [int(a) for a in args]   # e.g. `build-hero-tour.py 3 5` rebuilds just those shots
        print(">> Shots: trim, reframe, match, grade")
        grade = site_grade()
        shots = {"landscape": [], "portrait": []}
        for i, s in enumerate(EDL, 1):
            l, p = (TMP / f"{i:02d}_land.mp4", TMP / f"{i:02d}_port.mp4")
            if not only or i in only or not (l.exists() and p.exists()):
                l, p = build_shot(i, s, grade)
            shots["landscape"].append(l)
            shots["portrait"].append(p)
        for orientation, files in shots.items():
            print(f">> {orientation}: dissolves + loop")
            concat(files, orientation)
    ok = True
    for name in RENDITIONS:
        print(f">> {name}: encode")
        out = encode(name)
        print(f">> {name}: QA")
        ok &= qa(out, name, cues)
    for orientation in SIZE:
        poster(orientation)
    write_cues(cues, probe_duration(master("landscape")))
    print(">> Done." if ok else ">> Done, but QA flagged a problem above.", f"Intermediates and QA sheets are in {TMP}/ (gitignored).")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
