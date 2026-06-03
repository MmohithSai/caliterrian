import { useEffect, useRef, useState, useCallback } from "react";
import { useScroll, useSpring } from "framer-motion";

const DEFAULT_SPRING = { stiffness: 220, damping: 38, mass: 0.18 };

/* ──────────────────────────────────────────────────────────
   Utility: fit a source rect into a target rect
   ────────────────────────────────────────────────────────── */
function fitRect(srcW, srcH, tgtW, tgtH, mode, ax = 0.5, ay = 0.5) {
  const scale =
    mode === "cover"
      ? Math.max(tgtW / srcW, tgtH / srcH)
      : Math.min(tgtW / srcW, tgtH / srcH);
  const w = srcW * scale;
  const h = srcH * scale;
  return { x: (tgtW - w) * ax, y: (tgtH - h) * ay, width: w, height: h };
}

/* ──────────────────────────────────────────────────────────
   Eased timing map for muscle-up phases
   Maps linear 0→1 scroll progress to non-linear frame progress
   so the peak muscle-up position lingers dramatically.
   ────────────────────────────────────────────────────────── */
function easedFrameProgress(t) {
  // Phase 1: 0–0.25 scroll → frames 0–0.255  (dead hang → pull, normal)
  // Phase 2: 0.25–0.50 → frames 0.255–0.573  (explosive, slightly faster)
  // Phase 3: 0.50–0.80 → frames 0.573–0.828  (transition – SLOW dramatic)
  // Phase 4: 0.80–1.00 → frames 0.828–1.0    (top hold + finish)
  if (t <= 0.25) return t * 1.02;               // ~normal
  if (t <= 0.50) return 0.255 + (t - 0.25) * 1.272; // slightly faster
  if (t <= 0.80) return 0.573 + (t - 0.50) * 0.85;  // SLOW — dramatic emphasis
  return 0.828 + (t - 0.80) * 0.86;              // wind-down
}

/* ──────────────────────────────────────────────────────────
   Cinematic Hero Portrait Renderer
   Draws the layered composition onto a single canvas:
     L0  Solid dark base
     L1  Atmospheric blurred background
     L2  Cinematic vignette + teal glow
     L3  Sharp foreground athlete with edge blending
     L4  Motion blur ghost (previous frame at low opacity)
     L5  Grain overlay
   ────────────────────────────────────────────────────────── */
function drawCinematicFrame(ctx, canvas, image, opts = {}) {
  const {
    prevImage = null,
    scrollProgress = 0,
    driftX = 0,
  } = opts;

  const cw = canvas.width;
  const ch = canvas.height;
  const srcW = image.naturalWidth;
  const srcH = image.naturalHeight;

  // ── L0: Solid base ──
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#0A0A0A";
  ctx.fillRect(0, 0, cw, ch);

  // ── L1: Atmospheric background ──
  // Enlarged, darkened, blurred, with parallax drift
  ctx.save();
  const bgScale = 2.6;
  const bgW = srcW * bgScale;
  const bgH = srcH * bgScale;
  // Cover the canvas
  const bgFit = fitRect(bgW, bgH, cw, ch, "cover");
  // Parallax: bg moves at 30% of scroll speed
  const parallaxY = (scrollProgress - 0.5) * ch * 0.08;
  const bgX = bgFit.x + driftX * 0.5;
  const bgY = bgFit.y + parallaxY;

  // Draw blurred + darkened background
  ctx.filter = "blur(14px) saturate(0.6) brightness(0.32)";
  ctx.drawImage(image, bgX, bgY, bgFit.width, bgFit.height);
  ctx.filter = "none";

  // Subtle teal tint over background
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#1a6b63";
  ctx.fillRect(0, 0, cw, ch);
  ctx.globalAlpha = 1;
  ctx.restore();

  // ── L2: Cinematic vignette ──
  ctx.save();
  // Radial vignette — dark edges, bright center
  const vigGrad = ctx.createRadialGradient(
    cw * 0.5, ch * 0.48, Math.min(cw, ch) * 0.25,
    cw * 0.5, ch * 0.5, Math.max(cw, ch) * 0.78
  );
  vigGrad.addColorStop(0, "rgba(0,0,0,0)");
  vigGrad.addColorStop(0.5, "rgba(0,0,0,0.15)");
  vigGrad.addColorStop(1, "rgba(0,0,0,0.65)");
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, cw, ch);

  // Teal atmospheric glow — intensifies at peak
  const glowIntensity = 0.06 + scrollProgress * 0.12;
  const tealGrad = ctx.createRadialGradient(
    cw * 0.52, ch * 0.4, 0,
    cw * 0.52, ch * 0.4, ch * 0.7
  );
  tealGrad.addColorStop(0, `rgba(46, 196, 182, ${glowIntensity})`);
  tealGrad.addColorStop(0.4, `rgba(46, 196, 182, ${glowIntensity * 0.3})`);
  tealGrad.addColorStop(1, "rgba(46, 196, 182, 0)");
  ctx.fillStyle = tealGrad;
  ctx.fillRect(0, 0, cw, ch);
  ctx.restore();

  // ── L4: Motion blur ghost (previous frame underneath) ──
  if (prevImage && prevImage.complete && prevImage.naturalWidth > 0) {
    ctx.save();
    ctx.globalAlpha = 0.1;
    const prevFg = fitRect(prevImage.naturalWidth, prevImage.naturalHeight, cw, ch * 0.85, "contain", 0.5, 0.5);
    const prevX = (cw - prevFg.width) / 2 + driftX;
    const prevY = (ch - prevFg.height) / 2;
    ctx.filter = "saturate(0.7) contrast(1.05) brightness(0.85)";
    ctx.drawImage(prevImage, prevX, prevY, prevFg.width, prevFg.height);
    ctx.filter = "none";
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ── L3: Sharp foreground athlete ──
  ctx.save();
  // Subtle scale progression: 1.0 → 1.08
  const athleteScale = 1.0 + scrollProgress * 0.08;
  const fgH = ch * 0.85 * athleteScale;
  const fgFit = fitRect(srcW, srcH, cw, fgH, "contain", 0.5, 0.5);
  const fgX = (cw - fgFit.width) / 2 + driftX;
  const fgY = (ch - fgFit.height) / 2;

  // Cinematic color grading
  ctx.filter = "saturate(0.82) contrast(1.14) brightness(0.9)";
  ctx.drawImage(image, fgX, fgY, fgFit.width, fgFit.height);
  ctx.filter = "none";

  // ── Edge blending masks ──
  // Left edge fade
  const leftGrad = ctx.createLinearGradient(fgX, 0, fgX + fgFit.width * 0.18, 0);
  leftGrad.addColorStop(0, "rgba(10, 10, 10, 0.85)");
  leftGrad.addColorStop(0.5, "rgba(10, 10, 10, 0.3)");
  leftGrad.addColorStop(1, "rgba(10, 10, 10, 0)");
  ctx.fillStyle = leftGrad;
  ctx.fillRect(fgX, fgY, fgFit.width * 0.18, fgFit.height);

  // Right edge fade
  const rightX = fgX + fgFit.width * 0.82;
  const rightGrad = ctx.createLinearGradient(rightX, 0, fgX + fgFit.width, 0);
  rightGrad.addColorStop(0, "rgba(10, 10, 10, 0)");
  rightGrad.addColorStop(0.5, "rgba(10, 10, 10, 0.3)");
  rightGrad.addColorStop(1, "rgba(10, 10, 10, 0.85)");
  ctx.fillStyle = rightGrad;
  ctx.fillRect(rightX, fgY, fgFit.width * 0.18, fgFit.height);

  // Bottom edge fade
  const bottomY = fgY + fgFit.height * 0.78;
  const bottomGrad = ctx.createLinearGradient(0, bottomY, 0, fgY + fgFit.height);
  bottomGrad.addColorStop(0, "rgba(10, 10, 10, 0)");
  bottomGrad.addColorStop(0.4, "rgba(10, 10, 10, 0.35)");
  bottomGrad.addColorStop(1, "rgba(10, 10, 10, 0.95)");
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(fgX, bottomY, fgFit.width, fgFit.height * 0.22);

  // Top edge fade
  const topGrad = ctx.createLinearGradient(0, fgY, 0, fgY + fgFit.height * 0.12);
  topGrad.addColorStop(0, "rgba(10, 10, 10, 0.7)");
  topGrad.addColorStop(1, "rgba(10, 10, 10, 0)");
  ctx.fillStyle = topGrad;
  ctx.fillRect(fgX, fgY, fgFit.width, fgFit.height * 0.12);

  ctx.restore();

  // ── L5: Rim light / bloom at peak ──
  if (scrollProgress > 0.5) {
    ctx.save();
    const bloomStrength = Math.min(1, (scrollProgress - 0.5) * 2.5) * 0.18;
    const rimGrad = ctx.createRadialGradient(
      cw * 0.5, ch * 0.35, fgFit.width * 0.15,
      cw * 0.5, ch * 0.45, fgFit.width * 0.6
    );
    rimGrad.addColorStop(0, `rgba(46, 196, 182, ${bloomStrength})`);
    rimGrad.addColorStop(0.5, `rgba(46, 196, 182, ${bloomStrength * 0.3})`);
    rimGrad.addColorStop(1, "rgba(46, 196, 182, 0)");
    ctx.fillStyle = rimGrad;
    ctx.fillRect(0, 0, cw, ch);
    ctx.restore();
  }

  // ── Grain overlay ──
  drawGrain(ctx, cw, ch, 0.035);
}

/* ──────────────────────────────────────────────────────────
   Film grain overlay — removes digital flatness
   Uses a static cached grain texture for performance
   ────────────────────────────────────────────────────────── */
let _grainCanvas = null;
let _grainSize = { w: 0, h: 0 };

function ensureGrainCanvas(w, h) {
  // Round to nearest 256px to avoid recreation on every resize
  const gw = Math.ceil(w / 256) * 256;
  const gh = Math.ceil(h / 256) * 256;
  if (_grainCanvas && _grainSize.w === gw && _grainSize.h === gh) return _grainCanvas;

  _grainCanvas = document.createElement("canvas");
  _grainCanvas.width = gw;
  _grainCanvas.height = gh;
  const gCtx = _grainCanvas.getContext("2d");
  const imgData = gCtx.createImageData(gw, gh);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
    d[i + 3] = 255;
  }
  gCtx.putImageData(imgData, 0, 0);
  _grainSize = { w: gw, h: gh };
  return _grainCanvas;
}

function drawGrain(ctx, w, h, opacity) {
  const grain = ensureGrainCanvas(w, h);
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation = "overlay";
  // Offset the grain slightly each frame to prevent static pattern
  const ox = (Math.random() * 64) | 0;
  const oy = (Math.random() * 64) | 0;
  ctx.drawImage(grain, -ox, -oy, grain.width, grain.height);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.restore();
}

/* ──────────────────────────────────────────────────────────
   React hook: useImageSequenceCanvas
   Drives a <canvas> from scroll progress with cross-fading
   between adjacent frames for continuous-video feel.
   ────────────────────────────────────────────────────────── */
export function useImageSequenceCanvas({
  containerRef,
  frameCount,
  framePath,
  springConfig,
  renderMode = "source",
  // Optional peak-hold: if peakFrameIndex is set, scroll progresses 0 -> 1,
  // but the frame stops advancing at peakFrameIndex once scroll reaches
  // peakAtScroll. Useful for cinematic holds where the body movement
  // completes but text/CTAs continue revealing over the held frame.
  peakFrameIndex = null,
  peakAtScroll = 0.85,
}) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const smoothed = useSpring(scrollYProgress, springConfig ?? DEFAULT_SPRING);

  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const rafRef = useRef(null);
  const pendingRef = useRef(0);
  const prevFrameRef = useRef(0);
  const driftRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const drawAt = useCallback((v) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const clamped = Math.max(0, Math.min(1, v));
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // ── hero-cinematic-pre: frames are PRE-GRADED ──
    // Color, vignette, atmospheric depth, rim and crop are baked into the
    // source image. The canvas does the minimum work: object-fit cover draw
    // with a single alpha cross-fade between adjacent frames. This is what
    // gives the scroll its silky feel.
    if (renderMode === "hero-cinematic-pre") {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round((rect.width || 1920) * dpr));
      const height = Math.max(1, Math.round((rect.height || 1080) * dpr));
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;

      const lastIdx = frameCount - 1;

      // Peak-hold timing: map scroll [0..peakAtScroll] -> frame [0..peak],
      // then hold the peak frame for the rest of the scroll. The brand and
      // CTA reveals (driven separately by raw `smoothed`) play over the
      // held peak frame, creating the "stopped at the top of the muscle-up"
      // beat the user asked for.
      let fIdx;
      if (peakFrameIndex !== null && peakFrameIndex >= 0) {
        const peakIdx = Math.min(lastIdx, peakFrameIndex);
        if (clamped >= peakAtScroll) {
          fIdx = peakIdx;
        } else {
          const n = clamped / peakAtScroll; // 0..1 during ascent
          // The source clip holds in dead hang for roughly the first 55%
          // of its frames before any visible movement starts. With a
          // straight linear or ease-in mapping, scroll progress out-runs
          // the visible action and labels like "DRIVE." appear while the
          // athlete is still hanging.
          //
          // Piecewise curve:
          //   First 30% of scroll  -> cover the dead-hang frames quickly
          //                            (output 0 -> 0.55)
          //   Last  70% of scroll  -> linear cover of active pull, break
          //                            through, lockout (0.55 -> 1)
          // so each meaningful phase of the rep occupies its own slice of
          // scroll and the text labels stay synced with what's on screen.
          const DEAD_HANG_FRAME_RATIO = 0.55;
          const DEAD_HANG_SCROLL_RATIO = 0.30;
          let eased;
          if (n < DEAD_HANG_SCROLL_RATIO) {
            eased = (n / DEAD_HANG_SCROLL_RATIO) * DEAD_HANG_FRAME_RATIO;
          } else {
            eased =
              DEAD_HANG_FRAME_RATIO +
              ((n - DEAD_HANG_SCROLL_RATIO) /
                (1 - DEAD_HANG_SCROLL_RATIO)) *
                (1 - DEAD_HANG_FRAME_RATIO);
          }
          fIdx = eased * peakIdx;
        }
      } else {
        fIdx = easedFrameProgress(clamped) * lastIdx;
      }

      const baseIdx = Math.floor(fIdx);
      const nextIdx = Math.min(lastIdx, baseIdx + 1);
      const alpha = fIdx - baseIdx;

      const baseImg = imagesRef.current[baseIdx];
      if (!baseImg || !baseImg.complete || baseImg.naturalWidth === 0) return;
      const nextImg = imagesRef.current[nextIdx];

      const fit = fitRect(baseImg.naturalWidth, baseImg.naturalHeight, width, height, "cover");

      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = 1;
      ctx.drawImage(baseImg, fit.x, fit.y, fit.width, fit.height);

      if (
        alpha > 0.01 &&
        nextIdx !== baseIdx &&
        nextImg &&
        nextImg.complete &&
        nextImg.naturalWidth > 0
      ) {
        ctx.globalAlpha = alpha;
        ctx.drawImage(nextImg, fit.x, fit.y, fit.width, fit.height);
        ctx.globalAlpha = 1;
      }

      prevFrameRef.current = baseIdx;
      return;
    }

    if (renderMode === "hero-cinematic") {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round((rect.width || 1920) * dpr));
      const height = Math.max(1, Math.round((rect.height || 1080) * dpr));
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;

      // Apply eased timing to get actual frame progress
      const easedProgress = easedFrameProgress(clamped);
      const lastIdx = frameCount - 1;
      const fIdx = easedProgress * lastIdx;
      const baseIdx = Math.floor(fIdx);
      const nextIdx = Math.min(lastIdx, baseIdx + 1);
      const alpha = fIdx - baseIdx;

      const baseImg = imagesRef.current[baseIdx];
      if (!baseImg || !baseImg.complete || baseImg.naturalWidth === 0) return;
      const nextImg = imagesRef.current[nextIdx];

      // Camera drift — subtle horizontal oscillation
      const time = performance.now() * 0.0003;
      driftRef.current = Math.sin(time) * canvas.width * 0.008;

      // Get previous frame for motion blur
      const prevIdx = Math.max(0, baseIdx - 1);
      const prevImg = imagesRef.current[prevIdx];

      // Clear and draw cinematic composition
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawCinematicFrame(ctx, canvas, baseImg, {
        prevImage: prevIdx !== baseIdx ? prevImg : null,
        scrollProgress: clamped,
        driftX: driftRef.current,
      });

      // Cross-fade to next frame for smooth transitions
      if (
        alpha > 0.01 &&
        nextIdx !== baseIdx &&
        nextImg &&
        nextImg.complete &&
        nextImg.naturalWidth > 0
      ) {
        ctx.save();
        ctx.globalAlpha = alpha;
        drawCinematicFrame(ctx, canvas, nextImg, {
          prevImage: baseImg,
          scrollProgress: clamped,
          driftX: driftRef.current,
        });
        ctx.restore();
      }

      prevFrameRef.current = baseIdx;
      return;
    }

    // ── Default source rendering (unchanged for other sections) ──
    const lastIdx = frameCount - 1;
    const fIdx = clamped * lastIdx;
    const baseIdx = Math.floor(fIdx);
    const nextIdx = Math.min(lastIdx, baseIdx + 1);
    const alpha = fIdx - baseIdx;

    const baseImg = imagesRef.current[baseIdx];
    if (!baseImg || !baseImg.complete || baseImg.naturalWidth === 0) return;

    const nextImg = imagesRef.current[nextIdx];
    const nw = baseImg.naturalWidth;
    const nh = baseImg.naturalHeight;
    if (canvas.width !== nw) canvas.width = nw;
    if (canvas.height !== nh) canvas.height = nh;

    ctx.clearRect(0, 0, nw, nh);
    ctx.globalAlpha = 1;
    ctx.drawImage(baseImg, 0, 0);

    if (
      alpha > 0 &&
      nextIdx !== baseIdx &&
      nextImg &&
      nextImg.complete &&
      nextImg.naturalWidth === nw &&
      nextImg.naturalHeight === nh
    ) {
      ctx.globalAlpha = alpha;
      ctx.drawImage(nextImg, 0, 0);
      ctx.globalAlpha = 1;
    }
  }, [frameCount, renderMode, peakFrameIndex, peakAtScroll]);

  const schedule = useCallback((v) => {
    pendingRef.current = v;
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      drawAt(pendingRef.current);
    });
  }, [drawAt]);

  // ── Progressive frame loading ──
  useEffect(() => {
    const images = [];
    let cancelled = false;
    let loadedCount = 0;

    // Priority loading: first frame immediately, then batch the rest
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.decoding = "async";

      img.onload = () => {
        if (cancelled) return;
        loadedCount++;
        setLoadProgress(loadedCount / frameCount);

        // Show as soon as first frame is ready
        if (i === 0) {
          setReady(true);
          drawAt(smoothed.get());
        }
      };

      // Stagger loading to avoid overwhelming the network
      if (i < 10) {
        img.src = framePath(i);
      } else {
        // Defer loading of later frames
        setTimeout(() => {
          if (!cancelled) img.src = framePath(i);
        }, Math.floor(i / 8) * 16);
      }

      if (i === 0 && img.complete && img.naturalWidth > 0) {
        // Cached first frame is already decoded — sync external image state on mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setReady(true);
        drawAt(smoothed.get());
      }
      images.push(img);
    }

    imagesRef.current = images;
    return () => {
      cancelled = true;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameCount]);

  useEffect(() => {
    if (!ready) return undefined;
    const unsub = smoothed.on("change", schedule);
    drawAt(smoothed.get());
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smoothed, ready]);

  useEffect(() => {
    const onResize = () => drawAt(smoothed.get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smoothed]);

  return { canvasRef, smoothed, ready, loadProgress };
}
