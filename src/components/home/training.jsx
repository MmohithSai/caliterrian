// Homepage training sections: Training Disciplines and Coaches.
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Quote, Trophy } from "lucide-react";
import { Header, MediaSlot, Section } from "./ui";
import { reveal, stagger, vpOnce } from "./anim";
import { DISCIPLINES, COACHES } from "@/data/home";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

// Training Disciplines — infinite moving cards (marquee).
// Aceternity infinite-moving-cards (src/components/ui/) with discipline cards
// rendered through MediaSlot so each picks up its real photo once wired in
// home.js. Pauses on hover; edges fade via mask. Cards link to /programs.
function DisciplineCard({ d }) {
  const Icon = d.icon;
  return (
    <Link to="/programs" className="group block w-[300px] max-w-[85vw] overflow-hidden rounded-2xl border border-[#1E2A38] md:w-[420px]">
      <MediaSlot media={{ ...d.media, ratio: "3/2" }} align="" scrim="ct-media__scrim--full">
        <div className="flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-[#2E8DFF]/40 bg-[#0B1016]/70 text-[#2E8DFF] backdrop-blur">
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-auto">
          <h3 className="font-heading text-xl tracking-wide text-white md:text-2xl">{d.name}</h3>
          <p className="mt-1 text-[11px] leading-snug text-[#C6D2DF] md:text-xs">{d.desc}</p>
          <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#2E8DFF] transition-transform group-hover:translate-x-1">
            Learn More <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </MediaSlot>
    </Link>
  );
}

export function DisciplinesSection() {
  return (
    <Section id="disciplines" className="bg-[#0E141C]">
      <Header eyebrow={DISCIPLINES.eyebrow} lines={DISCIPLINES.title} sub={DISCIPLINES.sub} />

      <motion.div initial="hidden" whileInView="visible" viewport={vpOnce} variants={reveal}>
        {/* Phone: swipeable cards — a marquee can't be paused or aimed at on touch */}
        <div className="-mx-6 sm:hidden">
          <ul className="ct-scroll-x gap-3 px-6 py-2 scroll-pl-6">
            {DISCIPLINES.items.map((d) => (
              <li key={d.name}><DisciplineCard d={d} /></li>
            ))}
          </ul>
        </div>
        <div className="hidden sm:block">
          <InfiniteMovingCards
            items={DISCIPLINES.items}
            direction="right"
            speed="slow"
            pauseOnHover
            className="mx-auto"
            renderItem={(d) => <DisciplineCard d={d} />}
          />
        </div>
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

// Coaches — portrait cards + nested member success quotes.
export function CoachesSection() {
  return (
    <Section id="coaches">
      <Header eyebrow={COACHES.eyebrow} lines={COACHES.title} sub={COACHES.sub} />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={vpOnce}
        variants={stagger}
        className="ct-scroll-x -mx-6 gap-4 px-6 pb-2 scroll-pl-6 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4"
      >
        {/* Phone: one portrait card per swipe instead of four 800px cards stacked */}
        {COACHES.items.map((coach) => (
          <motion.article key={coach.role + coach.name} variants={reveal} className="ct-card flex w-[82vw] max-w-[340px] flex-col overflow-hidden sm:w-auto sm:max-w-none">
            <div className={`group overflow-hidden ${coach.placeholder ? "opacity-80" : ""}`}>
              <MediaSlot media={{ ...coach.media, ratio: "3/4" }} align="" scrim="ct-media__scrim--full">
                <div className="flex">
                  <span className="bg-[#1F6FE0] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">{coach.tag}</span>
                </div>
                <div className="mt-auto">
                  <h3 className="font-heading text-xl leading-none tracking-wide text-white">{coach.name}</h3>
                  <p className="mt-1 text-xs font-medium text-[#C6D2DF]">{coach.role}</p>
                </div>
              </MediaSlot>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9AA7B6]">{coach.placeholder ? "Focus Areas" : "Results Coached"}</p>
              <ul className="mt-2 space-y-1.5">
                {coach.outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-2 text-xs text-white">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2E8DFF]" /> {o}
                  </li>
                ))}
              </ul>

              {coach.memberQuote ? (
                <figure className="mt-auto border-t border-[#1E2A38] pt-3">
                  <p className="flex gap-1.5 text-xs italic leading-relaxed text-[#C6D2DF]">
                    <Quote className="h-3.5 w-3.5 shrink-0 text-[#2E8DFF]" /> {coach.memberQuote.text}
                  </p>
                  <figcaption className="mt-2 flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-[#2E8DFF]/15 font-heading text-[10px] text-[#2E8DFF]">
                      {coach.memberQuote.name.charAt(0)}
                    </span>
                    <span className="text-[11px] font-semibold text-white">{coach.memberQuote.name}</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#2E8DFF]">
                      <Trophy className="h-2.5 w-2.5" /> {coach.memberQuote.achieved}
                    </span>
                  </figcaption>
                </figure>
              ) : (
                <p className="mt-auto border-t border-[#1E2A38] pt-3 text-xs italic text-[#5C6B7C]">
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
        className="mt-8 flex flex-col items-center justify-between gap-4 border border-[#1E2A38] bg-[#131B25] px-6 py-5 sm:flex-row"
      >
        <p className="text-sm text-[#9AA7B6]">{COACHES.footnote}</p>
        <Link to="/coaches" className="btn-secondary shrink-0 text-xs">
          Meet The Team <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </Section>
  );
}
