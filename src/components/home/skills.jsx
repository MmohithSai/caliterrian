// Sections 4–6: Skill Tree · Hall of Firsts · Member Journeys  (image-first)
import { lazy, Suspense, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Circle, CircleDot, Clock, Compass, Flame, Gauge, Map, Play, Quote } from "lucide-react";
import { Header, MediaSlot, Section } from "./ui";
import { reveal, stagger, vpOnce, fade } from "./anim";
import { SKILLS, HALL_OF_FIRSTS, COMMUNITY } from "@/data/home";
import ScrollStack, { ScrollStackItem } from "@/components/reactbits/ScrollStack";

// Three.js + GSAP land in their own chunk, fetched only when the section nears
// the viewport.
const HallOfFirstsGallery3D = lazy(() => import("./HallOfFirstsGallery3D"));
const SkillTree3D = lazy(() => import("./SkillTree3D"));

// Difficulty → presentation map for the skill graph (icon + modifier class).
const LEVEL_META = {
  Beginner:     { icon: Circle,    mod: "beginner" },
  Intermediate: { icon: CircleDot, mod: "intermediate" },
  Advanced:     { icon: Flame,     mod: "advanced" },
};

// Walk the prereq chain to collect every ancestor of a node (the path to it).
function ancestorsOf(id, byId) {
  const out = new Set();
  const walk = (i) => (byId[i]?.prereq || []).forEach((p) => { if (!out.has(p)) { out.add(p); walk(p); } });
  walk(id);
  return out;
}

// ── SECTION 4 · Skill Tree (RPG dependency graph) ─────────────────────────
export function SkillTreeSection({ onBookTrial }) {
  const nodes = SKILLS.nodes;
  const byId = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);

  const [activeId, setActiveId] = useState("muscle-up");
  const active = byId[activeId];
  const nameOf = (id) => byId[id]?.name;

  const rm = useReducedMotion();
  // Detail-rail content cascades in on every skill switch (calm fade if reduced).
  const itemV = rm ? fade : reveal;

  // The illuminated path to the active node (its ancestors + itself).
  const pathSet = useMemo(() => new Set([...ancestorsOf(activeId, byId), activeId]), [activeId, byId]);
  // Skills this node opens up next.
  const unlocks = nodes.filter((n) => n.prereq.includes(activeId));

  const LevelIcon = LEVEL_META[active.difficulty].icon;

  return (
    <Section id="skill-tree" className="bg-[#0E141C]">
      <Header eyebrow={SKILLS.eyebrow} lines={SKILLS.title} sub={SKILLS.sub} maxSub="max-w-3xl" />

      {/* Legend */}
      <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2">
        {SKILLS.legend.map((l) => {
          const Icon = LEVEL_META[l.level].icon;
          return (
            <span key={l.level} className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[#9AA7B6]">
              <span className={`ct-skill ct-skill--${LEVEL_META[l.level].mod} flex h-5 w-5 items-center justify-center rounded-full`}>
                <Icon className="h-3 w-3" />
              </span>
              {l.label}
            </span>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ── 3D constellation — WebGL chunk deferred until the section nears ── */}
        <div className="min-w-0 max-w-full lg:col-span-3">
          <SkillTreeMount nodes={nodes} activeId={activeId} pathSet={pathSet} onSelect={setActiveId} />

          {/* Blueprint note — this graph is a general roadmap, not personal tracking */}
          <div className="mt-4 flex flex-col items-center gap-4 border border-[#1E2A38] bg-[#131B25] px-5 py-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#2E8DFF]/40 bg-[#2E8DFF]/10 text-[#2E8DFF]">
                <Map className="h-6 w-6" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#9AA7B6]">{SKILLS.blueprint.title}</p>
                <p className="text-sm leading-snug text-white">{SKILLS.blueprint.note}</p>
              </div>
            </div>
            <button onClick={onBookTrial} className="btn-secondary shrink-0 text-xs">
              <Compass className="h-4 w-4" /> Get Your Full Roadmap At The Gym
            </button>
          </div>
        </div>

        {/* ── Detail rail ────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -12 }}
              variants={stagger}
              transition={{ duration: 0.3 }}
              className="ct-card p-5"
            >
              <motion.div variants={itemV} className="group relative mb-4 overflow-hidden rounded-sm">
                <MediaSlot media={{ label: `${active.name} demo`, hint: "", ratio: "16/9" }} img={active.img} align="items-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur transition-transform group-hover:scale-110">
                    <Play className="h-5 w-5 fill-white text-white" />
                  </span>
                </MediaSlot>
              </motion.div>

              <motion.div variants={itemV} className="flex items-center justify-between gap-3">
                <h3 className="font-heading text-3xl tracking-wide text-white">{active.name}</h3>
                <span className={`ct-skill-badge ct-skill-badge--${LEVEL_META[active.difficulty].mod} inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest`}>
                  <LevelIcon className="h-3 w-3" /> {active.difficulty}
                </span>
              </motion.div>
              <motion.p variants={itemV} className="mt-2 text-sm leading-relaxed text-[#9AA7B6]">{active.desc}</motion.p>

              <motion.div variants={itemV} className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <Meta icon={Clock} label="Avg. Timeline" value={active.time} />
                <Meta icon={Gauge} label="Stage" value={active.tier} />
              </motion.div>

              <motion.div variants={itemV} className="mt-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#9AA7B6]">Requirements</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {active.prereq.length === 0 ? (
                    <span className="border border-[#2E8DFF]/30 bg-[#2E8DFF]/10 px-2.5 py-1 text-xs text-[#2E8DFF]">No prerequisites — start here</span>
                  ) : (
                    active.prereq.map((p) => (
                      <button
                        key={p}
                        onClick={() => setActiveId(p)}
                        className="border border-[#1E2A38] bg-[#0B1016] px-2.5 py-1 text-xs text-white transition-colors hover:border-[#2E8DFF]/50"
                      >
                        {nameOf(p)}
                      </button>
                    ))
                  )}
                </div>
              </motion.div>

              {/* Coach insight */}
              <motion.div variants={itemV} className="mt-5 flex gap-2 border-l-2 border-[#2E8DFF] bg-[#0B1016] px-4 py-3">
                <Quote className="h-4 w-4 shrink-0 text-[#2E8DFF]" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#9AA7B6]">Coach Insight</p>
                  <p className="mt-0.5 text-sm italic text-[#C6D2DF]">{active.insight}</p>
                </div>
              </motion.div>

              {/* What it leads to next on the blueprint */}
              {unlocks.length > 0 && (
                <motion.div variants={itemV} className="mt-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#9AA7B6]">Leads To</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {unlocks.map((u) => (
                      <button key={u.id} onClick={() => setActiveId(u.id)} className="inline-flex items-center gap-1 border border-[#1E2A38] bg-[#0B1016] px-2.5 py-1 text-xs text-white transition-colors hover:border-[#2E8DFF]/50">
                        {u.name} <ArrowRight className="h-3 w-3 text-[#2E8DFF]" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.button
                variants={itemV}
                onClick={onBookTrial}
                whileHover={rm ? undefined : { scale: 1.02 }}
                whileTap={rm ? undefined : { scale: 0.98 }}
                className="btn-primary mt-6 w-full justify-center text-xs"
              >
                Train This Skill With A Coach <ArrowRight className="h-4 w-4" />
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}

// Defers the skill-tree WebGL chunk until it approaches the viewport, keeping
// a same-size placeholder so the page never jumps while it loads.
function SkillTreeMount(props) {
  const ref = useRef(null);
  const near = useInView(ref, { once: true, margin: "500px 0px" });
  return (
    <div ref={ref}>
      {near ? (
        <Suspense fallback={<SkillTreePlaceholder />}>
          <SkillTree3D {...props} />
        </Suspense>
      ) : (
        <SkillTreePlaceholder />
      )}
    </div>
  );
}

function SkillTreePlaceholder() {
  return (
    <div className="flex h-[440px] w-full items-center justify-center rounded-sm border border-[#1E2A38] bg-[#0B1016] sm:h-[500px]">
      <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Loading skill tree…</span>
    </div>
  );
}

function Meta({ icon: Icon, label, value }) {
  return (
    <div className="border border-[#1E2A38] bg-[#0B1016] p-3">
      <Icon className="h-4 w-4 text-[#2E8DFF]" />
      <div className="mt-2 text-[10px] uppercase tracking-widest text-[#9AA7B6]">{label}</div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

// ── SECTION 5 · Hall of Firsts — live achievement feed ────────────────────
export function HallOfFirstsSection({ onBookTrial }) {
  return (
    <Section id="hall-of-firsts">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Header eyebrow={HALL_OF_FIRSTS.eyebrow} lines={HALL_OF_FIRSTS.title} sub={HALL_OF_FIRSTS.sub} maxSub="max-w-2xl" />
        <span className="mb-12 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#9AA7B6]">
          Drag to explore
        </span>
      </div>

      {/* Spherical milestone wall — drag to look around, click a first to open it */}
      <HallGalleryMount onBookTrial={onBookTrial} />

      {/* Community — folded in: the feed is where the culture lives */}
      <div className="mt-12 border-t border-[#1E2A38] pt-10">
        <div className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-heading text-2xl tracking-wide text-white">{COMMUNITY.title[0]} <span className="accent">{COMMUNITY.title[1]}</span></h3>
          <p className="text-sm text-[#9AA7B6]">{COMMUNITY.sub}</p>
        </div>
        {/* Scroll-driven card stack (React Bits ScrollStack) — scroll inside the
            panel and each family pillar pins + stacks on the one before it. */}
        <ScrollStack
          className="ct-community-stack"
          itemDistance={140}
          itemStackDistance={22}
          baseScale={0.88}
          stackPosition="18%"
          scaleEndPosition="8%"
        >
          {COMMUNITY.items.map((c, i) => {
            const Icon = c.icon;
            return (
              <ScrollStackItem key={c.name} itemClassName="ct-community-card">
                <div className="ct-community-card__grid">
                  <div className="ct-community-card__body">
                    <div className="flex items-center justify-between gap-3">
                      <span className="ct-community-card__badge">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="ct-community-card__index">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h4 className="ct-community-card__title">{c.name}</h4>
                    <p className="ct-community-card__desc">{c.desc}</p>
                  </div>
                  <div className="ct-community-card__media">
                    <MediaSlot media={{ ...c.media, ratio: undefined }} align="" scrim="ct-media__scrim--full" />
                  </div>
                </div>
              </ScrollStackItem>
            );
          })}
        </ScrollStack>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={vpOnce}
        variants={reveal}
        className="mt-8 flex flex-col items-center justify-between gap-4 border border-[#1E2A38] bg-[#131B25] px-6 py-5 sm:flex-row"
      >
        <p className="text-sm text-white">
          <span className="font-semibold">Your story could be next.</span>{" "}
          <span className="text-[#9AA7B6]">Hundreds of members achieve their firsts every month.</span>
        </p>
        <button onClick={onBookTrial} className="btn-primary shrink-0 text-xs">
          Book Your Trial Session <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    </Section>
  );
}

// Defers the WebGL chunk until the section is close to the viewport, then
// keeps a sized placeholder so the page never jumps while it loads.
function HallGalleryMount({ onBookTrial }) {
  const ref = useRef(null);
  const near = useInView(ref, { once: true, margin: "600px 0px" });
  return (
    <div ref={ref}>
      {near ? (
        <Suspense fallback={<HallGalleryPlaceholder />}>
          <HallOfFirstsGallery3D onBookTrial={onBookTrial} />
        </Suspense>
      ) : (
        <HallGalleryPlaceholder />
      )}
    </div>
  );
}

function HallGalleryPlaceholder() {
  return (
    <div className="flex h-[80vh] min-h-[560px] w-full items-center justify-center rounded-lg border border-[#1E2A38] bg-[#05080D] sm:h-[88vh]">
      <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Loading experience…</span>
    </div>
  );
}

