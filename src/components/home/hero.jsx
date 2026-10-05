// Section 1 · Hero — full-screen cinematic tour of the facility with a live
// "now touring" caption and shot ticks, trial + coach CTAs, and the fixed navbar
// floating over it. Both cuts (landscape / portrait) come from
// scripts/build-hero-tour.py.
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { Eyebrow } from "./ui";
import { reveal, stagger } from "./anim";
import { HERO } from "@/data/home";
import { TOUR_CUES, TOUR_LENGTH } from "@/data/tourCues";
import { STATS, waLink } from "@/data/site";
import { trackWhatsApp } from "@/lib/analytics";
import { posterOnly, useClientValue } from "@/lib/device";

// Portrait phones get their own 9:16 cut so every zone stays in frame. Decided
// once at mount — a rotated phone keeps the file it already downloaded.
const portraitPhone = () =>
  window.matchMedia?.("(orientation: portrait) and (max-width: 767px)").matches ?? false;

// Which file: orientation → codec. AV1 is ~half the bytes, but software AV1
// stutters on low-end devices, so it is only used where the browser says it
// decodes smoothly and power-efficiently (i.e. in hardware). Everything else
// gets the H.264 file, which plays anywhere.
async function pickSrc(portrait) {
  const cut = portrait ? HERO.videoPortrait : HERO.video;
  try {
    const info = await navigator.mediaCapabilities?.decodingInfo({
      type: "file",
      video: {
        contentType: 'video/mp4; codecs="av01.0.08M.08"',
        width: portrait ? 720 : 1920,
        height: portrait ? 1280 : 1080,
        bitrate: portrait ? 1_000_000 : 2_000_000,
        framerate: 30,
      },
    });
    if (info?.supported && info.smooth && info.powerEfficient) return cut.av1;
  } catch {
    // no MediaCapabilities (older Safari/WebViews) → H.264
  }
  return cut.h264;
}

export function HeroSection({ onBookTrial }) {
  // Both are `null`/`true` in the prerendered HTML and during hydration, so the
  // server markup is poster-only and can never mismatch. The video mounts one
  // render later, already knowing which cut this device wants — so there is no
  // double download and no wrong-orientation fetch.
  const portrait = useClientValue(portraitPhone, null);
  const still = useClientValue(posterOnly, true);
  const [src, setSrc] = useState(null);
  const videoRef = useRef(null);
  const [cue, setCue] = useState(0);

  // One decision, one download: the <video> only mounts once the file is known.
  useEffect(() => {
    if (still || portrait === null) return;
    let live = true;
    pickSrc(portrait).then((s) => live && setSrc(s));
    return () => {
      live = false;
    };
  }, [still, portrait]);

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
  }, [src]);

  // timeupdate fires ~4 Hz; dissolves are 0.7 s, so the caption never lags visibly.
  const onTime = (e) => {
    const t = e.currentTarget.currentTime;
    let i = 0;
    while (i + 1 < TOUR_CUES.length && TOUR_CUES[i + 1].at <= t) i++;
    if (i !== cue) setCue(i);
  };
  const zone = TOUR_CUES[cue];
  const shotLength = (TOUR_CUES[cue + 1]?.at ?? TOUR_LENGTH) - zone.at;

  return (
    <section className="relative isolate h-svh min-h-[640px] overflow-hidden bg-[#05080D]" aria-label="Cali Terrain — the facility">
      {/* Poster is the LCP image. <picture> lets the browser pick the portrait
          cut straight from the prerendered HTML — no JS, no second request. */}
      <picture>
        <source media="(orientation: portrait) and (max-width: 767px)" srcSet={HERO.imgPortrait} />
        <img src={HERO.img} alt="" fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      </picture>
      {!still && src && (
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
          src={src}
        />
      )}

      {/* Scrims: nav band (Navbar is transparent until scrolled) + a bed for the copy.
          Below lg the copy spans the width, so the bed rises from the bottom. On
          desktop the copy sits left, so the bed comes from the left and the right
          of the frame stays clear for the footage. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#05080D]/85 to-transparent lg:h-32 lg:from-[#05080D]/70" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[88%] bg-gradient-to-t from-[#05080D] via-[#05080D]/60 to-transparent lg:h-2/5 lg:via-[#05080D]/35" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 hidden w-3/4 bg-gradient-to-r from-[#05080D]/90 via-[#05080D]/55 to-transparent lg:block" />
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
                key={cue}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-white"
              >
                {zone.name}
                <span className="hidden text-xs font-medium normal-case tracking-normal text-white/55 lg:inline"> — {zone.blurb}</span>
              </motion.span>
              {/* One tick per shot; the current one fills over the shot's length. */}
              <span className="flex basis-full gap-1 pt-2">
                {TOUR_CUES.map((c, i) => (
                  <span key={c.at} className="relative h-[2px] w-5 overflow-hidden bg-white/15">
                    {i < cue && <span className="absolute inset-0 bg-white/50" />}
                    {i === cue && (
                      <motion.span
                        key={cue}
                        className="absolute inset-0 origin-left bg-[#2E8DFF]"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: shotLength, ease: "linear" }}
                      />
                    )}
                  </span>
                ))}
              </span>
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
