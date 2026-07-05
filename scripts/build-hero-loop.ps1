$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$Ffmpeg = Join-Path $Root "node_modules\ffmpeg-static\ffmpeg.exe"
$Assets = Join-Path $Root "assets"
$Out = Join-Path $Root "public\hero"
New-Item -ItemType Directory -Force -Path $Out | Out-Null

$InputPattern = Join-Path $Assets "frame%05d.png"
$Mp4 = Join-Path $Out "facility-loop.mp4"
$Webm = Join-Path $Out "facility-loop.webm"
$Poster = Join-Path $Out "facility-poster.jpg"

# Facility-only tour loop:
# frames 00001-00074 move through the turf lane, rig zone, and strength room.
# Keep the source cadence slow. These frames are sampled from footage, so
# over-cranking or optical blending makes the tour look jumpy/ghosted.
$filter = @"
[0:v]scale=1920:1080:flags=lanczos,setsar=1,
fps=24,
eq=brightness=-0.015:contrast=1.08:saturation=0.96,
colorbalance=bs=0.030:bm=0.010,
vignette=angle=PI/5,
format=yuv420p[v]
"@

Write-Host ">> Rendering calm facility tour MP4 (H.264)..."
& $Ffmpeg -y -framerate 2 -start_number 1 -i $InputPattern `
  -filter_complex $filter -map "[v]" -an `
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 21 -preset slow `
  -maxrate 5M -bufsize 10M -movflags +faststart `
  $Mp4
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ">> Rendering WebM fallback (VP9)..."
& $Ffmpeg -y -i $Mp4 `
  -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 -deadline good -cpu-used 4 -an `
  $Webm
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ">> Poster frame..."
& $Ffmpeg -y -i $Mp4 -ss 0.5 -frames:v 1 -q:v 3 -update 1 $Poster
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Get-Item $Mp4, $Webm, $Poster |
  Select-Object FullName, Length, LastWriteTime
