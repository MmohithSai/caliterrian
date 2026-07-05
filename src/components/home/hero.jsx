// Section 1 · Cinematic hero — real facility reel, film-style opening.
// Choreography: obsidian letterbox bars retract like curtains while the
// stabilized facility loop settles from a slow push-in; the headline lines
// rise out of clip masks; sub, CTAs and the hairline trust strip land last.
// On scroll the reel parallaxes away under a deepening scrim so the hero
// hands off cleanly to the Journey section.
import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { HERO } from "@/data/home";
import CountUp from "@/components/reactbits/CountUp";
import Magnet from "@/components/reactbits/Magnet";

const EASE = [0.22, 1, 0.36, 1];

// Entrance timeline (seconds) — one orchestrated page-load, no scattered delays.
const T = {
  bars: 0.25,
  meta: 0.55,
  line1: 0.7,
  line2: 0.88,
  sub: 1.25,
  cta: 1.45,
  trust: 1.7,
};

// "500+" → animated 500 with a literal "+" suffix; non-numeric values render as-is.
function TrustValue({ value }) {
  const num = parseFloat(value);
  if (!Number.isFinite(num)) return value;
  const suffix = String(value).replace(/^[\d.]+/, "");
  return (
    <>
      <CountUp to={num} duration={1.6} className="tabular-nums" />
      {suffix}
    </>
  );
}

const scrollTo = (id) => (e) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

// Fade-up used by the sub / CTA / trust layers of the entrance timeline.
const rise = (rm, delay) =>
  rm
    ? {}
    : {
        initial: { opacity: 0, y: 26 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: EASE, delay },
      };

export function HeroSection({ onBookTrial }) {
  const rm = useReducedMotion();
  const sectionRef = useRef(null);
  const videoRef = useRef(null);

  // Scroll-out choreography: reel drifts up slower than the page (parallax),
  // the scrim deepens, and the copy lifts away slightly ahead of the scroll.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 28, restDelta: 0.001 });
  const reelY = useTransform(progress, [0, 1], ["0%", "-11%"]);
  const scrimBoost = useTransform(progress, [0, 0.85], [0, 0.72]);
  const copyY = useTransform(progress, [0, 0.6], [0, -64]);
  const copyOpacity = useTransform(progress, [0, 0.55], [1, 0]);
  const cueOpacity = useTransform(progress, [0, 0.12], [1, 0]);

  // React doesn't reliably set the `muted` attribute, so Chrome's autoplay
  // gate can strand the video on its poster. Force it and kick play() once.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, [rm]);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="hero-cine relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden"
      aria-label="Cali Terrain — the facility"
    >
      {/* ── The reel: stabilized facility loop with a long settle-in push ── */}
      <motion.div
        className="absolute inset-0 z-0 overflow-hidden"
        style={rm ? undefined : { y: reelY }}
        aria-hidden="true"
      >
        {rm ? (
          <img src={HERO.img} alt="" className="hero-cine-reel" />
        ) : (
          <motion.video
            ref={videoRef}
            className="hero-cine-reel"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={HERO.img}
            initial={{ scale: 1.12, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              scale: { duration: 7, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 1.4, ease: "easeOut", delay: 0.1 },
            }}
          >
            <source src={HERO.video} type="video/mp4" />
            {HERO.webm && <source src={HERO.webm} type="video/webm" />}
          </motion.video>
        )}
      </motion.div>

      {/* ── Scrims: kept light so the reel stays clear — just enough dark
            under the copy column and the trust strip for AA contrast. ── */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(3,7,13,0.76)_0%,rgba(3,7,13,0.4)_34%,rgba(3,7,13,0.04)_62%,rgba(3,7,13,0)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(3,7,13,0.34)_0%,transparent_20%,transparent_62%,rgba(3,7,13,0.62)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(110%_85%_at_16%_28%,rgba(46,141,255,0.1),transparent_56%)]" />
      {/* Scroll-driven darkening as the hero hands off */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[2] bg-[#03070D]"
        style={rm ? undefined : { opacity: scrimBoost }}
        aria-hidden="true"
      />
      <div className="hero-grain pointer-events-none absolute inset-0 z-[2] opacity-30" />

      {/* ── Film frame: hairline inset border over the clear side of the reel ── */}
      <div className="hero-cine-frame pointer-events-none absolute z-[3] hidden lg:block" aria-hidden="true" />

      {/* ── Letterbox curtains: retract to reveal the reel ── */}
      {!rm && (
        <>
          <motion.div
            className="hero-cine-bar pointer-events-none absolute inset-x-0 top-0 z-[15]"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 1.2, ease: EASE, delay: T.bars }}
            style={{ transformOrigin: "50% 0%" }}
            aria-hidden="true"
          />
          <motion.div
            className="hero-cine-bar pointer-events-none absolute inset-x-0 bottom-0 z-[15]"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 1.2, ease: EASE, delay: T.bars }}
            style={{ transformOrigin: "50% 100%" }}
            aria-hidden="true"
          />
        </>
      )}

      {/* ── Copy ── */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 pt-32 pb-10 sm:pt-36">
        <motion.div
          className="hero-cine-copy max-w-4xl"
          style={rm ? undefined : { y: copyY, opacity: copyOpacity }}
        >
          <motion.p className="ct-eyebrow" {...rise(rm, T.meta)}>
            {HERO.eyebrow}
          </motion.p>

          <h1 className="ct-display hero-cine-title mt-6" aria-label={HERO.headline.join(" ")}>
            {HERO.headline.map((line, i) => (
              <span key={line} className="hero-cine-clip">
                <motion.span
                  className={`block ${i === HERO.headline.length - 1 ? "accent" : ""}`}
                  initial={rm ? false : { y: "114%" }}
                  animate={rm ? undefined : { y: 0 }}
                  transition={{ duration: 1.05, ease: EASE, delay: i === 0 ? T.line1 : T.line2 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p className="ct-sub mt-7 max-w-xl text-base leading-relaxed sm:text-lg" {...rise(rm, T.sub)}>
            {HERO.sub}
          </motion.p>

          <motion.div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center" {...rise(rm, T.cta)}>
            <Magnet>
              <button onClick={onBookTrial} className="btn-primary text-sm">
                {HERO.primaryCta} <ArrowRight className="h-4 w-4" />
              </button>
            </Magnet>
            <a href="#path" onClick={scrollTo("path")} className="btn-secondary text-sm">
              {HERO.secondaryCta}
            </a>
          </motion.div>

          {/* Reassurance — remove the "am I fit enough?" fear right at the door. */}
          <motion.p className="mt-6 text-[12px] font-medium tracking-wide text-[#9AA7B6]" {...rise(rm, T.cta + 0.12)}>
            {HERO.reassure}
          </motion.p>
        </motion.div>
      </div>

      {/* ── Scroll cue ── */}
      <motion.div
        className="pointer-events-none absolute bottom-40 left-1/2 z-10 hidden -translate-x-1/2 sm:block"
        style={rm ? undefined : { opacity: cueOpacity }}
        aria-hidden="true"
      >
        <motion.div className="flex flex-col items-center gap-3" {...rise(rm, T.trust + 0.2)}>
          <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/35">Scroll</span>
          <span className="hero-cine-cue" />
        </motion.div>
      </motion.div>

      {/* ── Trust strip: hairline row, no cards — numbers carry it ── */}
      <motion.div className="hero-cine-trust relative z-10 border-t border-white/10" {...rise(rm, T.trust)}>
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 sm:grid-cols-4">
          {HERO.trust.map((s) => (
            <div key={s.label} className="flex flex-col gap-1 px-6 py-5 sm:py-6">
              <span className="font-heading text-3xl leading-none text-white sm:text-4xl">
                <TrustValue value={s.value} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9AA7B6]">{s.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
