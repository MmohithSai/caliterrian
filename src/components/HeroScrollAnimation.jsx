import { Link } from "react-router-dom";
import { motion, useReducedMotion, useTransform } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useRef } from "react";
import { useImageSequenceCanvas } from "@/lib/imageSequence";

/* ──────────────────────────────────────────────────────────
   Frame Configuration
   66 pre-graded cinematic JPG frames (1920x1080, ~150KB each).
   Color grade, vignette, atmospheric blur, vertical bbox-tracking
   crop and teal rim light are all baked in — the canvas just blits
   each frame, which keeps scrolling at 60 fps.
   ────────────────────────────────────────────────────────── */
const HERO_FRAME_COUNT = 66;
const HERO_FRAME_PATH = (i) =>
  `/muscleup-cinematic/frame${String(i + 1).padStart(5, "0")}.jpg`;

// Softer spring -> silky scroll. Lower stiffness + matched damping prevents
// frame-by-frame chunkiness.
const HERO_SCROLL_SPRING = { stiffness: 70, damping: 26, mass: 0.45 };

// Peak hold: animation advances dead-hang -> lockout above bar, then freezes.
// Frame 46 (0-indexed 45) is the moment the athlete is fully above the bar
// at lockout. Beyond HERO_PEAK_AT_SCROLL the frame stops advancing so the
// brand/CTA reveals play over the held peak.
const HERO_PEAK_FRAME_INDEX = 45;
const HERO_PEAK_AT_SCROLL = 0.82;

/* ──────────────────────────────────────────────────────────
   Typography Phases — Cinematic word reveals
   Each word appears and disappears as the athlete progresses
   through the muscle-up movement.
   ────────────────────────────────────────────────────────── */
/* ──────────────────────────────────────────────────────────
   Cinematic Broadcast HUD — scroll-phased typography
   Each chapter aligns to a moment of the muscle-up:
   01 dead hang · 02 explosive pull · 03 chest above bar · 04 lockout
   Phases run inside [0, HERO_PEAK_AT_SCROLL=0.82] so the final
   chapter lands exactly when the frame freezes at peak.
   ────────────────────────────────────────────────────────── */
// Boundaries are tuned against the actual frame-at-scroll mapping
// produced by the piecewise ascent curve in imageSequence.js. Each label
// is centered on the scroll position where the corresponding visual
// moment is on screen:
//   0.00–0.32  athlete in dead hang             -> HOLD.
//   0.32–0.55  body rises into the pull         -> DRIVE.
//   0.55–0.72  chest reaches bar, going over    -> BREAK THROUGH.
//   0.72–0.82  fully above the bar, lockout     -> ABOVE.
const HERO_PHASES = [
  {
    chapter: "01",
    label: "Dead Hang",
    headline: "HOLD.",
    subtitle: "Stillness is a discipline.",
    phase: [0.06, 0.32],
  },
  {
    chapter: "02",
    label: "Explosive Pull",
    headline: "DRIVE.",
    subtitle: "Every inch is earned.",
    phase: [0.32, 0.55],
  },
  {
    chapter: "03",
    label: "Transition",
    headline: "BREAK THROUGH.",
    subtitle: "Mass becomes motion.",
    phase: [0.55, 0.72],
  },
  {
    chapter: "04",
    label: "Lockout",
    headline: "ABOVE.",
    subtitle: "The summit is the work.",
    phase: [0.72, 0.82],
  },
];

export default function HeroScrollAnimation({ onBookTrial }) {
  const reduceMotion = useReducedMotion();
  // Reduced-motion users get a static, single-screen hero. This also avoids
  // mounting the canvas engine / loading 66 frames, and prevents the animated
  // path's scroll-gated layers from rendering stacked at full opacity.
  if (reduceMotion) return <HeroStatic onBookTrial={onBookTrial} />;
  return <HeroAnimated onBookTrial={onBookTrial} />;
}

/* ──────────────────────────────────────────────────────────
   HeroStatic — reduced-motion fallback. One poster frame, one
   visible <h1>, one CTA pair. No scroll choreography.
   ────────────────────────────────────────────────────────── */
function HeroStatic({ onBookTrial }) {
  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-obsidian"
      aria-label="Cali Terrain hero"
    >
      <img
        src="/muscleup-cinematic/frame00001.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/75 via-[#0A0A0A]/45 to-[#0A0A0A]" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(46,196,182,0.14), transparent 70%)",
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <h1 className="hero-brand-text font-heading text-white">
          CALI<span className="text-[#2EC4B6]">TERRAIN</span>
        </h1>
        <p className="hero-subtitle max-w-lg text-zinc-300">
          Master your body. Redefine your limits.
        </p>
        <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row">
          <button
            onClick={onBookTrial}
            className="hero-cta-primary kinetic-button inline-flex items-center gap-2 bg-[#2EC4B6] px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#001814] transition-colors duration-200 hover:bg-[#25A599]"
          >
            Book Free Trial <ChevronRight className="h-4 w-4" />
          </button>
          <Link
            to="/programs"
            className="hero-cta-secondary inline-flex items-center gap-2 border border-white/50 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/10"
          >
            Explore Programs
          </Link>
        </div>
      </div>
    </section>
  );
}

function HeroAnimated({ onBookTrial }) {
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const { canvasRef, smoothed, ready, loadProgress } = useImageSequenceCanvas({
    containerRef: sectionRef,
    frameCount: HERO_FRAME_COUNT,
    framePath: HERO_FRAME_PATH,
    springConfig: HERO_SCROLL_SPRING,
    renderMode: "hero-cinematic-pre",
    peakFrameIndex: HERO_PEAK_FRAME_INDEX,
    peakAtScroll: HERO_PEAK_AT_SCROLL,
  });

  /* ── Scroll-driven transforms ── */

  // Overall cinematic zoom: entire canvas scales subtly
  const canvasScale = useTransform(smoothed, [0, 1], [1.0, 1.04]);

  // Teal glow intensifies at peak muscle-up
  const glowOpacity = useTransform(
    smoothed,
    [0, 0.3, 0.6, 0.85, 1],
    [0.08, 0.15, 0.28, 0.22, 0.12]
  );

  // Bottom gradient darkens as we approach the end
  const bottomFade = useTransform(smoothed, [0.7, 1], [0.6, 1]);

  // Progress bar
  const progressScale = useTransform(smoothed, [0, 1], [0, 1]);

  // Brand reveal at end
  const brandOpacity = useTransform(smoothed, [0.86, 0.94], [0, 1]);
  const brandY = useTransform(smoothed, [0.86, 0.94], [30, 0]);
  const brandScale = useTransform(smoothed, [0.86, 0.96], [0.92, 1]);

  // CTA reveal at end
  const ctaOpacity = useTransform(smoothed, [0.92, 1.0], [0, 1]);
  const ctaY = useTransform(smoothed, [0.92, 1.0], [24, 0]);

  // Subtitle text
  const subtitleOpacity = useTransform(smoothed, [0.88, 0.95], [0, 1]);
  const subtitleY = useTransform(smoothed, [0.88, 0.95], [16, 0]);

  // Scroll hint fades out as user begins scrolling
  const scrollHintOpacity = useTransform(smoothed, [0, 0.06], [1, 0]);

  /* ── Intro state — visible at scroll = 0 before any animation, fades
     out by ~0.055 so the muscle-up phase HUD can take over cleanly. ── */
  const introOpacity = useTransform(smoothed, [0, 0.035, 0.055], [1, 1, 0]);
  const introY = useTransform(smoothed, [0, 0.055], [0, -28]);
  const introScale = useTransform(smoothed, [0, 0.06], [1, 0.96]);
  // Soft teal-on-dark radial backdrop gives the brand a stage at scroll = 0
  // without flat black; fades as the cinematic frame takes over.
  const introBackdropOpacity = useTransform(smoothed, [0, 0.08], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="hero-cinematic-section relative bg-obsidian"
      style={{ height: "400vh" }}
      aria-label="Cali Terrain hero"
    >
      <div className="sticky top-0 h-screen w-screen overflow-hidden">
        {/* ── Canvas: the cinematic composition ── */}
        <motion.canvas
          ref={canvasRef}
          aria-hidden="true"
          className={`hero-cinematic-canvas absolute inset-0 h-full w-full transition-opacity duration-1000 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          style={reduceMotion ? undefined : { scale: canvasScale }}
        />

        {/* ── Loading state ── */}
        {!ready && (
          <div className="hero-loading absolute inset-0 z-50 flex items-center justify-center bg-obsidian">
            <div className="flex flex-col items-center gap-4">
              <div className="hero-loading-bar">
                <div
                  className="hero-loading-bar-fill"
                  style={{ width: `${loadProgress * 100}%` }}
                />
              </div>
              <p className="hero-loading-text">
                Loading Experience
              </p>
            </div>
          </div>
        )}

        {/* ── Atmospheric overlays (HTML layers on top of canvas) ── */}

        {/* Top edge gradient */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-32 bg-gradient-to-b from-[#0A0A0A]/70 to-transparent" />

        {/* Bottom edge gradient — intensifies at end */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-48 bg-gradient-to-t from-[#0A0A0A] to-transparent"
          style={reduceMotion ? undefined : { opacity: bottomFade }}
        />

        {/* Side gradients for widescreen blending */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-24 bg-gradient-to-r from-[#0A0A0A]/50 to-transparent sm:w-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-24 bg-gradient-to-l from-[#0A0A0A]/50 to-transparent sm:w-40" />

        {/* Teal atmospheric glow — peaks during transition */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[3]"
          style={
            reduceMotion
              ? undefined
              : {
                  opacity: glowOpacity,
                  background:
                    "radial-gradient(ellipse 60% 50% at 50% 42%, rgba(46, 196, 182, 0.25), transparent 70%)",
                }
          }
        />

        {/* Cinematic grain overlay via CSS */}
        <div className="hero-grain pointer-events-none absolute inset-0 z-[4]" />

        {/* ── Intro backdrop: soft teal radial over the dead-hang frame
              so the brand has a stage at scroll = 0. Fades as the user
              begins scrolling and the cinematic takes over. ── */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[5]"
          style={
            reduceMotion
              ? undefined
              : {
                  opacity: introBackdropOpacity,
                  background:
                    "radial-gradient(ellipse 80% 65% at 50% 48%, rgba(46, 196, 182, 0.12) 0%, rgba(10, 10, 10, 0.78) 65%, rgba(10, 10, 10, 0.92) 100%)",
                }
          }
        />

        {/* ── Typography System: cinematic broadcast HUD ── */}
        <div className="pointer-events-none absolute inset-0 z-[5]">
          {HERO_PHASES.map((p) => (
            <HeroPhase
              key={p.chapter}
              chapter={p.chapter}
              label={p.label}
              headline={p.headline}
              subtitle={p.subtitle}
              phase={p.phase}
              totalChapters={HERO_PHASES.length}
              smoothed={smoothed}
              reduceMotion={reduceMotion}
            />
          ))}

          {/* CALITERRAIN brand reveal at end — anchored to same center
              slot as the phase headlines so it visually continues the
              composition instead of jumping. */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center"
            style={
              reduceMotion
                ? undefined
                : { opacity: brandOpacity, y: brandY, scale: brandScale }
            }
          >
            <h1 className="hero-brand-text font-heading text-white">
              CALI<span className="text-[#2EC4B6]">TERRAIN</span>
            </h1>
            <motion.p
              className="hero-subtitle max-w-lg text-center text-zinc-300"
              style={
                reduceMotion
                  ? undefined
                  : { opacity: subtitleOpacity, y: subtitleY }
              }
            >
              Master your body. Redefine your limits.
            </motion.p>
          </motion.div>
        </div>

        {/* ── CTA Buttons ── */}
        <motion.div
          className="absolute inset-x-0 bottom-24 z-[6] flex justify-center px-6 sm:bottom-28"
          style={
            reduceMotion ? undefined : { opacity: ctaOpacity, y: ctaY }
          }
        >
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <button
              onClick={onBookTrial}
              className="hero-cta-primary kinetic-button pointer-events-auto inline-flex items-center gap-2 bg-[#2EC4B6] px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#001814] transition-colors duration-200 hover:bg-[#25A599]"
            >
              Book Free Trial <ChevronRight className="h-4 w-4" />
            </button>
            <Link
              to="/programs"
              className="hero-cta-secondary pointer-events-auto inline-flex items-center gap-2 border border-white/50 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/10"
            >
              Explore Programs
            </Link>
          </div>
        </motion.div>

        {/* ── Scroll hint ── */}
        <motion.div
          className="absolute inset-x-0 bottom-8 z-[6] flex flex-col items-center gap-2"
          style={
            reduceMotion ? undefined : { opacity: scrollHintOpacity }
          }
        >
          <div className="hero-scroll-indicator" />
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/30">
            Scroll to explore
          </p>
        </motion.div>

        {/* ── Intro: EVOLUTION wordmark + figures, subtitle, CTAs.
              The illustration fills what used to be empty space when
              the user first lands. Fades out as soon as the user
              scrolls so the muscle-up animation can take over. ── */}
        <motion.div
          className="hero-intro pointer-events-none absolute inset-0 z-[8] flex flex-col items-center justify-center gap-7 px-6 text-center"
          style={
            reduceMotion
              ? undefined
              : { opacity: introOpacity, y: introY, scale: introScale }
          }
        >
          <img
            src="/hero/evolution.png"
            alt="Calisthenics evolution: from L-sit to muscle-up"
            className="hero-evolution-mark w-[min(72vw,46rem)] select-none"
            draggable="false"
          />
          <p className="hero-subtitle max-w-lg text-zinc-300">
            Master your body. Redefine your limits.
          </p>
          <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row">
            <button
              onClick={onBookTrial}
              className="hero-cta-primary kinetic-button pointer-events-auto inline-flex items-center gap-2 bg-[#2EC4B6] px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#001814] transition-colors duration-200 hover:bg-[#25A599]"
            >
              Book Free Trial <ChevronRight className="h-4 w-4" />
            </button>
            <Link
              to="/programs"
              className="hero-cta-secondary pointer-events-auto inline-flex items-center gap-2 border border-white/50 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/10"
            >
              Explore Programs
            </Link>
          </div>
        </motion.div>

        {/* ── Progress bar ── */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[7] h-[2px] bg-white/5">
          <motion.div
            className="h-full bg-[#2EC4B6]"
            style={{ scaleX: progressScale, transformOrigin: "0 50%" }}
          />
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   HeroPhase — cinematic broadcast HUD per movement phase
   Layered reveal: chapter index (top-left) -> phase label
   (top-right) -> split-letter headline (center) -> teal
   underline grow -> subtitle. Each layer has staggered enter
   + faster exit. Reduced-motion just shows the active phase
   statically with a hard opacity envelope.
   ────────────────────────────────────────────────────────── */
function HeroPhase({
  chapter,
  label,
  headline,
  subtitle,
  phase,
  totalChapters,
  smoothed,
  reduceMotion,
}) {
  const [start, end] = phase;
  const span = end - start;

  // Phase visibility envelope — controls whole-phase fade so
  // adjacent phases never overlap visually.
  const phaseOpacity = useTransform(
    smoothed,
    [
      Math.max(0, start - 0.005),
      start + span * 0.06,
      end - span * 0.10,
      end,
    ],
    [0, 1, 1, 0]
  );

  // Chapter index — slides in from the left at the very start of the phase.
  const chapterX = useTransform(
    smoothed,
    [start, start + span * 0.10, end - span * 0.20, end],
    [-32, 0, 0, -24]
  );

  // Label + tick — slides in from the right, slightly delayed.
  const labelX = useTransform(
    smoothed,
    [start + span * 0.04, start + span * 0.14, end - span * 0.20, end],
    [40, 0, 0, 32]
  );

  // Teal tick line under label — grows then shrinks.
  const tickScale = useTransform(
    smoothed,
    [start + span * 0.04, start + span * 0.18, end - span * 0.18, end],
    [0, 1, 1, 0]
  );

  // Subtitle — gentle rise + fade after the headline lands.
  const subtitleY = useTransform(
    smoothed,
    [start + span * 0.18, start + span * 0.32, end - span * 0.18, end],
    [14, 0, 0, -8]
  );
  const subtitleOpacity = useTransform(
    smoothed,
    [start + span * 0.18, start + span * 0.34, end - span * 0.18, end],
    [0, 1, 1, 0]
  );

  // Underline hairline — width 0 -> 100% -> 0.
  const underlineScale = useTransform(
    smoothed,
    [start + span * 0.22, start + span * 0.45, end - span * 0.16, end],
    [0, 1, 1, 0]
  );

  const letters = Array.from(headline);

  return (
    <motion.div
      className="hero-phase absolute inset-0 flex items-center justify-center"
      style={reduceMotion ? undefined : { opacity: phaseOpacity }}
      aria-hidden="true"
    >
      <div className="hero-phase-center">
        {/* ── Broadcast caption: chapter + label sit above the headline
              as one composed metadata line that complements the athlete. ── */}
        <motion.div
          className="hero-phase-meta"
          style={
            reduceMotion ? undefined : { x: chapterX, opacity: phaseOpacity }
          }
        >
          <span className="hero-phase-chapter">{chapter}</span>
          <span className="hero-phase-counter">
            / {String(totalChapters).padStart(2, "0")}
          </span>
          <motion.span
            className="hero-phase-tick"
            style={reduceMotion ? undefined : { scaleX: tickScale }}
            aria-hidden="true"
          />
          <motion.span
            className="hero-phase-label"
            style={reduceMotion ? undefined : { x: labelX }}
          >
            {label}
          </motion.span>
        </motion.div>

        {/* ── Split-letter headline ── */}
        <h2 className="hero-phase-headline" aria-label={headline}>
          {letters.map((char, i) => (
            <HeroLetter
              key={`${chapter}-${i}`}
              char={char}
              index={i}
              total={letters.length}
              phase={phase}
              smoothed={smoothed}
              reduceMotion={reduceMotion}
            />
          ))}
        </h2>

        {/* Teal underline accent */}
        <motion.span
          className="hero-phase-underline"
          style={
            reduceMotion
              ? undefined
              : { scaleX: underlineScale, transformOrigin: "50% 50%" }
          }
          aria-hidden="true"
        />

        {/* Subtitle */}
        <motion.p
          className="hero-phase-subtitle"
          style={
            reduceMotion
              ? undefined
              : { y: subtitleY, opacity: subtitleOpacity }
          }
        >
          {subtitle}
        </motion.p>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────
   HeroLetter — single character inside the headline. Each
   letter has its own scroll-driven reveal so the headline
   builds left-to-right and dissolves on exit.
   ────────────────────────────────────────────────────────── */
function HeroLetter({ char, index, total, phase, smoothed, reduceMotion }) {
  const [start, end] = phase;
  const span = end - start;

  const ratio = total > 1 ? index / (total - 1) : 0;
  // Letters cascade in over the first ~30% of the phase.
  const letterEnter = start + span * 0.08 + ratio * span * 0.18;
  const letterIn = letterEnter + span * 0.06;
  // Exit during the last ~14% — left-to-right stagger again, but tighter
  // so the exit feels ~60% as long as the entry (faster out than in).
  const letterFadeStart = end - span * 0.16 + ratio * span * 0.04;
  const letterOut = letterFadeStart + span * 0.07;

  const y = useTransform(
    smoothed,
    [letterEnter, letterIn, letterFadeStart, letterOut],
    [70, 0, 0, -40]
  );
  const opacity = useTransform(
    smoothed,
    [letterEnter, letterIn, letterFadeStart, letterOut],
    [0, 1, 1, 0]
  );

  if (char === " ") {
    return <span className="hero-letter-space" aria-hidden="true">&nbsp;</span>;
  }

  return (
    <span className="hero-letter-clip">
      <motion.span
        className="hero-letter"
        style={reduceMotion ? undefined : { y, opacity }}
      >
        {char}
      </motion.span>
    </span>
  );
}
