#!/usr/bin/env bash
# Builds the cinematic looping hero video from the real facility walkthrough
# footage (gym assets/IMG_4024.MOV). The FULL UNCUT tour — every shot, every
# frame, 0 → 44.5s, nothing trimmed (owner's explicit brief: do not miss any
# shots). The walkthrough covers, in order: performance lane → freestyle
# (crash mats, foam cubes, climbing rope) → functional rig → stretching
# runway → squat/power racks + lifting platform → dumbbell rack →
# conditioning corner → calisthenics bars (pull-up, parallel, rings).
# The whole clip is stabilized (vidstab two-pass) and lightly graded; the
# tail dissolves back into the head so the loop is seamless.
# Output: public/hero/facility-cinematic.mp4 + .webm + facility-cinematic-poster.jpg
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FF="${FFMPEG:-ffmpeg}"
FP="${FFPROBE:-ffprobe}"
SRC="$ROOT/gym assets/IMG_4024.MOV"
OUT="$ROOT/public/hero"
# Relative temp dir: absolute Windows paths (C:/...) break ffmpeg filter
# option parsing (the drive colon reads as an option separator).
cd "$ROOT"
TMP=".hero-tmp"
trap 'rm -rf "$ROOT/$TMP"' EXIT
mkdir -p "$TMP" "$OUT"

SLOW=1.0          # retime factor (1.0 = natural speed, no interpolation pass)
LOOP=1.2          # tail -> head loop crossfade seconds

# Gentle premium grade — keeps the footage clear and legible: neutral
# brightness, mild contrast lift, slight desaturation, blue-leaning shadows,
# weak vignette. Text contrast comes from localized page scrims, not from
# darkening the whole reel.
GRADE="eq=contrast=1.06:saturation=0.95,colorbalance=bs=0.03:bm=0.012,vignette=angle=PI/6,format=yuv420p"

dur() { "$FP" -v error -show_entries format=duration -of csv=p=0 "$1"; }

RETIME=""
if [ "$SLOW" != "1.0" ]; then
  RETIME=",setpts=PTS/$SLOW,minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1"
fi

echo ">> [full tour] stabilization pass 1 (detect)..."
"$FF" -y -loglevel error -i "$SRC" \
  -vf "scale=1920:1080:flags=lanczos,vidstabdetect=shakiness=6:accuracy=15:result=$TMP/full.trf" \
  -f null -
echo ">> [full tour] stabilize + retime ${SLOW}x + grade..."
"$FF" -y -loglevel error -i "$SRC" \
  -vf "scale=1920:1080:flags=lanczos,vidstabtransform=input=$TMP/full.trf:smoothing=40:zoom=6:interpol=bicubic:crop=black$RETIME,$GRADE" \
  -an -c:v libx264 -crf 14 -preset medium "$TMP/full.mp4"
CUR="$TMP/full.mp4"

echo ">> Wrapping seamless loop..."
DC="$(dur "$CUR")"
LOFF="$(awk -v d="$DC" -v l="$LOOP" 'BEGIN{printf "%.3f", d-2*l}')"
"$FF" -y -loglevel error -i "$CUR" \
  -filter_complex "[0:v]split[m][h];[m]trim=start=$LOOP,setpts=PTS-STARTPTS[main];[h]trim=end=$LOOP,setpts=PTS-STARTPTS[head];[main][head]xfade=transition=fade:duration=$LOOP:offset=$LOFF[v]" \
  -map "[v]" -an -c:v libx264 -crf 14 -preset medium "$TMP/loop.mp4"

echo ">> Final H.264 MP4..."
"$FF" -y -loglevel error -i "$TMP/loop.mp4" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 21 -preset slow \
  -maxrate 4500k -bufsize 9000k -movflags +faststart -an \
  "$OUT/facility-cinematic.mp4"

echo ">> WebM (VP9)..."
"$FF" -y -loglevel error -i "$TMP/loop.mp4" \
  -c:v libvpx-vp9 -b:v 0 -crf 32 -row-mt 1 -deadline good -cpu-used 3 -an \
  "$OUT/facility-cinematic.webm"

echo ">> Poster (first loop frame)..."
"$FF" -y -loglevel error -i "$OUT/facility-cinematic.mp4" \
  -frames:v 1 -q:v 3 -update 1 "$OUT/facility-cinematic-poster.jpg"

echo ">> Done:"
ls -la "$OUT/facility-cinematic.mp4" "$OUT/facility-cinematic.webm" "$OUT/facility-cinematic-poster.jpg"
