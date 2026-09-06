// Sections 4–6: Skill Tree · Hall of Firsts · Member Journeys  (image-first)
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Circle, CircleDot, Clock, Compass, Flame, Gauge, Map, Maximize2, Play, Quote, X } from "lucide-react";
import { Chip, ChipStrip, Header, MediaSlot, Section } from "./ui";
import { reveal, stagger, vpOnce, fade } from "./anim";
import { SKILLS, HALL_OF_FIRSTS } from "@/data/home";
import { FIRSTS } from "@/data/firsts";

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
  const [openVideo, setOpenVideo] = useState(null);
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

  useEffect(() => {
    setOpenVideo(null);
  }, [activeId]);

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
        {/* ── Phone / tablet: tappable skill strip. The WebGL orbit is desktop-only —
            its labels were unreadable at 375px and dragging fought the page scroll. ── */}
        <ChipStrip label="Skills" className="lg:hidden">
          {nodes.map((n) => {
            const Icon = LEVEL_META[n.difficulty].icon;
            return (
              <Chip key={n.id} active={n.id === activeId} onClick={() => setActiveId(n.id)}>
                <span className={`ct-skill ct-skill--${LEVEL_META[n.difficulty].mod} grid h-5 w-5 place-items-center rounded-full`}>
                  <Icon className="h-3 w-3" />
                </span>
                {n.name}
              </Chip>
            );
          })}
        </ChipStrip>

        {/* ── 3D constellation (desktop) — WebGL chunk deferred until the section nears.
            On phones this column holds only the blueprint note, ordered after the detail card. ── */}
        <div className="order-last min-w-0 max-w-full lg:order-none lg:col-span-3">
          <div className="hidden lg:block">
            <SkillTreeMount nodes={nodes} activeId={activeId} pathSet={pathSet} onSelect={setActiveId} />
          </div>

          {/* Blueprint note — this graph is a general roadmap, not personal tracking */}
          <div className="flex flex-col items-center gap-4 border border-[#1E2A38] bg-[#131B25] px-5 py-4 sm:flex-row sm:justify-between lg:mt-4">
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
              <Compass className="h-4 w-4" /> Get Your Full Roadmap
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
              <motion.div variants={itemV} className="mb-4">
                <SkillDemoMedia skill={active} onOpen={() => setOpenVideo(active)} />
              </motion.div>

              <motion.div variants={itemV} className="flex items-center justify-between gap-3">
                <h3 className="font-heading text-3xl tracking-wide text-white">{active.name}</h3>
                <span className={`ct-skill-badge ct-skill-badge--${LEVEL_META[active.difficulty].mod} inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest`}>
                  <LevelIcon className="h-3 w-3" /> {active.difficulty}
                </span>
              </motion.div>
              <motion.p variants={itemV} className="mt-2 text-sm leading-relaxed text-[#9AA7B6]">{active.desc}</motion.p>

              <motion.div variants={itemV} className="mt-5 grid grid-cols-1 gap-3 text-sm min-[380px]:grid-cols-2">
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

      {openVideo && <SkillVideoOverlay skill={openVideo} onClose={() => setOpenVideo(null)} />}
    </Section>
  );
}

function SkillDemoMedia({ skill, onOpen }) {
  const poster = skill.poster || skill.img;
  const media = { label: `${skill.name} demo`, hint: "", ratio: "16/9" };

  if (!skill.video) {
    return (
      <div className="group relative overflow-hidden rounded-sm">
        <MediaSlot media={media} img={poster} align="items-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur transition-transform group-hover:scale-110">
            <Play className="h-5 w-5 fill-white text-white" />
          </span>
        </MediaSlot>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${skill.name} video`}
      title={`Open ${skill.name} video`}
      className="group relative block w-full overflow-hidden rounded-sm text-left outline-none focus-visible:ring-1 focus-visible:ring-[#2E8DFF]/70"
    >
      <MediaSlot media={media} img={poster} align="items-center" imgClassName="brightness-[0.92]">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-black/45 backdrop-blur transition-transform group-hover:scale-110">
          <Play className="h-6 w-6 fill-white text-white" />
        </span>
      </MediaSlot>
    </button>
  );
}

function SkillVideoOverlay({ skill, onClose }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const video = videoRef.current;
    if (video) {
      video.defaultPlaybackRate = 1;
      video.playbackRate = 1;
      video.play?.().catch(() => {});
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const toggleFullscreen = () => {
    const target = videoRef.current;
    if (!target) return;

    if (document.fullscreenElement) {
      document.exitFullscreen?.();
      return;
    }

    target.defaultPlaybackRate = 1;
    target.playbackRate = 1;
    target.requestFullscreen?.().then(() => target.play?.().catch(() => {})).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black" role="dialog" aria-modal="true" aria-label={`${skill.name} video`}>
      <div className="relative z-10 flex h-[100dvh] w-screen bg-black">
        <video
          ref={videoRef}
          className="h-full w-full bg-black object-contain"
          src={skill.video}
          poster={skill.poster || skill.img}
          controls
          autoPlay
          loop
          playsInline
          preload="metadata"
          onLoadedMetadata={(event) => {
            event.currentTarget.defaultPlaybackRate = 1;
            event.currentTarget.playbackRate = 1;
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-gradient-to-b from-black/70 to-transparent p-3">
          <p className="font-heading text-lg tracking-wide text-white drop-shadow">{skill.name} Demo</p>
          <div className="pointer-events-auto flex items-center gap-2">
            <button type="button" onClick={toggleFullscreen} className="grid h-10 w-10 place-items-center border border-white/15 bg-black/55 text-white backdrop-blur transition-colors hover:border-[#2E8DFF]/70" aria-label="Watch full screen" title="Watch full screen">
              <Maximize2 className="h-4 w-4" />
            </button>
            <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center border border-white/15 bg-black/55 text-white backdrop-blur transition-colors hover:border-[#2E8DFF]/70" aria-label="Close video" title="Close video">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
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
      <span className="text-[10px] uppercase tracking-[0.3em] text-white/70">Loading skill tree…</span>
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
        <span className="mb-12 hidden items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#9AA7B6] sm:inline-flex">
          Drag to explore
        </span>
      </div>

      {/* Phone: swipeable milestone cards. The spherical wall needs a pointer and
          a wide viewport — on a 375px screen it was a jumble of unreadable tiles. */}
      <div className="-mx-6 sm:hidden">
        <ol className="ct-scroll-x gap-3 px-6 pb-2 scroll-pl-6">
          {FIRSTS.map((e) => (
            <li key={e.id} className="ct-card w-[72vw] max-w-[300px] overflow-hidden">
              <img src={e.img} alt={`${e.name} — ${e.milestone}`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#2E8DFF]">{e.date}</p>
                <h3 className="mt-1 font-heading text-2xl leading-none tracking-wide text-white">{e.milestone}</h3>
                <p className="mt-1 text-xs font-semibold text-[#9AA7B6]">{e.name}</p>
                <p className="mt-3 text-sm italic leading-relaxed text-[#C6D2DF]">“{e.quote}”</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Spherical milestone wall — drag to look around, click a first to open it */}
      <div className="hidden sm:block">
        <HallGalleryMount onBookTrial={onBookTrial} />
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
    <div className="flex h-[80svh] min-h-[560px] w-full items-center justify-center rounded-lg border border-[#1E2A38] bg-[#05080D] sm:h-[88svh]">
      <span className="text-[10px] uppercase tracking-[0.3em] text-white/70">Loading experience…</span>
    </div>
  );
}

