#!/usr/bin/env bash
# Builds a dynamic, looping facility-tour hero video from the facility frames.
# Output: public/hero/facility-loop.mp4 + .webm + facility-poster.jpg
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FF="$ROOT/node_modules/ffmpeg-static/ffmpeg.exe"
A="$ROOT/assets"
OUT="$ROOT/public/hero"
mkdir -p "$OUT"

INPUT="$A/frame%05d.png"
MP4="$OUT/facility-loop.mp4"
WEBM="$OUT/facility-loop.webm"
POSTER="$OUT/facility-poster.jpg"

# Facility-only tour loop:
# frames 00001-00074 move through the turf lane, rig zone, and strength room.
# Keep the source cadence slow. These frames are sampled from footage, so
# over-cranking or optical blending makes the tour look jumpy/ghosted.
FILTER="
[0:v]scale=1920:1080:flags=lanczos,setsar=1,
fps=24,
eq=brightness=-0.015:contrast=1.08:saturation=0.96,
colorbalance=bs=0.030:bm=0.010,
vignette=angle=PI/5,
format=yuv420p[v]
"

echo ">> Rendering calm facility tour MP4 (H.264)..."
"$FF" -y -framerate 2 -start_number 1 -i "$INPUT" \
  -filter_complex "$FILTER" \
  -map "[v]" -an \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 21 -preset slow \
  -maxrate 5M -bufsize 10M -movflags +faststart \
  "$MP4"

echo ">> Rendering WebM fallback (VP9)..."
"$FF" -y -i "$MP4" \
  -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 -deadline good -cpu-used 4 -an \
  "$WEBM"

echo ">> Poster frame..."
"$FF" -y -i "$MP4" -ss 0.5 -frames:v 1 -q:v 3 -update 1 "$POSTER"

echo ">> Done:"
ls -la "$MP4" "$WEBM" "$POSTER"
