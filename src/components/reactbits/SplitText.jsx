// React Bits "SplitText" (GSAP), adapted for the redesign: renders any tag so
// it can live inside the ct-display <h1>/<h2>, respects prefers-reduced-motion,
// keys its effect on serialized from/to so parent re-renders never replay the
// reveal, and adds startDelay so multi-line headings can cascade.
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

export default function SplitText({
  text,
  tag: Tag = "span",
  className = "",
  delay = 60, // ms stagger between units
  duration = 0.7,
  ease = "power3.out",
  splitType = "words",
  from = { opacity: 0, y: "0.55em" },
  to = { opacity: 1, y: 0 },
  startDelay = 0, // s before this line begins (cascade between lines)
  threshold = 0.1,
  rootMargin = "-80px",
  onComplete,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !text) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let splitter;
    try {
      splitter = new GSAPSplitText(el, { type: splitType });
    } catch {
      return;
    }
    const targets =
      splitType === "lines" ? splitter.lines : splitType === "chars" ? splitter.chars : splitter.words;
    if (!targets?.length) {
      splitter.revert();
      return;
    }
    targets.forEach((t) => {
      t.style.willChange = "transform, opacity";
    });

    const startPct = (1 - threshold) * 100;
    const m = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
    const mv = m ? parseFloat(m[1]) : 0;
    const mu = m ? m[2] || "px" : "px";
    const start = `top ${startPct}%${mv < 0 ? `-=${Math.abs(mv)}${mu}` : `+=${mv}${mu}`}`;

    const tl = gsap.timeline({
      delay: startDelay,
      scrollTrigger: { trigger: el, start, once: true },
      onComplete: () => {
        gsap.set(targets, { ...to, clearProps: "willChange" });
        onComplete?.();
      },
    });
    tl.set(targets, { ...from, immediateRender: false, force3D: true });
    tl.to(targets, { ...to, duration, ease, stagger: delay / 1000, force3D: true });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      gsap.killTweensOf(targets);
      splitter.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- from/to keyed by value, onComplete intentionally unbound
  }, [text, delay, duration, ease, splitType, startDelay, threshold, rootMargin, JSON.stringify(from), JSON.stringify(to)]);

  return (
    <Tag ref={ref} className={className} style={{ whiteSpace: "normal", wordWrap: "break-word" }}>
      {text}
    </Tag>
  );
}
