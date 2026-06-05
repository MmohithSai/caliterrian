// Sections 4–6: Skill Tree · Hall of Firsts · Member Journeys  (image-first)
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Circle, CircleDot, Clock, Compass, Gauge, Heart, Lock, Play, Plus, Quote, Trophy } from "lucide-react";
import { Header, MediaSlot, Section } from "./ui";
import { reveal, stagger, vpOnce } from "./anim";
import { SKILLS, HALL_OF_FIRSTS, COMMUNITY } from "@/data/home";

// State → presentation map for the skill graph (icon + label + CTA verb).
const STATE_META = {
  mastered:     { icon: Check,     label: "Mastered",    cta: "Review This Skill" },
  "in-progress":{ icon: CircleDot, label: "In Progress", cta: "Continue This Skill" },
  available:    { icon: Circle,    label: "Available",   cta: "Start Working On This Skill" },
  locked:       { icon: Lock,      label: "Locked",      cta: "Unlock This Skill" },
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
  const edges = useMemo(
    () => nodes.flatMap((n) => n.prereq.map((p) => ({ from: p, to: n.id }))),
    [nodes],
  );

  const [activeId, setActiveId] = useState("muscle-up");
  const active = byId[activeId];
  const nameOf = (id) => byId[id]?.name;

  // The illuminated path to the active node (its ancestors + itself).
  const pathSet = useMemo(() => new Set([...ancestorsOf(activeId, byId), activeId]), [activeId, byId]);
  // Skills this node opens up next.
  const unlocks = nodes.filter((n) => n.prereq.includes(activeId));

  // Personal progress widget (mastered counts full, in-progress counts half).
  const counts = nodes.reduce((a, n) => ((a[n.state] = (a[n.state] || 0) + 1), a), {});
  const progress = Math.round(((counts.mastered || 0) + 0.5 * (counts["in-progress"] || 0)) / nodes.length * 100);

  const StateIcon = STATE_META[active.state].icon;

  return (
    <Section id="skill-tree" className="bg-[#0E141C]">
      <Header eyebrow={SKILLS.eyebrow} lines={SKILLS.title} sub={SKILLS.sub} maxSub="max-w-3xl" />

      {/* Legend */}
      <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2">
        {SKILLS.legend.map((l) => {
          const Icon = STATE_META[l.state].icon;
          return (
            <span key={l.state} className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[#9AA7B6]">
              <span className={`ct-skill ct-skill--${l.state} flex h-5 w-5 items-center justify-center rounded-full`}>
                <Icon className="h-3 w-3" />
              </span>
              {l.label}
            </span>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ── Graph canvas ───────────────────────────────────────────────── */}
        <div className="lg:col-span-3">
          <div className="overflow-x-auto rounded-sm border border-[#1E2A38] bg-[#0B1016] p-2">
            <div className="relative mx-auto h-[420px] min-w-[560px]">
              {/* Edge layer */}
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {edges.map((e) => {
                  const a = byId[e.from], b = byId[e.to];
                  const lit = pathSet.has(e.from) && pathSet.has(e.to);
                  return (
                    <line
                      key={`${e.from}-${e.to}`}
                      x1={a.pos.x} y1={a.pos.y} x2={b.pos.x} y2={b.pos.y}
                      stroke={lit ? "#2E8DFF" : "#1E2A38"}
                      strokeWidth={lit ? 2 : 1.25}
                      vectorEffect="non-scaling-stroke"
                      className="transition-[stroke] duration-300"
                    />
                  );
                })}
              </svg>

              {/* Node layer */}
              {nodes.map((node) => {
                const Icon = STATE_META[node.state].icon;
                return (
                  <button
                    key={node.id}
                    onClick={() => setActiveId(node.id)}
                    aria-pressed={node.id === activeId}
                    className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 text-center"
                    style={{ left: `${node.pos.x}%`, top: `${node.pos.y}%` }}
                  >
                    <span
                      data-active={node.id === activeId ? "" : undefined}
                      className={`ct-skill ct-skill--${node.state} flex h-14 w-14 items-center justify-center rounded-full`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="whitespace-nowrap font-heading text-sm tracking-wide text-white">{node.name}</span>
                    <span className="whitespace-nowrap text-[9px] font-bold uppercase tracking-widest text-[#5C6B7C]">{node.tier}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Personal progress widget */}
          <div className="mt-4 flex flex-col items-center gap-4 border border-[#1E2A38] bg-[#131B25] px-5 py-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="ct-ring relative grid h-14 w-14 place-items-center" style={{ "--p": `${progress}%` }}>
                <span className="font-heading text-sm text-white">{progress}%</span>
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#9AA7B6]">Your Progress</p>
                <p className="text-sm text-white">
                  <span className="text-[#2E8DFF]">{counts.mastered || 0} mastered</span>
                  {" · "}{counts["in-progress"] || 0} in progress{" · "}{counts.locked || 0} locked
                </p>
              </div>
            </div>
            <button onClick={onBookTrial} className="btn-secondary shrink-0 text-xs">
              <Compass className="h-4 w-4" /> Not sure where to start? Take Assessment
            </button>
          </div>
        </div>

        {/* ── Detail rail ────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="ct-card p-5"
            >
              <div className="group relative mb-4 overflow-hidden rounded-sm">
                <MediaSlot media={{ label: `${active.name} demo`, hint: "", ratio: "16/9" }} img={active.img} align="items-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur transition-transform group-hover:scale-110">
                    <Play className="h-5 w-5 fill-white text-white" />
                  </span>
                </MediaSlot>
              </div>

              <div className="flex items-center justify-between gap-3">
                <h3 className="font-heading text-3xl tracking-wide text-white">{active.name}</h3>
                <span className={`ct-skill-badge ct-skill-badge--${active.state} inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest`}>
                  <StateIcon className="h-3 w-3" /> {STATE_META[active.state].label}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#9AA7B6]">{active.desc}</p>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <Meta icon={Clock} label="Avg. Timeline" value={active.time} />
                <Meta icon={Gauge} label="Difficulty" value={active.difficulty} />
              </div>

              <div className="mt-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#9AA7B6]">Requirements</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {active.prereq.length === 0 ? (
                    <span className="border border-[#2E8DFF]/30 bg-[#2E8DFF]/10 px-2.5 py-1 text-xs text-[#2E8DFF]">No prerequisites — start here</span>
                  ) : (
                    active.prereq.map((p) => (
                      <button
                        key={p}
                        onClick={() => setActiveId(p)}
                        className={`border px-2.5 py-1 text-xs transition-colors ${byId[p].state === "mastered" ? "border-[#2E8DFF]/40 bg-[#2E8DFF]/10 text-[#2E8DFF]" : "border-[#1E2A38] bg-[#0B1016] text-white hover:border-[#2E8DFF]/50"}`}
                      >
                        {byId[p].state === "mastered" && <Check className="-ml-0.5 mr-1 inline h-3 w-3" />}{nameOf(p)}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Coach insight */}
              <div className="mt-5 flex gap-2 border-l-2 border-[#2E8DFF] bg-[#0B1016] px-4 py-3">
                <Quote className="h-4 w-4 shrink-0 text-[#2E8DFF]" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#9AA7B6]">Coach Insight</p>
                  <p className="mt-0.5 text-sm italic text-[#C6D2DF]">{active.insight}</p>
                </div>
              </div>

              {/* What it unlocks */}
              {unlocks.length > 0 && (
                <div className="mt-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#9AA7B6]">Unlocks</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {unlocks.map((u) => (
                      <button key={u.id} onClick={() => setActiveId(u.id)} className="inline-flex items-center gap-1 border border-[#1E2A38] bg-[#0B1016] px-2.5 py-1 text-xs text-white transition-colors hover:border-[#2E8DFF]/50">
                        {u.name} <ArrowRight className="h-3 w-3 text-[#2E8DFF]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={onBookTrial} className="btn-primary mt-6 w-full justify-center text-xs">
                {STATE_META[active.state].cta} <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
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
          <span className="ct-live-dot relative flex h-2 w-2 rounded-full bg-[#2E8DFF]" /> Live feed · scroll →
        </span>
      </div>

      {/* Horizontal achievement stream */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={vpOnce}
        variants={stagger}
        className="ct-feed -mx-6 flex snap-x gap-4 overflow-x-auto px-6 pb-3"
      >
        {HALL_OF_FIRSTS.items.map((item) => (
          <motion.div key={item.id} variants={reveal} className="group w-[200px] shrink-0 snap-start overflow-hidden rounded-sm border border-[#1E2A38]">
            <MediaSlot media={{ ...item.media, ratio: "4/5" }} align="" scrim="ct-media__scrim--full">
              <div className="flex items-start justify-between">
                <span className="inline-flex items-center gap-1 bg-[#2E8DFF] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                  <Trophy className="h-2.5 w-2.5" /> {item.milestone}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                  <Heart className="h-2.5 w-2.5 fill-[#2E8DFF] text-[#2E8DFF]" /> {item.reactions}
                </span>
              </div>
              <div className="mt-auto">
                <h3 className="font-heading text-lg leading-none tracking-wide text-white">{item.name}</h3>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-[#C6D2DF]/80">{item.date}</p>
              </div>
            </MediaSlot>
          </motion.div>
        ))}

        {/* "You're next" ghost card */}
        <motion.button
          variants={reveal}
          onClick={onBookTrial}
          className="group flex w-[200px] shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-[#2E8DFF]/50 bg-[#0E141C] p-5 text-center transition-colors hover:border-[#2E8DFF] hover:bg-[#131B25]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2E8DFF]/50 text-[#2E8DFF] transition-transform group-hover:scale-110">
            <Plus className="h-6 w-6" />
          </span>
          <span className="font-heading text-lg leading-tight tracking-wide text-white">Your milestone<br />starts here</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-[#2E8DFF]">
            Book Trial <ArrowRight className="h-3 w-3" />
          </span>
        </motion.button>
      </motion.div>

      {/* Community — folded in: the feed is where the culture lives */}
      <div className="mt-12 border-t border-[#1E2A38] pt-10">
        <div className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-heading text-2xl tracking-wide text-white">{COMMUNITY.title[0]} <span className="accent">{COMMUNITY.title[1]}</span></h3>
          <p className="text-sm text-[#9AA7B6]">{COMMUNITY.sub}</p>
        </div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={vpOnce}
          variants={stagger}
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          {COMMUNITY.items.map((c) => {
            const Icon = c.icon;
            return (
              <motion.div key={c.name} variants={reveal} className="group overflow-hidden rounded-sm border border-[#1E2A38]">
                <MediaSlot media={{ ...c.media, ratio: "4/3" }} align="" scrim="ct-media__scrim--full">
                  <div className="flex">
                    <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#2E8DFF]/40 bg-[#0B1016]/70 text-[#2E8DFF] backdrop-blur">
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-auto">
                    <h4 className="font-heading text-lg tracking-wide text-white">{c.name}</h4>
                    <p className="mt-1 text-[10px] leading-snug text-[#C6D2DF]">{c.desc}</p>
                  </div>
                </MediaSlot>
              </motion.div>
            );
          })}
        </motion.div>
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

