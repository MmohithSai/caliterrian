// Sections 1–3: Hero · The Problem · The Caliterrain Path  (image-first)
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, Award, Check, Dumbbell, Star, Users, X } from "lucide-react";
import { Eyebrow, Header, Heading, MediaSlot, Section } from "./ui";
import { reveal, stagger, vpOnce } from "./anim";
import { HERO, PROBLEM, PATH } from "@/data/home";

const scrollTo = (id) => (e) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const TRUST_ICONS = [Users, Award, Dumbbell, Star];

// ── SECTION 1 · Hero ──────────────────────────────────────────────────────
export function HeroSection({ onBookTrial }) {
  return (
    <section id="top" className="relative isolate flex min-h-[94vh] items-center overflow-hidden pt-28 pb-12">
      {/* Full-bleed cinematic facility background (video drops in via HERO.video). */}
      <MediaSlot
        media={{ ...HERO.media, ratio: undefined }}
        img={HERO.img}
        video={HERO.video}
        parallax
        zoom={false}
        overlay={false}
        showLabel={false}
        className="absolute inset-0 -z-10"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(11,16,22,0.82)_0%,rgba(11,16,22,0.55)_45%,rgba(11,16,22,0.95)_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_15%_20%,rgba(46,141,255,0.22),transparent_55%)]" />
      <div className="hero-grain pointer-events-none absolute inset-0 -z-10 opacity-40" />

      <div className="mx-auto w-full max-w-7xl px-6">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
          <Eyebrow>{HERO.eyebrow}</Eyebrow>
          <motion.h1 variants={reveal} className="ct-display mt-5 text-5xl sm:text-6xl lg:text-7xl">
            <span className="block">{HERO.headline[0]}</span>
            <span className="block accent">{HERO.headline[1]}</span>
          </motion.h1>
          <motion.p variants={reveal} className="ct-sub mt-6 max-w-xl text-base leading-relaxed sm:text-lg">
            {HERO.sub}
          </motion.p>
          <motion.div variants={reveal} className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button onClick={onBookTrial} className="btn-primary text-sm">
              {HERO.primaryCta} <ArrowRight className="h-4 w-4" />
            </button>
            <a href="#path" onClick={scrollTo("path")} className="btn-secondary text-sm">
              {HERO.secondaryCta}
            </a>
          </motion.div>
        </motion.div>

        {/* Trust bar — real stats from site.js */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={vpOnce}
          variants={stagger}
          className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-[#1E2A38] bg-[#1E2A38] sm:grid-cols-4"
        >
          {HERO.trust.map((s, i) => {
            const Icon = TRUST_ICONS[i % TRUST_ICONS.length];
            return (
              <motion.div key={s.label} variants={reveal} className="flex items-center gap-3 bg-[#0B1016]/85 px-5 py-5 backdrop-blur-sm">
                <Icon className="h-5 w-5 shrink-0 text-[#2E8DFF]" />
                <div>
                  <div className="font-heading text-2xl leading-none text-white">{s.value}</div>
                  <div className="text-[11px] uppercase tracking-widest text-[#9AA7B6]">{s.label}</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ── SECTION 2 · The Problem — Myth vs Reality ─────────────────────────────
// Destroys the #1 objection ("I'm not fit enough to join") by pivoting from a
// muted, struck-through MYTH to a photographic REALITY progression
// (Can't Hang → Push-Up → Pull-Up → Muscle-Up). A hard VS badge splits the two.
function ProgressionTile({ step }) {
  const locked = step.state === "locked";
  return (
    <div className={`group relative overflow-hidden rounded-sm border ${locked ? "border-[#1E2A38]" : "border-[#2E8DFF]/40"}`}>
      <MediaSlot media={{ ...step.media, ratio: "3/4" }} img={step.img} align="" scrim="ct-media__scrim--full" showLabel={false} className={locked ? "grayscale" : ""}>
        <div className="flex items-start justify-between">
          {locked ? (
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#5C6B7C] bg-[#0B1016]/70 text-[#9AA7B6] backdrop-blur">
              <X className="h-3.5 w-3.5" />
            </span>
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2E8DFF] shadow-[0_0_14px_rgba(46,141,255,0.6)]">
              <Check className="h-3.5 w-3.5 text-white" />
            </span>
          )}
        </div>
        <div className="mt-auto">
          <h4 className={`font-heading text-base leading-none tracking-wide ${locked ? "text-[#9AA7B6]" : "text-white"}`}>{step.label}</h4>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-[#C6D2DF]/70">{step.caption}</p>
        </div>
      </MediaSlot>
    </div>
  );
}

export function ProblemSection() {
  const steps = PROBLEM.steps;
  return (
    <Section id="problem" className="bg-[#0E141C]">
      <div className="relative grid gap-10 lg:grid-cols-2 lg:gap-0">
        {/* Center divider + VS badge (desktop) */}
        <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(46,141,255,0.4),transparent)] lg:block" />
        <span className="ct-vs pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:flex">VS</span>

        {/* ── LEFT · MYTH ─────────────────────────────────────────────── */}
        <motion.div initial="hidden" whileInView="visible" viewport={vpOnce} variants={stagger} className="lg:pr-16 xl:pr-24">
          <Eyebrow>{PROBLEM.eyebrow}</Eyebrow>
          <motion.span variants={reveal} className="mt-6 inline-flex items-center gap-2 border border-[#5C6B7C]/50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#9AA7B6]">
            <X className="h-3.5 w-3.5" /> {PROBLEM.mythLabel}
          </motion.span>
          <motion.blockquote variants={reveal} className="ct-display mt-5 text-4xl text-[#6B7888] line-through decoration-[#2E8DFF]/60 decoration-2 sm:text-5xl">
            “{PROBLEM.myth}”
          </motion.blockquote>
          <motion.p variants={reveal} className="ct-sub mt-6 text-base">{PROBLEM.mythTail}</motion.p>
        </motion.div>

        {/* VS badge (mobile, in-flow) */}
        <div className="flex items-center justify-center gap-4 lg:hidden">
          <span className="h-px flex-1 bg-[#1E2A38]" />
          <span className="ct-vs">VS</span>
          <span className="h-px flex-1 bg-[#1E2A38]" />
        </div>

        {/* ── RIGHT · REALITY ─────────────────────────────────────────── */}
        <motion.div initial="hidden" whileInView="visible" viewport={vpOnce} variants={stagger} className="lg:pl-16 xl:pl-24">
          <motion.span variants={reveal} className="inline-flex items-center gap-2 border border-[#2E8DFF]/50 bg-[#2E8DFF]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#2E8DFF]">
            <Check className="h-3.5 w-3.5" /> {PROBLEM.realityLabel}
          </motion.span>
          <Heading lines={PROBLEM.truth} size="text-3xl sm:text-4xl" className="mt-5" />
          <motion.p variants={reveal} className="ct-sub mt-4 text-sm">{PROBLEM.realitySub}</motion.p>

          {/* Photographic progression: horizontal (sm+) / vertical (mobile) */}
          <motion.div variants={stagger} className="mt-7 hidden items-stretch gap-1.5 sm:flex">
            {steps.map((step, i) => (
              <motion.div key={step.label} variants={reveal} className="flex flex-1 items-stretch">
                <div className="flex-1"><ProgressionTile step={step} /></div>
                {i < steps.length - 1 && <ArrowRight className="mx-0.5 h-4 w-4 shrink-0 self-center text-[#2E8DFF]" aria-hidden="true" />}
              </motion.div>
            ))}
          </motion.div>
          <motion.div variants={stagger} className="mt-7 flex flex-col gap-2 sm:hidden">
            {steps.map((step, i) => (
              <motion.div key={step.label} variants={reveal} className="flex flex-col items-center gap-2">
                <div className="w-full max-w-[220px]"><ProgressionTile step={step} /></div>
                {i < steps.length - 1 && <ArrowDown className="h-4 w-4 shrink-0 text-[#2E8DFF]" aria-hidden="true" />}
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={reveal} className="mt-7 flex items-center gap-3 border border-[#2E8DFF]/30 bg-[#2E8DFF]/5 px-5 py-4">
            <Star className="h-5 w-5 shrink-0 fill-[#2E8DFF] text-[#2E8DFF]" />
            <p className="text-sm font-medium text-white">{PROBLEM.resolve}</p>
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}

// ── SECTION 3 · The Caliterrain Path — connected journey ──────────────────
// One progression line threads six ring nodes (desktop: horizontal rail,
// mobile: vertical timeline). Each stage previews the skills it contains, so
// the section reads as a single route from Assessment → Mastery, not 6 cards.
function StageBody({ stage }) {
  return (
    <>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#2E8DFF]">{stage.tier}</p>
      <h3 className="mt-0.5 font-heading text-lg tracking-wide text-white">{stage.name}</h3>
      <p className="mt-1 text-[12px] leading-snug text-[#9AA7B6]">{stage.desc}</p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {stage.skills.map((s) => (
          <li key={s} className="border border-[#1E2A38] bg-[#0B1016] px-2 py-0.5 text-[10px] font-medium text-[#C6D2DF]">{s}</li>
        ))}
      </ul>
    </>
  );
}

function StageNode({ stage }) {
  const Icon = stage.icon;
  return (
    <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#2E8DFF]/50 bg-[#0E141C] text-[#2E8DFF] shadow-[0_0_22px_rgba(46,141,255,0.25)]">
      <Icon className="h-5 w-5" />
      <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#2E8DFF] font-heading text-[10px] text-white">{stage.n}</span>
    </span>
  );
}

export function PathSection() {
  return (
    <Section id="path">
      <Header eyebrow={PATH.eyebrow} lines={PATH.title} sub={PATH.sub} center maxSub="max-w-3xl" />

      {/* Desktop: horizontal connected rail */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={vpOnce}
        variants={stagger}
        className="relative hidden lg:grid lg:grid-cols-6 lg:gap-4"
      >
        {/* Progression line behind the node row (node center ≈ 1.75rem) */}
        <div className="ct-connector pointer-events-none absolute left-[8.333%] right-[8.333%] top-7 h-0.5" />
        {PATH.stages.map((stage) => (
          <motion.div key={stage.n} variants={reveal} className="flex flex-col items-center text-center">
            <StageNode stage={stage} />
            <div className="mt-4"><StageBody stage={stage} /></div>
          </motion.div>
        ))}
      </motion.div>

      {/* Mobile/tablet: vertical timeline */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={vpOnce}
        variants={stagger}
        className="relative lg:hidden"
      >
        <div className="ct-connector-v pointer-events-none absolute bottom-7 left-7 top-7 w-0.5" />
        <div className="flex flex-col gap-7">
          {PATH.stages.map((stage) => (
            <motion.div key={stage.n} variants={reveal} className="flex gap-5">
              <StageNode stage={stage} />
              <div className="pt-1"><StageBody stage={stage} /></div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Pillars */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={vpOnce}
        variants={stagger}
        className="mt-12 grid grid-cols-2 gap-px overflow-hidden border border-[#1E2A38] bg-[#1E2A38] lg:grid-cols-4"
      >
        {PATH.pillars.map((p) => {
          const Icon = p.icon;
          return (
            <motion.div key={p.title} variants={reveal} className="flex items-start gap-3 bg-[#0B1016] px-5 py-5">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#2E8DFF]" />
              <div>
                <div className="text-sm font-semibold text-white">{p.title}</div>
                <div className="text-xs text-[#9AA7B6]">{p.desc}</div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </Section>
  );
}
