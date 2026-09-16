// One-shot (and re-runnable) image optimizer: converts every photo under
// public/ to WebP, caps it at a sane width, deletes the JPEG, and rewrites the
// references in src/. Roughly a 4–6× payload cut on the image-heavy pages.
//
//   node scripts/optimize-images.mjs          # convert + rewrite refs
//   node scripts/optimize-images.mjs --dry    # report only
//
// Frame sequences are skipped: they're hundreds of near-identical files that
// are already tiny per frame, and re-encoding them costs more than it saves.
import { execFileSync } from "node:child_process";
import { readdirSync, statSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join, extname, relative, sep } from "node:path";

const DRY = process.argv.includes("--dry");
const SKIP_DIRS = new Set(["muscleup-cinematic", "pushup", "running"]);
const MAX_WIDTH = 1600;
const PORTRAIT_MAX_WIDTH = 1200; // 4:5 story crops don't need more
// Full-bleed media is drawn at viewport width, so a 2x screen wants ~2560 px —
// 1600 left the panorama (which a 116 % parallax layer overscans to ~1420 CSS px)
// and the hero poster visibly soft. Anything under these paths keeps its pixels.
const FULL_BLEED = /[\\/](hero|facility)[\\/]/;
const FULL_BLEED_MAX_WIDTH = 2560;
const QUALITY = 80;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(p, out);
    } else if (/^\.jpe?g$/i.test(extname(name)) && !name.startsWith("og-image")) {
      out.push(p);
    }
  }
  return out;
}

const probe = (file) =>
  JSON.parse(
    execFileSync("ffprobe", [
      "-v", "error", "-select_streams", "v:0",
      "-show_entries", "stream=width,height",
      "-of", "json", file,
    ]).toString()
  ).streams[0];

const jpegs = walk("public");
let before = 0;
let after = 0;

for (const src of jpegs) {
  const dest = src.replace(/\.jpe?g$/i, ".webp");
  const { width, height } = probe(src);
  const cap = FULL_BLEED.test(src)
    ? FULL_BLEED_MAX_WIDTH
    : height > width ? PORTRAIT_MAX_WIDTH : MAX_WIDTH;
  const scale = width > cap ? `scale=${cap}:-2` : "scale=trunc(iw/2)*2:trunc(ih/2)*2";

  before += statSync(src).size;
  if (DRY) continue;

  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error", "-i", src,
    "-vf", scale,
    "-c:v", "libwebp", "-quality", String(QUALITY), "-compression_level", "6",
    dest,
  ]);
  after += statSync(dest).size;
  unlinkSync(src);
}

// Rewrite every "/path/foo.jpg" reference (query strings and all) in src/.
const codeFiles = (function collect(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) collect(p, out);
    else if (/\.(jsx?|css)$/.test(name)) out.push(p);
  }
  return out;
})("src");

// Frame-sequence paths keep their JPEGs, and the OG image must stay a format
// every link scraper understands — WebP previews break on several of them.
const skipRe = new RegExp(`/(${[...SKIP_DIRS].join("|")})/|og-image`);
let touched = 0;
for (const file of codeFiles) {
  const text = readFileSync(file, "utf8");
  const next = text.replace(/\.jpe?g\b/gi, (m, i) => {
    // Leave frame-sequence paths alone — those files are still JPEG.
    const lineStart = text.lastIndexOf("\n", i) + 1;
    return skipRe.test(text.slice(lineStart, i)) ? m : ".webp";
  });
  if (next !== text && !DRY) {
    writeFileSync(file, next);
    touched++;
  }
}

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;
console.log(
  DRY
    ? `${jpegs.length} JPEGs, ${mb(before)} — run without --dry to convert`
    : `${jpegs.length} JPEGs → WebP: ${mb(before)} → ${mb(after)} (${Math.round((1 - after / before) * 100)}% smaller), ${touched} source files updated`
);
