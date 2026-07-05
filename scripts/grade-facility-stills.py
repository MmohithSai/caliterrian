#!/usr/bin/env python
"""Bake the site's cinematic grade into the facility stills.

Matches the hero video grade (scripts/build-hero-cinematic.sh: contrast 1.06,
saturation 0.95, blue-leaning shadows, soft vignette) and adds a haze cut +
highlight roll-off, because the stills were shot in bright daylight and read
washed-out against the dark navy theme (#05080D / #0B1016, accent #2E8DFF).

Grades in place: public/facility/panorama.jpg + public/facility/cards/*.jpg.
Idempotent: on first run the pristine images are cached in
scripts/facility-originals/ (gitignored); every run grades FROM that cache,
so constants can be re-tuned and the script re-run safely.
"""
import shutil
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
FACILITY = ROOT / "public" / "facility"
CACHE = ROOT / "scripts" / "facility-originals"

# ── Grade constants ────────────────────────────────────────────────────────
# Cards live inside the already-graded 3D gallery shader, so they take the
# full moody grade. The panorama renders large under a page scrim — it gets a
# brighter, punchier variant or it reads dull.
CARDS_GRADE = dict(
    black_point=0.040,   # haze cut: deepen the washed-out blacks
    mid_gamma=1.16,      # >1 darkens mids toward the site's moody exposure
    hi_knee=0.74,        # highlights above this get compressed…
    hi_slope=0.60,       # …at this slope (tames the blown sheet-metal walls)
    contrast=1.06,       # matches hero eq=contrast=1.06
    saturation=0.94,     # matches hero eq=saturation=0.95 (hair tighter)
    shadow_tint=(-0.012, 0.004, 0.040),  # navy-blue shadow lean
    hilite_tint=(-0.006, 0.000, 0.010),  # keep whites cool, not warm
    vignette=0.16,       # corner falloff strength (hero vignette=PI/6 is mild)
)
PANORAMA_GRADE = dict(
    black_point=0.040,
    mid_gamma=0.94,      # lift the mids — this shot must read bright and open
    hi_knee=0.84,
    hi_slope=0.78,
    contrast=1.12,       # extra pop instead of extra darkness
    saturation=1.08,     # vibrance so turf/rig colors carry the shot
    shadow_tint=(-0.010, 0.003, 0.032),
    hilite_tint=(-0.004, 0.000, 0.008),
    vignette=0.06,
)


def grade(img: np.ndarray, p: dict) -> np.ndarray:
    """img: float32 HxWx3 in 0..1 → graded 0..1."""
    # haze cut / black point
    img = np.clip((img - p["black_point"]) / (1.0 - p["black_point"]), 0.0, 1.0)
    # mid-tone exposure pull
    img = img ** p["mid_gamma"]
    # soft highlight roll-off
    hi = img > p["hi_knee"]
    img[hi] = p["hi_knee"] + (img[hi] - p["hi_knee"]) * p["hi_slope"]
    # contrast around mid-grey
    img = np.clip((img - 0.5) * p["contrast"] + 0.5, 0.0, 1.0)

    # split-tone: cool the shadows toward navy, keep highlights cool-neutral
    lum = img @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    shadow_w = (1.0 - lum) ** 2
    hilite_w = lum ** 2
    img = img + shadow_w[..., None] * np.array(p["shadow_tint"], dtype=np.float32) \
              + hilite_w[..., None] * np.array(p["hilite_tint"], dtype=np.float32)

    # saturation trim (or slight vibrance when > 1)
    lum = np.clip(img, 0, 1) @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    img = lum[..., None] + (img - lum[..., None]) * p["saturation"]

    # gentle radial vignette
    h, w = img.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r2 = ((xx / w - 0.5) * 2) ** 2 + ((yy / h - 0.5) * 2) ** 2
    img = img * (1.0 - p["vignette"] * (r2 / 2.0) ** 1.4)[..., None]

    return np.clip(img, 0.0, 1.0)


def main():
    sources = [FACILITY / "panorama.jpg", *sorted((FACILITY / "cards").glob("*.jpg"))]
    CACHE.mkdir(exist_ok=True)
    (CACHE / "cards").mkdir(exist_ok=True)

    for src in sources:
        rel = src.relative_to(FACILITY)
        cached = CACHE / rel
        if not cached.exists():
            shutil.copy2(src, cached)  # seed cache with the pristine original
        params = PANORAMA_GRADE if src.name == "panorama.jpg" else CARDS_GRADE
        im = Image.open(cached).convert("RGB")
        arr = np.asarray(im, dtype=np.float32) / 255.0
        out = (grade(arr, params) * 255.0 + 0.5).astype(np.uint8)
        Image.fromarray(out).save(src, quality=86, subsampling=1, optimize=True)
        print(f"graded {rel}")


if __name__ == "__main__":
    main()
