// React Bits "ClickSpark" — adapted to a single fixed, viewport-sized canvas.
// The original sizes its canvas to the parent element, which on a long page
// would allocate a page-height bitmap; this version listens on window so every
// click anywhere sparks, and skips entirely under prefers-reduced-motion.
import { useEffect, useRef } from "react";

export default function ClickSpark({
  sparkColor = "#2E8DFF",
  sparkSize = 9,
  sparkRadius = 18,
  sparkCount = 8,
  duration = 450,
}) {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const ease = (t) => t * (2 - t);
    let raf;
    const draw = (ts) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sparksRef.current = sparksRef.current.filter((s) => {
        const elapsed = ts - s.start;
        if (elapsed >= duration) return false;

        const p = ease(elapsed / duration);
        const dist = p * sparkRadius;
        const len = sparkSize * (1 - p);

        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.x + dist * Math.cos(s.angle), s.y + dist * Math.sin(s.angle));
        ctx.lineTo(s.x + (dist + len) * Math.cos(s.angle), s.y + (dist + len) * Math.sin(s.angle));
        ctx.stroke();
        return true;
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onClick = (e) => {
      const now = performance.now();
      for (let i = 0; i < sparkCount; i++) {
        sparksRef.current.push({
          x: e.clientX,
          y: e.clientY,
          angle: (2 * Math.PI * i) / sparkCount,
          start: now,
        });
      }
    };
    window.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", onClick);
    };
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration]);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden="true" />;
}
