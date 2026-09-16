// Sections 10–14: Results · Memberships · FAQ · Final CTA  (image-first)
import { lazy, Suspense, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Check, ChevronDown, Play, Quote, Sparkles, Trophy, X } from "lucide-react";
import { Eyebrow, Header, MediaSlot, Section, StatRing } from "./ui";
import { reveal, stagger, vpOnce } from "./anim";
import { RESULTS, MEMBERSHIPS, FAQ, FINAL_CTA } from "@/data/home";
import SplitText from "@/components/reactbits/SplitText";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import GlareHover from "@/components/reactbits/GlareHover";
import Magnet from "@/components/reactbits/Magnet";
import { lowPower, useClientValue } from "@/lib/device";

// three.js is ~520 KB — it must not sit on the homepage's critical path for a
// decorative backdrop near the very bottom of the page. Loaded only once the
// final CTA is close, and never on low-power/reduced-motion devices (the
// gradient + grain below already give the section its resting look).
const MuscleUp3D = lazy(() => import("@/components/home/MuscleUp3D"));

// ── SECTION 10 · Results — outcome rings + member video stories ────────────
// Consolidates the old Why-Stay, Member-Journeys and Testimonials sections.
export function ResultsSection() {
  // The story card's play badge used to be pure decoration — the inline clip is
  // muted/looped (and never even loads on low-power devices), so clicking it did
  // nothing. It now opens the reel with sound in a native <dialog>: Esc, focus
  // trap and backdrop come free.
  const [reel, setReel] = useState(null);
  return (
    <Section id="results" className="bg-[#0E141C]">
      <Header eyebrow={RESULTS.eyebrow} lines={RESULTS.title} sub={RESULTS.sub} maxSub="max-w-2xl" />

      {/* Outcome rings + supporting reasons */}
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <motion.div initial="hidden" whileInView="visible" viewport={vpOnce} variants={stagger} className="grid grid-cols-3 gap-4">
          {RESULTS.outcomes.map((o) => (
            <motion.div key={o.label} variants={reveal}>
              <StatRing value={o.value} suffix={o.suffix} label={o.label} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={vpOnce} variants={stagger} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {RESULTS.reasons.map((r) => {
            const Icon = r.icon;
            return (
              <motion.div key={r.title} variants={reveal}>
                {/* React Bits SpotlightCard: cursor-tracking blue glow */}
                <SpotlightCard className="ct-card h-full p-5">
                  <Icon className="h-6 w-6 text-[#2E8DFF]" />
                  <h3 className="mt-3 font-heading text-lg tracking-wide text-white">{r.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#9AA7B6]">{r.desc}</p>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Member video stories — "I thought I couldn't." */}
      <div className="mt-14 border-t border-[#1E2A38] pt-10">
        <div className="mb-6">
          <Eyebrow>{RESULTS.storiesEyebrow}</Eyebrow>
          <h3 className="ct-display mt-3 text-3xl sm:text-4xl">
            <span>{RESULTS.storiesTitle[0]} </span><span className="accent">{RESULTS.storiesTitle[1]}</span>
          </h3>
        </div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={vpOnce}
          variants={stagger}
          className="ct-scroll-x -mx-6 gap-4 px-6 pb-2 scroll-pl-6 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4"
        >
          {/* Phone: swipe through stories instead of four stacked 4:5 cards */}
          {RESULTS.stories.map((s) => (
            <motion.figure key={s.id} variants={reveal} className="ct-card group w-[78vw] max-w-[320px] overflow-hidden sm:w-auto sm:max-w-none">
              <div className="group/v relative overflow-hidden">
                {/* React Bits GlareHover: light sweep across the story media on hover */}
                <GlareHover>
                  <MediaSlot media={{ ...s.media, ratio: "4/5" }} video={s.video} align="items-center" scrim="ct-media__scrim--full">
                    {s.video && (
                      <button
                        type="button"
                        onClick={() => setReel(s)}
                        aria-label={`Play ${s.name}'s story`}
                        className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur transition-transform group-hover/v:scale-110"
                      >
                        <Play className="h-7 w-7 fill-white text-white" />
                      </button>
                    )}
                  </MediaSlot>
                </GlareHover>
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 bg-[#1F6FE0] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                  <Trophy className="h-2.5 w-2.5" /> {s.achieved}
                </span>
              </div>
              <figcaption className="p-5">
                <Quote className="h-5 w-5 text-[#2E8DFF]" />
                <p className="mt-2 text-sm leading-relaxed text-white">“{s.quote}”</p>
                <p className="mt-3 text-sm font-bold text-white">{s.name}</p>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>

        {reel && (
          <dialog
            // showModal() for the backdrop + focus trap; every close routes
            // through state instead of the dialog's own close event, because
            // unmounting is the only thing that reliably stops the audio.
            ref={(el) => { if (el && !el.open) el.showModal(); }}
            onClick={(e) => { if (e.target === e.currentTarget) setReel(null); }}
            onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); setReel(null); } }}
            className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-4 backdrop:bg-black/85 open:flex open:items-center open:justify-center"
          >
            <video
              src={reel.video}
              poster={reel.media?.img}
              controls
              autoPlay
              playsInline
              className="max-h-full w-auto max-w-full"
            />
            <button
              type="button"
              onClick={() => setReel(null)}
              aria-label="Close video"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white backdrop-blur"
            >
              <X className="h-5 w-5" />
            </button>
          </dialog>
        )}
      </div>
    </Section>
  );
}

// ── SECTION 14 · Memberships ──────────────────────────────────────────────
export function MembershipsSection({ onBookTrial }) {
  return (
    <Section id="memberships">
      <Header eyebrow={MEMBERSHIPS.eyebrow} lines={MEMBERSHIPS.title} sub={MEMBERSHIPS.sub} center maxSub="max-w-2xl" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={vpOnce}
        variants={stagger}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {MEMBERSHIPS.tiers.map((tier) => (
          <motion.div key={tier.name} variants={reveal} className="relative">
            {/* Badge lives outside the SpotlightCard — its overflow:hidden would clip the -top offset */}
            {tier.badge && (
              <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 bg-[#2E8DFF] px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                {tier.badge}
              </span>
            )}
            {/* React Bits SpotlightCard: cursor-tracking glow, stronger on the featured tier */}
            <SpotlightCard
              spotlightColor={tier.featured ? "rgba(46, 141, 255, 0.22)" : "rgba(46, 141, 255, 0.12)"}
              className={`flex h-full flex-col p-6 ${
                tier.featured
                  ? "border-2 border-[#2E8DFF] bg-[#131B25] shadow-[0_0_40px_rgba(46,141,255,0.18)]"
                  : "ct-card"
              }`}
            >
            <h3 className="font-heading text-2xl tracking-wide text-white">{tier.name}</h3>
            <p className="text-xs uppercase tracking-widest text-[#9AA7B6]">{tier.caption}</p>
            <p className="mt-4 font-heading text-4xl text-white">
              <span className={tier.featured ? "text-[#2E8DFF]" : undefined}>{tier.price}</span>
              <span className="text-sm text-[#9AA7B6]">{tier.period}</span>
            </p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-[#9AA7B6]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2E8DFF]" /> {f}
                </li>
              ))}
            </ul>
            {tier.name === "Trial Session" ? (
              <button onClick={onBookTrial} className={`mt-6 justify-center text-xs ${tier.featured ? "btn-primary" : "btn-secondary"}`}>
                {tier.cta} <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <Link to="/pricing" className={`mt-6 justify-center text-xs ${tier.featured ? "btn-primary" : "btn-secondary"}`}>
                {tier.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            </SpotlightCard>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={vpOnce}
        variants={reveal}
        className="mt-6 flex items-center justify-center gap-3 border border-[#2E8DFF]/30 bg-[#2E8DFF]/5 px-6 py-4 text-center"
      >
        <Sparkles className="h-5 w-5 shrink-0 text-[#2E8DFF]" />
        <p className="text-sm text-white">{MEMBERSHIPS.assessmentNote}</p>
      </motion.div>
    </Section>
  );
}

// ── SECTION 15 · FAQ ──────────────────────────────────────────────────────
export function FaqSection({ onBookTrial }) {
  const [open, setOpen] = useState(0);
  return (
    <Section id="faq" className="bg-[#0E141C]">
      <Header eyebrow={FAQ.eyebrow} lines={FAQ.title} sub={FAQ.sub} center maxSub="max-w-2xl" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={vpOnce}
        variants={stagger}
        className="mx-auto max-w-3xl space-y-3"
      >
        {FAQ.items.map((item, i) => (
          <motion.div key={item.q} variants={reveal} className="faq-panel border border-[#1E2A38] bg-[#131B25]">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
              aria-expanded={open === i}
            >
              <span className="text-sm font-medium text-white">{item.q}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-[#2E8DFF] transition-transform duration-200 ${open === i ? "rotate-180" : ""}`} />
            </button>
            <div className={`faq-answer px-6 ${open === i ? "is-open" : ""}`}>
              <p className="pb-4 text-sm leading-relaxed text-[#9AA7B6]">{item.a}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={vpOnce} variants={reveal} className="mt-8 text-center">
        <p className="ct-sub mb-4 text-sm">Ready to find your answers in person?</p>
        <button onClick={onBookTrial} className="btn-primary mx-auto text-sm">
          Book Trial Session <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    </Section>
  );
}

// ── SECTION 16 · Final CTA — cinematic background ─────────────────────────
export function FinalCtaSection({ onBookTrial }) {
  const ref = useRef(null);
  const near = useInView(ref, { once: true, margin: "400px 0px" });
  const heavy = useClientValue(() => !lowPower(), false);

  return (
    <section ref={ref} id="final-cta" className="relative isolate flex min-h-[70vh] items-center overflow-hidden bg-[#0B1016] px-6 py-28">
      {/* MuscleUp3D: particle-constellation athlete looping a muscle-up behind
          the headline (replaces the old Orb) — same ink-dot language as the
          Training Programs hero silhouette, but the skeleton is animated
          through the full rep. Reduced motion freezes it at the top. */}
      {near && heavy && (
        <Suspense fallback={null}>
          <MuscleUp3D className="-z-10 opacity-70" />
        </Suspense>
      )}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(90%_120%_at_50%_0%,rgba(46,141,255,0.14),transparent_60%)]" />
      <div className="hero-grain pointer-events-none absolute inset-0 -z-10 opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-4xl text-center"
      >
        <Eyebrow center>Final Step</Eyebrow>
        {/* React Bits SplitText: word-by-word reveal mirroring the hero headline */}
        <h2 className="ct-display mx-auto mt-5 text-5xl sm:text-6xl lg:text-7xl">
          <SplitText text={FINAL_CTA.title[0]} className="block" splitType="words" delay={70} />
          <SplitText text={FINAL_CTA.title[1]} className="block accent" splitType="words" delay={70} startDelay={0.25} />
        </h2>
        <p className="ct-sub mx-auto mt-6 max-w-xl text-base">{FINAL_CTA.sub}</p>
        {/* React Bits Magnet: magnetic pull on the closing CTA */}
        <Magnet>
          <button onClick={onBookTrial} className="btn-primary mt-9 text-sm">
            {FINAL_CTA.primaryCta} <ArrowRight className="h-4 w-4" />
          </button>
        </Magnet>
      </motion.div>
    </section>
  );
}
