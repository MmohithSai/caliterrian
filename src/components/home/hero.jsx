// Section 1 · Hero — full-screen stabilized video tour of the facility with a
// live "now touring" caption, trial + coach CTAs, and the fixed navbar floating
// over it. Both cuts (landscape / portrait) come from scripts/build-hero-tour.py.
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { Eyebrow } from "./ui";
import { reveal, stagger } from "./anim";
import { HERO } from "@/data/home";
import { TOUR_CUES } from "@/data/tourCues";
import { STATS, waLink } from "@/data/site";
import { trackWhatsApp } from "@/lib/analytics";
import { lowPower, useClientValue } from "@/lib/device";

// Portrait phones get their own 9:16 cut so every zone stays in frame. Decided
// once at mount — a rotated phone keeps the file it already downloaded.
const portraitPhone = () =>
  window.matchMedia?.("(orientation: portrait) and (max-width: 767px)").matches ?? false;

export function HeroSection({ onBookTrial }) {
  // Both are `null`/`true` in the prerendered HTML and during hydration, so the
  // server markup is poster-only and can never mismatch. The video mounts one
  // render later, already knowing which cut this device wants — so there is no
  // double download and no wrong-orientation fetch.
  const portrait = useClientValue(portraitPhone, null);
  const still = useClientValue(lowPower, true); // poster only
  const src = portrait ? HERO.videoPortrait : HERO.video;
  const videoRef = useRef(null);
  const [cue, setCue] = useState(0);

  // React doesn't reliably set the `muted` *attribute*, so Chrome's autoplay
  // gate can leave the element on its poster — same kick as MediaSlot.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const play = () => {
      v.muted = true;
      v.defaultMuted = true;
      v.play()?.catch?.(() => {});
    };
    play();
    // Browsers pause background media and don't always resume it (iOS Safari,
    // app switching) — pick the loop back up when the page is visible again.
    const onVisible = () => document.visibilityState === "visible" && v.paused && play();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [src, still]);

  // timeupdate fires ~4 Hz; dissolves are 0.6 s, so the caption never lags visibly.
  const onTime = (e) => {
    const t = e.currentTarget.currentTime;
    let i = 0;
    while (i + 1 < TOUR_CUES.length && TOUR_CUES[i + 1].at <= t) i++;
    if (i !== cue) setCue(i);
  };
  const zone = TOUR_CUES[cue];

  return (
    <section className="relative isolate h-svh min-h-[640px] overflow-hidden bg-[#05080D]" aria-label="Cali Terrain — the facility">
      {/* Poster is the LCP image. <picture> lets the browser pick the portrait
          cut straight from the prerendered HTML — no JS, no second request. */}
      <picture>
        <source media="(orientation: portrait) and (max-width: 767px)" srcSet={HERO.imgPortrait} />
        <img src={HERO.img} alt="" fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      </picture>
      {!still && portrait !== null && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={portrait ? HERO.imgPortrait : HERO.img}
          onTimeUpdate={onTime}
          aria-hidden="true"
        >
          <source src={src} type="video/mp4" />
        </video>
      )}

      {/* Scrims: nav band (Navbar is transparent until scrolled) + a bed for the copy */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#05080D]/85 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[88%] bg-gradient-to-t from-[#05080D] via-[#05080D]/60 to-transparent" />
      <div aria-hidden="true" className="hero-grain pointer-events-none absolute inset-0" />

      {/* Bottom-aligned everywhere: clear of the fixed navbar above and the chat bubble / floating buttons below.
          The headline scales with viewport height so the stack never climbs under the nav on short laptops. */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-28 pt-28 sm:pb-20 lg:pb-16">
        <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-3xl">
          {!still && (
            <motion.p
              variants={reveal}
              aria-hidden="true"
              className="mb-6 hidden flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase leading-relaxed tracking-[0.24em] text-white/60 sm:flex"
            >
              <span className="ct-live-dot relative inline-block h-2 w-2 rounded-full bg-[#2E8DFF]" />
              <span>Now touring ·</span>
              {/* Keyed remount = fade-in on every cue; no exit animation to get stuck on. */}
              <motion.span
                key={zone.name}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-white"
              >
                {zone.name}
                <span className="hidden text-xs font-medium normal-case tracking-normal text-white/55 lg:inline"> — {zone.blurb}</span>
              </motion.span>
            </motion.p>
          )}

          {/* Phone: a small location pill; desktop: the tracked eyebrow */}
          <motion.p
            variants={reveal}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/85 backdrop-blur sm:hidden"
          >
            <MapPin className="h-3 w-3 text-[#2E8DFF]" /> {HERO.location}
          </motion.p>
          <div className="hidden sm:block">
            <Eyebrow>{HERO.eyebrow}</Eyebrow>
          </div>

          {/* Same two-clause h1 everywhere. On phones the promise clause steps
              down to a compact accent line, so the heading is four short lines
              instead of six tall ones. */}
          <motion.h1 variants={reveal} className="ct-display mt-5 text-[clamp(2.5rem,min(8.6vh,11.5vw),5.5rem)]">
            <span className="block">{HERO.headline[0]}</span>
            <span className="accent mt-2 block text-[1.75rem] leading-none sm:mt-0 sm:text-[1em] sm:leading-[0.92]">{HERO.headline[1]}</span>
          </motion.h1>
          <motion.p variants={reveal} className="ct-sub mt-6 hidden max-w-xl text-[0.9375rem] sm:block sm:text-base lg:text-lg">
            {HERO.sub}
          </motion.p>

          {/* Phone: one CTA — WhatsApp already sits in the sticky action bar */}
          <motion.div variants={reveal} className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center">
            <button type="button" onClick={onBookTrial} className="btn-primary justify-center">
              {HERO.primaryCta} <ArrowRight className="h-4 w-4" />
            </button>
            <div className="hidden sm:contents">
              <a
                href={waLink(HERO.coachPrompt)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsApp("hero")}
                className="btn-secondary justify-center"
              >
                <MessageCircle className="h-4 w-4" /> {HERO.secondaryCta}
              </a>
            </div>
          </motion.div>
          <motion.p variants={reveal} className="mt-4 text-[11px] tracking-wide text-white/55 sm:mt-5 sm:text-xs">
            <span className="sm:hidden">{HERO.reassureShort}</span>
            <span className="hidden sm:inline">{HERO.reassure}</span>
          </motion.p>

          {/* Stats only when there's room: tablet+ and a viewport at least 800px tall */}
          <motion.dl variants={reveal} className="mt-10 hidden max-w-xl grid-cols-4 gap-6 border-t border-white/10 pt-6 sm:[@media(min-height:800px)]:grid">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="text-[10px] uppercase tracking-widest text-[#9AA7B6]">{s.label}</dt>
                <dd className="font-heading text-3xl text-white">{s.value}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>
      </div>

      {/* One static sentence for screen readers instead of a caption that changes every few seconds */}
      <p className="sr-only">Video tour of the facility: {TOUR_CUES.map((c) => c.name).join(", ")}.</p>
      <div aria-hidden="true" className="hero-scroll-indicator absolute bottom-6 left-1/2 hidden -translate-x-1/2 lg:block" />
    </section>
  );
}
