import { useEffect, useRef, useState } from "react";
import { useScroll, useSpring } from "framer-motion";

const DEFAULT_SPRING = { stiffness: 220, damping: 38, mass: 0.18 };

// Drives a <canvas> from scroll progress, cross-fading between adjacent frames
// so a discrete jpg sequence reads as continuous video. Owns useScroll + useSpring
// so the consumer just attaches the returned canvasRef and reads `smoothed` for
// any other scroll-linked styles in the same section.
export function useImageSequenceCanvas({
  containerRef,
  frameCount,
  framePath,
  springConfig,
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
  const [ready, setReady] = useState(false);

  const drawAt = (v) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const clamped = Math.max(0, Math.min(1, v));
    const lastIdx = frameCount - 1;
    const fIdx = clamped * lastIdx;
    const baseIdx = Math.floor(fIdx);
    const nextIdx = Math.min(lastIdx, baseIdx + 1);
    const alpha = fIdx - baseIdx;

    const baseImg = imagesRef.current[baseIdx];
    if (!baseImg || !baseImg.complete || baseImg.naturalWidth === 0) return;

    // Backing store = source's native pixel resolution. Drawing 1:1 means we
    // never throw pixel data away inside the canvas; the browser compositor
    // does the (smoother) display scaling via CSS object-fit. Critical for
    // sources that are smaller than the viewport — eliminates canvas-internal
    // upscaling blur.
    const nw = baseImg.naturalWidth;
    const nh = baseImg.naturalHeight;
    if (canvas.width !== nw) canvas.width = nw;
    if (canvas.height !== nh) canvas.height = nh;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.clearRect(0, 0, nw, nh);
    ctx.globalAlpha = 1;
    ctx.drawImage(baseImg, 0, 0);

    const nextImg = imagesRef.current[nextIdx];
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
  };

  const schedule = (v) => {
    pendingRef.current = v;
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      drawAt(pendingRef.current);
    });
  };

  // Preload frames
  useEffect(() => {
    const images = [];
    let cancelled = false;
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = framePath(i);
      if (i === 0) {
        img.onload = () => {
          if (cancelled) return;
          setReady(true);
          drawAt(smoothed.get());
        };
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

  // Subscribe to scroll
  useEffect(() => {
    if (!ready) return;
    const unsub = smoothed.on("change", schedule);
    drawAt(smoothed.get());
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smoothed, ready]);

  // Redraw on resize
  useEffect(() => {
    const onResize = () => drawAt(smoothed.get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smoothed]);

  return { canvasRef, smoothed, ready };
}
