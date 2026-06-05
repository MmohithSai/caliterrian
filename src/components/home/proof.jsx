// Sections 10–14: Results · Memberships · FAQ · Final CTA  (image-first)
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronDown, Play, Quote, Sparkles, Trophy } from "lucide-react";
import { Eyebrow, Header, MediaSlot, Section, StatRing } from "./ui";
import { reveal, stagger, vpOnce } from "./anim";
import { RESULTS, MEMBERSHIPS, FAQ, FINAL_CTA } from "@/data/home";

// ── SECTION 10 · Results — outcome rings + member video stories ────────────
// Consolidates the old Why-Stay, Member-Journeys and Testimonials sections.
export function ResultsSection() {
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
              <motion.div key={r.title} variants={reveal} className="ct-card p-5">
                <Icon className="h-6 w-6 text-[#2E8DFF]" />
                <h3 className="mt-3 font-heading text-lg tracking-wide text-white">{r.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#9AA7B6]">{r.desc}</p>
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
          className="grid grid-cols-1 gap-5 sm:grid-cols-3"
        >
          {RESULTS.stories.map((s) => (
            <motion.figure key={s.id} variants={reveal} className="ct-card group overflow-hidden">
              <div className="group/v relative overflow-hidden">
                <MediaSlot media={{ ...s.media, ratio: "4/5" }} video={s.video} align="items-center" scrim="ct-media__scrim--full">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur transition-transform group-hover/v:scale-110">
                    <Play className="h-7 w-7 fill-white text-white" />
                  </span>
                </MediaSlot>
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 bg-[#2E8DFF] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
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
          <motion.div
            key={tier.name}
            variants={reveal}
            className={`relative flex flex-col p-6 ${
              tier.featured
                ? "border-2 border-[#2E8DFF] bg-[#131B25] shadow-[0_0_40px_rgba(46,141,255,0.18)]"
                : "ct-card"
            }`}
          >
            {tier.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2E8DFF] px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                {tier.badge}
              </span>
            )}
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
  return (
    <section id="final-cta" className="relative isolate flex min-h-[60vh] items-center overflow-hidden px-6 py-28">
      <MediaSlot
        media={{ label: "Facility / training panorama", hint: "", ratio: undefined }}
        video={FINAL_CTA.video}
        parallax
        zoom={false}
        overlay={false}
        showLabel={false}
        className="absolute inset-0 -z-10"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(11,16,22,0.86),rgba(11,16,22,0.92))]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(90%_120%_at_50%_0%,rgba(46,141,255,0.26),transparent_60%)]" />
      <div className="hero-grain pointer-events-none absolute inset-0 -z-10 opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-4xl text-center"
      >
        <Eyebrow center>Final Step</Eyebrow>
        <h2 className="ct-display mx-auto mt-5 text-5xl sm:text-6xl lg:text-7xl">
          <span className="block">{FINAL_CTA.title[0]}</span>
          <span className="block accent">{FINAL_CTA.title[1]}</span>
        </h2>
        <p className="ct-sub mx-auto mt-6 max-w-xl text-base">{FINAL_CTA.sub}</p>
        <button onClick={onBookTrial} className="btn-primary mx-auto mt-9 text-sm">
          {FINAL_CTA.primaryCta} <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    </section>
  );
}
