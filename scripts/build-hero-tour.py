#!/usr/bin/env python3
"""Build the homepage hero tour from the raw gym walkthrough footage.

Sources (LFS, restored from the local cache on first run):
  gym assets/IMG_4024.MOV  44.5 s handheld 4K walkthrough of every zone
  gym assets/IMG_4023.MOV  12.1 s steady 4K establishing shot from the entrance

The handheld footage is a walking phone with whip-pans, rolling-shutter jello
and parallax, and no similarity-transform stabilizer (vidstab, deshake) makes
it steady — the tripod-locked attempts still jittered 1-5 px per frame. So the
rebuild does not use the camera motion at all: for every zone it picks the
sharpest frame inside a search window, cleans it, and synthesizes the camera
move itself (slow push-in / pull-out plus a gentle lateral drift, sub-pixel
warps, eased). Shots are joined with dissolves and the last wide turf shot
dissolves back into the entrance shot so the loop seam is invisible.

Outputs (public/hero/): tour-landscape.mp4 (1920x1080), tour-portrait.mp4
(1080x1920, its own 9:16 window per zone so phones still see each zone), one
full-res WebP poster per orientation, and src/data/tourCues.js (caption timings).

Usage: python scripts/build-hero-tour.py
"""
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
TMP = Path(".hero-tmp")          # relative: absolute C:/ paths break ffmpeg filter parsing
OUT = Path("public/hero")
CUES_JS = Path("src/data/tourCues.js")

SRC = {
    "tour": Path("gym assets/IMG_4024.MOV"),
    "entrance": Path("gym assets/IMG_4023.MOV"),
}
FALLBACK = {"tour": Path(r"D:\downloads 14-07-2026\IMG_4024.MOV")}

FPS = 24
XFADE = 0.7   # dissolve between shots (s)
LOOP = 0.7    # tail -> head wrap dissolve; consumes shot 1's first LOOP seconds
# bytes; two-pass ABR targets these. Picked off the SSIM-vs-size knee against the
# CRF-12 master: 1080p at these rates scores .967/.958, a 720p cut scores .944 —
# doubling the budget again only buys .980, which is not worth 4 MB on a hero
# that autoplays on every load.
BUDGET = {"landscape": 5_300_000, "portrait": 4_200_000}
SHARP_FLOOR = 300   # Laplacian variance at 640 px; warn below this
JITTER_MAX = 0.25   # px rms at 640 px of high-pass frame-to-frame motion; fail above this

SRC_W, SRC_H = 3840, 2160
LAND_BASE = (2560, 1440)   # landscape warps from a pre-shrunk still so the final scale step stays mild
LAND_OUT, PORT_OUT = (1920, 1080), (1080, 1920)

# One still per zone. win = search window in the source (s); the sharpest frame
# in it is used. zoom = (start, end) magnification of the full frame; cx = start/
# end horizontal centre as a fraction of width (landscape), pcx the same for the
# 9:16 portrait window. Motion is eased (smoothstep) and sub-pixel, so it never
# steps. Keep |cx drift| <= 0.03 and |pcx drift| <= 0.07 for a calm pace.
EDL = [
    dict(src="entrance", win=(0.8, 2.5),   dur=3.9, zoom=(1.00, 1.07), cx=(0.50, 0.52), pcx=(0.36, 0.42), name="Performance Lane",     blurb="Sled, battle rope and the turf lane"),
    dict(src="entrance", win=(9.5, 11.6),  dur=3.0, zoom=(1.07, 1.00), cx=(0.52, 0.50), pcx=(0.56, 0.50), name="Freestyle Area",       blurb="Crash mats, foam cubes and open floor"),
    # Tight window on the left 2/3: the mirror on the right reflects the camera operator.
    dict(src="tour",     win=(8.4, 9.9),   dur=2.8, zoom=(1.50, 1.44), cx=(0.333, 0.345), pcx=(0.42, 0.48), name="Stall Bars",         blurb="Wall bars and crash mats beside the turf"),
    dict(src="tour",     win=(12.9, 14.6), dur=3.0, zoom=(1.06, 1.00), cx=(0.50, 0.48), pcx=(0.50, 0.44), name="Functional Rig",       blurb="Pull-up rig, stall bars and cones"),
    dict(src="tour",     win=(18.0, 19.9), dur=2.8, zoom=(1.00, 1.07), cx=(0.50, 0.52), pcx=(0.46, 0.52), name="Mobility Zone",        blurb="Mats for stretching and mobility work"),
    dict(src="tour",     win=(24.4, 26.5), dur=3.4, zoom=(1.07, 1.00), cx=(0.51, 0.49), pcx=(0.54, 0.48), name="Strength Lab",         blurb="Power racks, platform, plyo boxes and dumbbells"),
    # No sharp frame exists of the conditioning corner (28-33.5 s is all whip-pan); its
    # benches, boxes and fan are in the Skill Arena still, the dumbbell rack in Strength Lab.
    dict(src="tour",     win=(34.2, 36.4), dur=3.3, zoom=(1.00, 1.06), cx=(0.50, 0.48), pcx=(0.50, 0.44), name="Skill Arena",          blurb="Pull-up bars, rings, benches and plyo boxes"),
    dict(src="tour",     win=(39.1, 39.6), dur=2.6, zoom=(1.00, 1.07), cx=(0.50, 0.52), pcx=(0.48, 0.54), name="Parallel Bars",        blurb="Dips, holds and support work"),
    dict(src="tour",     win=(43.6, 44.5), dur=2.6, zoom=(1.07, 1.00), cx=(0.50, 0.49), pcx=(0.52, 0.46), name="Skill Arena · Bands",  blurb="Resistance bands for assisted skills"),
    dict(src="tour",     win=(0.6, 3.6),   dur=3.2, zoom=(1.00, 1.07), cx=(0.49, 0.51), pcx=(0.40, 0.47), name="Turf & Running Lane",  blurb="Tyres, ropes and cones down the turf"),
]

GRADE = "unsharp=5:5:0.35:5:5:0,eq=contrast=1.05:saturation=0.95,colorbalance=bs=0.03:bm=0.012,vignette=angle=PI/6,format=yuv420p"


def key(s):
    return f"{s['src']}-{s['win'][0]:.1f}"


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


def probe_duration(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                                capture_output=True, text=True).stdout.strip())


def ensure_sources():
    for k, p in SRC.items():
        if not p.exists() or p.stat().st_size < 1_000_000:
            subprocess.run(["git", "lfs", "checkout", "--", str(p)])
        if (not p.exists() or p.stat().st_size < 1_000_000) and FALLBACK.get(k, Path()).exists():
            shutil.copy(FALLBACK[k], p)
        if not p.exists() or p.stat().st_size < 1_000_000:
            sys.exit(f'{p} is an LFS pointer — run: git lfs pull --include="gym assets/*.MOV"')


def validate():
    for i, s in enumerate(EDL, 1):
        assert min(s["zoom"]) >= 1.0, f"shot {i}: zoom below 1 would show the frame edge"
        assert s["dur"] > XFADE * 2, f"shot {i}: shorter than two dissolves"
        assert abs(s["cx"][1] - s["cx"][0]) <= 0.0301 and abs(s["pcx"][1] - s["pcx"][0]) <= 0.0701, f"shot {i}: drift too fast"
    assert EDL[0]["dur"] > LOOP + XFADE, "shot 1 must be longer than LOOP + XFADE"


# ── stills ───────────────────────────────────────────────────────────────────

def raw_frames(src, t0, t1, w, h, extra=""):
    """Decode [t0, t1) at 24 fps as gray w x h frames (VFR source -> fps first)."""
    r = ffmpeg("-ss", f"{t0:.3f}", "-t", f"{t1 - t0:.3f}", "-i", src, "-an", "-vf", f"fps={FPS},scale={w}:{h}{extra}",
               "-f", "rawvideo", "-pix_fmt", "gray", "-", capture=True)
    return np.frombuffer(r.stdout, np.uint8).reshape(-1, h, w)


def pick_still(s):
    """Sharpest frame in the window -> cleaned full-res BGR still (+ its source time)."""
    t0, t1 = s["win"]
    r = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", f"{t0:.3f}", "-t", f"{t1 - t0:.3f}", "-i", str(SRC[s["src"]]),
                        "-an", "-vf", f"fps={FPS},scale=640:360", "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True)
    scan = np.frombuffer(r.stdout, np.uint8).reshape(-1, 360, 640)
    sharp = [cv2.Laplacian(f, cv2.CV_64F).var() for f in scan]
    k = int(np.argmax(sharp))
    # Same decode chain, so frame k is the frame we scored. Light spatial denoise only.
    r = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", f"{t0:.3f}", "-t", f"{t1 - t0:.3f}", "-i", str(SRC[s["src"]]),
                        "-an", "-vf", f"fps={FPS},select='eq(n,{k})',hqdn3d=3:2:0:0", "-fps_mode", "passthrough", "-frames:v", "1",
                        "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], capture_output=True)
    still = np.frombuffer(r.stdout, np.uint8).reshape(SRC_H, SRC_W, 3)
    return still, t0 + k / FPS, sharp[k]


def smoothstep(u):
    return u * u * (3 - 2 * u)


def render_move(base, out_size, dur, zoom, cx, aspect):
    """Yield eased sub-pixel warps of `base` (BGR) framing a window of `aspect` (w/h) around cx.

    The window at zoom z is (base_h / z) tall (and aspect * that wide), centred at
    cx * base_w. Frames are produced with WARP_INVERSE_MAP so the mapping is
    exact and fractional — no integer crop steps, hence no judder.
    """
    bh, bw = base.shape[:2]
    ow, oh = out_size
    n = round(dur * FPS)
    for i in range(n):
        p = smoothstep(i / max(n - 1, 1))
        z = zoom[0] + (zoom[1] - zoom[0]) * p
        h = bh / z
        w = h * aspect
        x = (cx[0] + (cx[1] - cx[0]) * p) * bw - w / 2
        x = min(max(x, 0.0), bw - w)
        y = (bh - h) / 2
        m = np.array([[w / ow, 0, x], [0, h / oh, y]], np.float64)
        yield cv2.warpAffine(base, m, (ow, oh), flags=cv2.INTER_LANCZOS4 | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)


def encode_frames(frames, size, out):
    """Stream raw frames into x264 (a 4 s shot is ~600 MB raw, so never buffer it)."""
    w, h = size
    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{w}x{h}",
           "-r", str(FPS), "-i", "-", "-an", "-vf", "format=yuv420p,setsar=1,settb=AVTB",
           "-c:v", "libx264", "-preset", "fast", "-crf", "12", str(out)]
    print("  $", " ".join(cmd[:12]), "...", flush=True)
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for f in frames:
        p.stdin.write(f.tobytes())
    p.stdin.close()
    if p.wait():
        sys.exit(f"command failed: ffmpeg encode {out}")


def build_shot(i, s):
    land, port = TMP / f"{key(s)}_land.mp4", TMP / f"{key(s)}_port.mp4"
    still, t, sharp = pick_still(s)
    print(f"[{i:02d}] {s['name']}  still @ {s['src']} {t:.2f}s (sharpness {sharp:.0f})")
    cv2.imwrite(str(TMP / f"{key(s)}_still.jpg"), cv2.resize(still, (1280, 720), interpolation=cv2.INTER_AREA), [cv2.IMWRITE_JPEG_QUALITY, 88])
    # Mild zooms warp from a pre-shrunk base (keeps the final scale step ~0.75-0.8, no aliasing);
    # tight windows would be upscaled from it, so they warp straight from the 4K still.
    base = still if max(s["zoom"]) > 1.3 else cv2.resize(still, LAND_BASE, interpolation=cv2.INTER_AREA)
    encode_frames(render_move(base, LAND_OUT, s["dur"], s["zoom"], s["cx"], 16 / 9), LAND_OUT, land)
    encode_frames(render_move(still, PORT_OUT, s["dur"], s["zoom"], s["pcx"], 9 / 16), PORT_OUT, port)
    return land, port


# ── assembly ─────────────────────────────────────────────────────────────────

def concat(shots, orientation):
    """Dissolve chain + loop wrap + grade -> high-quality intermediate. Returns (path, cue times)."""
    n = len(shots)
    inputs = []
    for p in shots + [shots[0]]:
        inputs += ["-i", p]
    parts = [f"[0:v]trim=start={LOOP},setpts=PTS-STARTPTS[a0]", f"[{n}:v]trim=end={LOOP},setpts=PTS-STARTPTS[head]"]
    prev, off, cues = "a0", EDL[0]["dur"] - LOOP - XFADE, [0.0]
    for k in range(1, n):
        parts.append(f"[{prev}][{k}:v]xfade=transition=fade:duration={XFADE}:offset={off:.3f}[x{k}]")
        cues.append(round(off + XFADE / 2, 2))
        prev, off = f"x{k}", off + EDL[k]["dur"] - XFADE
    parts.append(f"[{prev}][head]xfade=transition=fade:duration={LOOP}:offset={off:.3f},{GRADE}[v]")
    out = TMP / f"loop_{orientation}.mp4"
    ffmpeg(*inputs, "-filter_complex", ";".join(parts), "-map", "[v]", "-c:v", "libx264", "-preset", "fast", "-crf", "12", "-an", out)
    return out, cues


def encode(src, orientation):
    """Two-pass ABR: lands on the size budget with the bits spent where the picture needs them."""
    out = OUT / f"tour-{orientation}.mp4"
    dur = probe_duration(src)
    kbps = int(BUDGET[orientation] * 8 / dur / 1000 * 0.95)   # 5 % headroom for the container
    common = ["-i", src, "-c:v", "libx264", "-profile:v", "high", "-level", "4.1", "-pix_fmt", "yuv420p", "-preset", "slow",
              "-b:v", f"{kbps}k", "-maxrate", f"{int(kbps * 1.6)}k", "-bufsize", f"{kbps * 3}k",
              "-g", "48", "-keyint_min", "24", "-an", "-passlogfile", (TMP / f"pass-{orientation}").as_posix()]
    ffmpeg(*common, "-pass", "1", "-f", "null", "-")
    ffmpeg(*common, "-pass", "2", "-movflags", "+faststart", out)
    print(f"  {out}  {dur:.1f} s @ {kbps} kbps  ->  {out.stat().st_size / 1e6:.2f} MB")
    # WebP straight from the master at full res: the poster is the LCP image and
    # is all a low-power device ever sees, so it must not go through a JPEG step
    # or optimize-images.mjs's 1600 px cap.
    poster = OUT / f"tour-{orientation}-poster.webp"
    ffmpeg("-i", src, "-frames:v", "1", "-c:v", "libwebp", "-quality", "88", "-compression_level", "6", poster)
    print(f"  {poster}  {poster.stat().st_size / 1e3:.0f} KB")
    return out


def write_cues(cues):
    rows = [dict(at=at, name=s["name"], blurb=s["blurb"]) for at, s in zip(cues, EDL)]
    body = ",\n".join("  " + json.dumps(r, ensure_ascii=False) for r in rows)
    CUES_JS.write_text(
        "// Generated by scripts/build-hero-tour.py — edit the EDL there, not this file.\n"
        "// `at` = seconds into public/hero/tour-*.mp4 at which each zone caption takes over.\n"
        f"export const TOUR_CUES = [\n{body},\n];\n",
        encoding="utf-8",
    )
    print(f"  {CUES_JS}: {len(rows)} cues, last at {cues[-1]} s")


def qa(out, orientation, cues):
    """Runnable check: no border frames, no soft second, no residual jitter; sheets to eyeball."""
    w, h = LAND_OUT if orientation == "landscape" else PORT_OUT
    r = run(["ffmpeg", "-hide_banner", "-i", out, "-vf", "cropdetect=limit=24:round=2:reset=1", "-f", "null", "-"], capture=True)
    log = r.stderr.decode("utf-8", "replace")
    bad = [(float(t), c) for t, c in re.findall(r"t:([\d.]+).*?crop=(\d+:\d+:\d+:\d+)", log) if not c.startswith(f"{w}:{h}:0:0")]
    print(f"  [{orientation}] border frames: {len(bad)}" + (f"  e.g. {bad[:5]}" if bad else "  OK"))
    small = (640, 360) if orientation == "landscape" else (360, 640)
    fr8 = raw_frames(out, 0, probe_duration(out) + 1, *small)
    sharp = [cv2.Laplacian(f, cv2.CV_64F).var() for f in fr8]
    fr = fr8.astype(np.float32)
    sec = {}
    for i, v in enumerate(sharp):
        sec[i // FPS] = min(sec.get(i // FPS, 1e9), v)
    soft = {k: round(v) for k, v in sec.items() if v < SHARP_FLOOR}
    print(f"  [{orientation}] {len(fr)} frames, {len(fr) / FPS:.1f} s; per-second min sharpness floor {SHARP_FLOOR}: " + (f"soft seconds {soft}" if soft else "OK"))
    # Residual jitter: high-pass of frame-to-frame global motion, per shot (dissolve frames excluded).
    d = np.array([cv2.phaseCorrelate(fr[i - 1], fr[i])[0] for i in range(1, len(fr))])
    hp = d - np.stack([np.convolve(d[:, j], np.ones(9) / 9, mode="same") for j in range(2)], 1)
    edges = [int(c * FPS) for c in cues] + [len(fr)]
    worst = 0.0
    for k in range(len(cues)):
        a, b = edges[k] + int(XFADE * FPS), edges[k + 1] - int(XFADE * FPS / 2)
        if b > a:
            worst = max(worst, float(np.sqrt(np.mean(hp[a:b] ** 2))))
    print(f"  [{orientation}] worst per-shot jitter {worst:.2f} px rms @640 (limit {JITTER_MAX}): " + ("OK" if worst <= JITTER_MAX else "FAIL"))
    ffmpeg("-i", out, "-vf", "fps=2,scale=240:-1,tile=8x8:padding=2:color=0x2E8DFF", "-frames:v", "1", TMP / f"qa-{orientation}.jpg")
    ffmpeg("-i", out, "-vf", f"select='gte(n,{len(fr) - 4})+lt(n,4)',scale=320:-1,tile=8x1:padding=2:color=0x2E8DFF", "-fps_mode", "passthrough", "-frames:v", "1", TMP / f"seam-{orientation}.jpg")
    print(f"  sheets: {TMP / f'qa-{orientation}.jpg'}  {TMP / f'seam-{orientation}.jpg'} (tiles: last 4 frames | first 4 frames)")
    return worst <= JITTER_MAX and not bad


def main():
    os.chdir(ROOT)
    validate()
    ensure_sources()
    TMP.mkdir(exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)

    print(">> Stills + synthetic camera moves")
    land, port = zip(*[build_shot(i, s) for i, s in enumerate(EDL, 1)])
    ok = True
    for orientation, shots in (("landscape", list(land)), ("portrait", list(port))):
        print(f">> {orientation}: dissolves + loop + grade")
        loop, cues = concat(shots, orientation)
        print(f">> {orientation}: encode")
        out = encode(loop, orientation)
        print(f">> {orientation}: QA")
        ok &= qa(out, orientation, cues)
    write_cues(cues)
    print(">> Done." if ok else ">> Done, but QA flagged a problem above.", "Intermediates and QA sheets are in .hero-tmp/ (gitignored).")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
