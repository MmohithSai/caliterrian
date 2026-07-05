// SECTION · A Journey That Builds You — cinematic, card-less progression.
//
// One connected experience: a glowing horizontal rail (blue → gold) threads six
// stages. Each stage = a huge ghost number, an athlete silhouette that grows
// more impressive, a node on the rail, then a minimal label. Mastery is the
// only gold stage and gets a soft pulse + light rays. GSAP ScrollTrigger drives
// the reveal (heading → rail draw → nodes → athletes → labels → stats).
//
// Desktop uses a 3-band stacked layout (athletes / rail / labels) so the single
// rail stays perfectly aligned under every silhouette. Small screens fall back
// to a vertical timeline. Everything degrades to fully-visible static content
// under prefers-reduced-motion.
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { JOURNEY } from "@/data/home";
import AthleteSilhouette from "./AthleteSilhouette";

gsap.registerPlugin(ScrollTrigger);

const stages = JOURNEY.stages;
const COLS = stages.length;
// Column centres for the absolutely-positioned rail nodes (6 → 8.33% … 91.67%).
const colCenter = (i) => `${((i + 0.5) / COLS) * 100}%`;

function Node({ gold }) {
  return (
    <span className={`journey-node ${gold ? "journey-node--gold" : ""}`} aria-hidden="true">
      <span className="journey-node__glow" />
      <span className="journey-node__ring" />
      <span className="journey-node__dot" />
    </span>
  );
}

// Stacked silhouette + ghost number (used in both desktop band and mobile row).
function Athlete({ stage }) {
  return (
    <div className="journey-figwrap" data-jathlete>
      {stage.gold && <span className="journey-rays" aria-hidden="true" />}
      <span
        className={`journey-num ${stage.gold ? "journey-num--gold" : ""}`}
        data-jnum
        aria-hidden="true"
      >
        {stage.n}
      </span>
      <AthleteSilhouette
        pose={stage.pose}
        tone={stage.gold ? "gold" : "blue"}
        title={`${stage.title} — ${stage.pose} silhouette`}
        className={`journey-figure ${stage.gold ? "journey-figure--gold" : ""}`}
      />
    </div>
  );
}

function Label({ stage }) {
  const Icon = stage.icon;
  return (
    <div className="journey-label" data-jlabel>
      <Icon className={`journey-label__icon ${stage.gold ? "journey-label__icon--gold" : ""}`} aria-hidden="true" />
      <h3 className={`journey-label__title ${stage.gold ? "journey-label__title--gold" : ""}`}>{stage.title}</h3>
      <p className="journey-label__desc">{stage.desc}</p>
    </div>
  );
}

export function JourneySection() {
  const root = useRef(null);
  const linePath = useRef(null);

  useLayoutEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // static, fully-visible fallback

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top 72%", once: true },
        defaults: { ease: "power3.out" },
      });

      tl.from("[data-jhead]", { y: 30, opacity: 0, duration: 0.7, stagger: 0.08 });

      if (linePath.current) {
        tl.fromTo(
          linePath.current,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" },
          "-=0.15",
        );
      }
      tl.from("[data-jline-v]", { scaleY: 0, transformOrigin: "top center", duration: 1.0, ease: "power2.inOut" }, "<");

      tl.from("[data-jathlete]", { opacity: 0, scale: 0.86, y: 16, duration: 0.6, stagger: 0.12 }, "<0.1")
        .from("[data-jnum]", { opacity: 0, y: 22, duration: 0.6, stagger: 0.12 }, "<")
        .from("[data-jnode]", { scale: 0, opacity: 0, duration: 0.42, ease: "back.out(2)", stagger: 0.12 }, "<0.05")
        .from("[data-jlabel]", { opacity: 0, y: 16, duration: 0.5, stagger: 0.1 }, "-=0.3")
        .from("[data-jstat]", { opacity: 0, y: 20, duration: 0.5, stagger: 0.08 }, "-=0.15");
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section id="path" ref={root} className="journey-section relative isolate overflow-hidden px-6 py-24 sm:py-28">
      {/* Background texture layers — kept very subtle */}
      <span className="journey-bg-grid" aria-hidden="true" />
      <span className="journey-bg-glow" aria-hidden="true" />
      <span className="hero-grain pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl">
        {/* ── Hero copy ── */}
        <header className="mx-auto max-w-2xl text-center">
          <p className="journey-eyebrow" data-jhead>{JOURNEY.label}</p>
          <h2 className="ct-display journey-heading mt-4" data-jhead>
            <span className="block">{JOURNEY.heading[0]}</span>
            <span className="block accent">{JOURNEY.heading[1]}</span>
          </h2>
          <p className="ct-sub journey-para mx-auto mt-5" data-jhead>{JOURNEY.paragraph}</p>
        </header>

        {/* ── Desktop: stacked bands (athletes / rail / labels) ── */}
        <div className="mt-16 hidden lg:block">
          {/* Athletes band */}
          <div className="grid grid-cols-6 items-end">
            {stages.map((s) => (
              <Athlete key={s.n} stage={s} />
            ))}
          </div>

          {/* Rail band — single continuous line + absolutely-placed nodes */}
          <div className="journey-rail relative">
            <svg className="journey-line" viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="journeyLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#2F80FF" stopOpacity="0" />
                  <stop offset="0.06" stopColor="#2F80FF" />
                  <stop offset="0.78" stopColor="#2F80FF" />
                  <stop offset="0.9" stopColor="#F2B84B" />
                  <stop offset="1" stopColor="#F2B84B" stopOpacity="0.25" />
                </linearGradient>
                <filter id="journeyLineGlow" x="-5%" y="-200%" width="110%" height="500%">
                  <feGaussianBlur stdDeviation="3" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                ref={linePath}
                d="M0,30 C 200,21 360,38 540,29 S 860,33 1000,30"
                fill="none"
                stroke="url(#journeyLineGrad)"
                strokeWidth="2"
                pathLength="1"
                strokeDasharray="1"
                vectorEffect="non-scaling-stroke"
                filter="url(#journeyLineGlow)"
              />
              {/* end arrow */}
              <path d="M988,25 L1000,30 L988,35" fill="none" stroke="#F2B84B" strokeWidth="2" strokeOpacity="0.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            {stages.map((s, i) => (
              <span key={s.n} className="journey-node-wrap" style={{ left: colCenter(i) }} data-jnode>
                <Node gold={s.gold} />
                {/* short stem dropping from the node to the icon below */}
                <span className={`journey-stem ${s.gold ? "journey-stem--gold" : ""}`} aria-hidden="true" />
              </span>
            ))}
          </div>

          {/* Labels band */}
          <div className="mt-8 grid grid-cols-6 items-start">
            {stages.map((s) => (
              <Label key={s.n} stage={s} />
            ))}
          </div>
        </div>

        {/* ── Mobile/tablet: vertical timeline ── */}
        <div className="mt-12 lg:hidden">
          <div className="journey-vrail relative pl-16">
            <span className="journey-vline" data-jline-v aria-hidden="true" />
            <ol className="flex flex-col gap-12">
              {stages.map((s) => (
                <li key={s.n} className="relative">
                  <span className="journey-vnode-wrap" data-jnode>
                    <Node gold={s.gold} />
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="journey-vfig relative shrink-0">
                      <span className={`journey-num journey-num--sm ${s.gold ? "journey-num--gold" : ""}`} aria-hidden="true">{s.n}</span>
                      <AthleteSilhouette
                        pose={s.pose}
                        tone={s.gold ? "gold" : "blue"}
                        title={`${s.title} — ${s.pose} silhouette`}
                        className={`journey-figure ${s.gold ? "journey-figure--gold" : ""}`}
                      />
                    </div>
                    <Label stage={s} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ── Premium stats / promise strip ── */}
        <div className="journey-stats mt-16 sm:mt-20">
          {JOURNEY.pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="journey-stat" data-jstat>
                <Icon className="journey-stat__icon" aria-hidden="true" />
                <div>
                  <div className="journey-stat__title">{p.title}</div>
                  <p className="journey-stat__desc">{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default JourneySection;
