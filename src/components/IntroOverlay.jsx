// First-visit intro — badge logo → who/where → tagline → zone sweep + stats →
// wipe up to reveal the hero. Plays on every page load of the homepage (not on
// client-side navigation back to it) and doubles as the loading mask while the
// Home + three.js chunks load beneath it.
// Skippable (click / Esc / button). Reduced-motion users never see it.
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import logo from "@/assets/logo.png";
import { INTRO } from "@/data/site";
import { reveal } from "@/components/home/anim";

const TOTAL_MS = 4600;
// Module-level flag: resets on a full reload, survives client-side route changes.
let played = false;

const EASE = [0.22, 1, 0.36, 1];
// Beat pacing: eyebrow 0.7s → tagline 1.0 → brief 1.3 → zones 1.6 → stats 1.9
const beats = { hidden: {}, visible: { transition: { staggerChildren: 0.3, delayChildren: 0.7 } } };
const strip = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };

export default function IntroOverlay() {
  const reduce = useReducedMotion();
  // Lazy initializer is a pure read — StrictMode's double call is harmless.
  const [done, setDone] = useState(() => reduce || played);
  const [ready, setReady] = useState(false); // logo decoded → clock starts

  const finish = useCallback(() => {
    played = true;
    setDone(true); // idempotent: timer, click and Esc may all fire
  }, []);

  // Scroll lock (body, same as skills.jsx / DetailDrawer) + Esc to skip.
  useEffect(() => {
    if (done) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && finish();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [done, finish]);

  // Wait for the badge to decode before starting the clock (Navbar requests
  // the same URL, so this piggybacks on that fetch). Capped so a stalled
  // download can never hold a black screen.
  useEffect(() => {
    if (done) return;
    const img = new Image();
    img.src = logo;
    const go = () => setReady(true);
    const t = setTimeout(go, 2500); // ponytail: cap, not a real loader
    img.decode().then(go, go);
    return () => clearTimeout(t);
  }, [done]);

  useEffect(() => {
    if (done || !ready) return;
    const t = setTimeout(finish, TOTAL_MS);
    return () => clearTimeout(t);
  }, [done, ready, finish]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="intro"
          initial={false}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } }}
          onClick={finish}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-[#05080D] px-6 pb-[env(safe-area-inset-bottom)] text-center sm:gap-6"
        >
          {/* Pre-logo frame: pure-CSS glow, no asset/font dependency */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(46,141,255,0.22),transparent)] animate-pulse"
          />
          <div className="hero-grain pointer-events-none absolute inset-0" aria-hidden="true" />

          {ready && (
            <>
              <motion.img
                src={logo}
                alt="Cali Terrain"
                draggable="false"
                initial={{ opacity: 0, scale: 0.86 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease: EASE }}
                className="relative w-24 select-none sm:w-44"
              />

              <motion.div
                variants={beats}
                initial="hidden"
                animate="visible"
                className="relative flex flex-col items-center gap-4 sm:gap-6"
              >
                <motion.p variants={reveal} className="ct-eyebrow ct-eyebrow--center justify-center">
                  {INTRO.eyebrow}
                </motion.p>

                <motion.h2 variants={reveal} className="ct-display text-4xl sm:text-6xl">
                  {INTRO.tagline.map((line, i) => (
                    <span key={line} className="block">
                      <span className={i === INTRO.tagline.length - 1 ? "accent" : undefined}>{line}</span>
                    </span>
                  ))}
                </motion.h2>

                <motion.p variants={reveal} className="ct-sub hidden max-w-lg text-sm sm:block sm:text-base">
                  {INTRO.brief}
                </motion.p>

                <motion.div variants={strip} className="flex gap-2 sm:gap-3">
                  {INTRO.zones.map((z) => (
                    <motion.figure key={z.name} variants={reveal}>
                      <img
                        src={z.img}
                        alt={z.name}
                        decoding="async"
                        className="aspect-[4/3] w-16 rounded-md border border-white/15 object-cover sm:w-28"
                      />
                      <figcaption className="mt-1.5 hidden text-[10px] uppercase tracking-widest text-white/60 sm:block">
                        {z.name}
                      </figcaption>
                    </motion.figure>
                  ))}
                </motion.div>

                <motion.dl variants={reveal} className="grid grid-cols-4 gap-4 sm:gap-8">
                  {INTRO.stats.map((s) => (
                    <div key={s.label}>
                      <dt className="text-[9px] uppercase tracking-widest text-[#9AA7B6]">{s.label}</dt>
                      <dd className="font-heading text-2xl text-white sm:text-3xl">{s.value}</dd>
                    </div>
                  ))}
                </motion.dl>
              </motion.div>

              {/* Progress hairline */}
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/5" aria-hidden="true">
                <motion.div
                  className="h-full origin-left bg-[#2E8DFF]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: TOTAL_MS / 1000, ease: "linear" }}
                />
              </div>
            </>
          )}

          <button
            type="button"
            onClick={finish}
            className="absolute bottom-6 right-6 text-[10px] uppercase tracking-[0.28em] text-white/50 transition-colors hover:text-white"
          >
            Skip intro →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
