// Sections 7–9: First Session · Training Disciplines · Coaches  (image-first)
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Quote, Trophy } from "lucide-react";
import { Header, MediaSlot, Section } from "./ui";
import { reveal, stagger, vpOnce } from "./anim";
import { FIRST_SESSION, DISCIPLINES, COACHES } from "@/data/home";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

// ── SECTION 7 · First Session — photo-backed step flow w/ arrow connectors ─
function StepCard({ step }) {
  const Icon = step.icon;
  return (
    <div className="group h-full overflow-hidden rounded-sm border border-[#16324E]">
      <MediaSlot media={{ ...step.media, ratio: "4/5" }} align="" scrim="ct-media__scrim--full">
        <div className="flex items-start justify-between">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-[#8DB6D7]/40 bg-[#051220]/70 text-[#8DB6D7] backdrop-blur">
            <Icon className="h-4 w-4" />
          </span>
          <span className="font-heading text-3xl leading-none text-white/30">{step.n}</span>
        </div>
        <div className="mt-auto">
          <h3 className="font-heading text-lg leading-tight tracking-wide text-white">{step.title}</h3>
          <p className="mt-1 text-[11px] leading-snug text-[#C3D6E7]">{step.desc}</p>
          <p className="mt-2 inline-flex items-center gap-1 border-t border-white/10 pt-2 text-[10px] font-medium uppercase tracking-wide text-[#8DB6D7]">
            {step.expect}
          </p>
        </div>
      </MediaSlot>
    </div>
  );
}

export function FirstSessionSection({ onBookTrial }) {
  const steps = FIRST_SESSION.steps;
  return (
    <Section id="first-session">
      <Header eyebrow={FIRST_SESSION.eyebrow} lines={FIRST_SESSION.title} sub={FIRST_SESSION.sub} />

      {/* Desktop: horizontal flow with arrow connectors */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={vpOnce}
        variants={stagger}
        className="hidden items-stretch gap-2 lg:flex"
      >
        {steps.map((step, i) => (
          <motion.div key={step.n} variants={reveal} className="flex flex-1 items-stretch">
            <div className="flex-1"><StepCard step={step} /></div>
            {i < steps.length - 1 && (
              <ArrowRight className="mx-1 h-5 w-5 shrink-0 self-center text-[#8DB6D7]" aria-hidden="true" />
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Mobile/tablet: poster grid */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={vpOnce}
        variants={stagger}
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:hidden"
      >
        {steps.map((step) => (
          <motion.div key={step.n} variants={reveal}><StepCard step={step} /></motion.div>
        ))}
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={vpOnce}
        variants={stagger}
        className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-col gap-4 sm:flex-row">
          {FIRST_SESSION.reassurance.map((r) => {
            const Icon = r.icon;
            return (
              <motion.div key={r.title} variants={reveal} className="flex items-start gap-3 border border-[#16324E] bg-[#0A1D31] px-4 py-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#8DB6D7]" />
                <div>
                  <div className="text-sm font-semibold text-white">{r.title}</div>
                  <div className="text-xs text-[#92ABC4]">{r.desc}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
        <motion.button variants={reveal} onClick={onBookTrial} className="btn-primary justify-center text-sm">
          Book Your First Session <ArrowRight className="h-4 w-4" />
        </motion.button>
      </motion.div>
    </Section>
  );
}

// ── SECTION 8 · Training Disciplines — infinite moving cards (marquee) ─────
// Aceternity infinite-moving-cards (src/components/ui/) with discipline cards
// rendered through MediaSlot so each picks up its real photo once wired in
// home.js. Pauses on hover; edges fade via mask. Cards link to /programs.
function DisciplineCard({ d }) {
  const Icon = d.icon;
  return (
    <Link to="/programs" className="group block w-[300px] overflow-hidden rounded-2xl border border-[#16324E] md:w-[420px]">
      <MediaSlot media={{ ...d.media, ratio: "3/2" }} align="" scrim="ct-media__scrim--full">
        <div className="flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-[#8DB6D7]/40 bg-[#051220]/70 text-[#8DB6D7] backdrop-blur">
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-auto">
          <h3 className="font-heading text-xl tracking-wide text-white md:text-2xl">{d.name}</h3>
          <p className="mt-1 text-[11px] leading-snug text-[#C3D6E7] md:text-xs">{d.desc}</p>
          <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#8DB6D7] transition-transform group-hover:translate-x-1">
            Learn More <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </MediaSlot>
    </Link>
  );
}

export function DisciplinesSection() {
  return (
    <Section id="disciplines" className="bg-[#081727]">
      <Header eyebrow={DISCIPLINES.eyebrow} lines={DISCIPLINES.title} sub={DISCIPLINES.sub} />

      <motion.div initial="hidden" whileInView="visible" viewport={vpOnce} variants={reveal}>
        <InfiniteMovingCards
          items={DISCIPLINES.items}
          direction="right"
          speed="slow"
          pauseOnHover
          className="mx-auto"
          renderItem={(d) => <DisciplineCard d={d} />}
        />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={vpOnce}
        variants={reveal}
        className="mt-8 flex justify-center"
      >
        <Link to="/programs" className="btn-secondary text-xs">
          Explore All Programs <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </Section>
  );
}

// ── SECTION 9 · Coaches — portrait cards + nested member success quotes ────
export function CoachesSection() {
  return (
    <Section id="coaches">
      <Header eyebrow={COACHES.eyebrow} lines={COACHES.title} sub={COACHES.sub} />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={vpOnce}
        variants={stagger}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {COACHES.items.map((coach) => (
          <motion.article key={coach.role + coach.name} variants={reveal} className="ct-card flex flex-col overflow-hidden">
            <div className={`group overflow-hidden ${coach.placeholder ? "opacity-80" : ""}`}>
              <MediaSlot media={{ ...coach.media, ratio: "3/4" }} align="" scrim="ct-media__scrim--full">
                <div className="flex">
                  <span className="bg-[#8DB6D7] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#041C38]">{coach.tag}</span>
                </div>
                <div className="mt-auto">
                  <h3 className="font-heading text-xl leading-none tracking-wide text-white">{coach.name}</h3>
                  <p className="mt-1 text-xs font-medium text-[#C3D6E7]">{coach.role}</p>
                </div>
              </MediaSlot>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#92ABC4]">{coach.placeholder ? "Focus Areas" : "Results Coached"}</p>
              <ul className="mt-2 space-y-1.5">
                {coach.outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-2 text-xs text-white">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8DB6D7]" /> {o}
                  </li>
                ))}
              </ul>

              {coach.memberQuote ? (
                <figure className="mt-auto border-t border-[#16324E] pt-3">
                  <p className="flex gap-1.5 text-xs italic leading-relaxed text-[#C3D6E7]">
                    <Quote className="h-3.5 w-3.5 shrink-0 text-[#8DB6D7]" /> {coach.memberQuote.text}
                  </p>
                  <figcaption className="mt-2 flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-[#8DB6D7]/15 font-heading text-[10px] text-[#8DB6D7]">
                      {coach.memberQuote.name.charAt(0)}
                    </span>
                    <span className="text-[11px] font-semibold text-white">{coach.memberQuote.name}</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#8DB6D7]">
                      <Trophy className="h-2.5 w-2.5" /> {coach.memberQuote.achieved}
                    </span>
                  </figcaption>
                </figure>
              ) : (
                <p className="mt-auto border-t border-[#16324E] pt-3 text-xs italic text-[#5A7896]">
                  We're growing our coaching team — this profile is on the way.
                </p>
              )}
            </div>
          </motion.article>
        ))}
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={vpOnce}
        variants={reveal}
        className="mt-8 flex flex-col items-center justify-between gap-4 border border-[#16324E] bg-[#0A1D31] px-6 py-5 sm:flex-row"
      >
        <p className="text-sm text-[#92ABC4]">{COACHES.footnote}</p>
        <Link to="/coaches" className="btn-secondary shrink-0 text-xs">
          Meet The Team <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </Section>
  );
}
