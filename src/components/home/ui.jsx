// Shared primitives for the 2026 homepage redesign — image-first.
import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useScroll, useTransform } from "framer-motion";
import { ImageIcon } from "lucide-react";
import { reveal, stagger, vpOnce } from "./anim";

// ── Animated outcome ring ─────────────────────────────────────────────────
// Counts up the number and fills the conic `.ct-ring` in sync when scrolled
// into view. `value` is a 0–100 percentage.
export function StatRing({ value, suffix = "", label, size = "h-28 w-28", text = "text-3xl" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // duration 0 jumps straight to the value via the async onUpdate callback,
    // which keeps setState out of the effect body (react-hooks/set-state-in-effect).
    const controls = animate(0, value, {
      duration: reduce ? 0 : 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <span className={`ct-ring relative grid ${size} place-items-center`} style={{ "--p": `${display}%` }}>
        <span className={`font-heading ${text} text-white`}>{display}{suffix}</span>
      </span>
      {label && <p className="mt-3 max-w-[12rem] text-sm leading-snug text-[#9AA7B6]">{label}</p>}
    </div>
  );
}

// ── Section shell: consistent rhythm + anchor id ──────────────────────────
export function Section({ id, className = "", children, bleading = true }) {
  return (
    <section id={id} className={`relative scroll-mt-24 px-6 ${bleading ? "py-20 sm:py-28" : "py-12"} ${className}`}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

// ── Eyebrow (blue, ticked) ────────────────────────────────────────────────
export function Eyebrow({ children, center = false, light = false }) {
  return (
    <motion.p variants={reveal} className={`ct-eyebrow ${center ? "ct-eyebrow--center justify-center" : ""} ${light ? "ct-eyebrow--light" : ""}`}>
      {children}
    </motion.p>
  );
}

// ── Two-tone display heading ──────────────────────────────────────────────
export function Heading({ lines, accent, center = false, size = "text-4xl sm:text-5xl lg:text-6xl", className = "" }) {
  const arr = Array.isArray(lines) ? lines : [lines];
  const accentIdx = accent ?? arr.length - 1;
  return (
    <motion.h2 variants={reveal} className={`ct-display ${size} ${center ? "text-center" : ""} ${className}`}>
      {arr.map((line, i) => (
        <span key={i} className="block">
          <span className={i === accentIdx ? "accent" : undefined}>{line}</span>
        </span>
      ))}
    </motion.h2>
  );
}

// ── Section header (eyebrow + heading + optional sub) ──────────────────────
export function Header({ eyebrow, lines, accent, sub, center = false, maxSub = "max-w-2xl" }) {
  return (
    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={vpOnce} className={`mb-12 ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && <Eyebrow center={center}>{eyebrow}</Eyebrow>}
      <Heading lines={lines} accent={accent} center={center} className="mt-4" />
      {sub && (
        <motion.p variants={reveal} className={`ct-sub mt-5 text-base leading-relaxed ${center ? `mx-auto ${maxSub}` : maxSub}`}>
          {sub}
        </motion.p>
      )}
    </motion.div>
  );
}

// ── Image-first media slot ────────────────────────────────────────────────
// Renders a real <video> background, a real <img>, or a *cinematic* animated
// placeholder (moving blue light + grid) so empty slots already feel like
// video/photography rather than empty boxes. Supports hover zoom, scroll
// parallax, a gradient scrim, and content overlaid on top of the imagery.
export function MediaSlot({
  media,
  img,
  video,
  className = "",
  overlay = true,
  zoom = true,
  parallax = false,
  scrim = "",
  grade = false,
  imgClassName = "",
  align = "items-end",
  showLabel = true,
  children,
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  const style = media?.ratio ? { aspectRatio: media.ratio.replace("/", " / ") } : undefined;
  const hasAsset = Boolean(img || video);
  const Layer = parallax ? motion.div : "div";
  const layerProps = parallax ? { style: { y } } : {};

  return (
    <div ref={ref} className={`ct-media group/media ${hasAsset ? "" : "ct-media--placeholder"} ${className}`} style={style}>
      <Layer {...layerProps} className={`ct-media__layer ${parallax ? "ct-media__layer--parallax" : ""}`}>
        {video ? (
          <video className={`ct-media__img ${zoom ? "ct-media__img--zoom" : ""} ${imgClassName}`} autoPlay muted loop playsInline poster={img}>
            <source src={video} />
          </video>
        ) : img ? (
          <img src={img} alt="" loading="lazy" className={`ct-media__img ${zoom ? "ct-media__img--zoom" : ""} ${imgClassName}`} />
        ) : (
          <span className="ct-media__grid" aria-hidden="true" />
        )}
      </Layer>

      {/* Cinematic color grade: teal shadows · warm highlights · premium overlay */}
      {grade && hasAsset && <span className="ct-media__grade" aria-hidden="true" />}

      {!hasAsset && showLabel && (
        <span className="ct-media__ph">
          <ImageIcon className="h-5 w-5 text-[#2E8DFF]/70" aria-hidden="true" />
          {media?.label && <span className="tag">{media.label}</span>}
          {media?.hint && <span className="hint">{media.hint}</span>}
        </span>
      )}

      {overlay && (hasAsset || children) && <span className={`ct-media__scrim ${scrim}`} aria-hidden="true" />}
      {children && <div className={`ct-media__content ${align}`}>{children}</div>}
    </div>
  );
}

// ── Parallax wrapper for large feature media ──────────────────────────────
export function Parallax({ children, range = 48, className = "" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [range, -range]);
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="h-full w-full will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
