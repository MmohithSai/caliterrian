// Hand-drawn athlete silhouettes for the "A Journey That Builds You" timeline.
// Each pose is a single-color figure built from round-capped strokes + a head,
// so it reads as a clean silhouette at any size. A vertical gradient gives the
// figures a lit-from-above feel; a CSS drop-shadow (set by the parent via
// .journey-figure / --gold) adds the blue/gold rim glow seen in the comp.
//
// Poses tell the progression story: standing → push-up → pull-up → handstand →
// ring support → front lever (gradually more impressive).
import { useId } from "react";

// ── Poses (viewBox 0 0 200 230) ───────────────────────────────────────────
// Group sets stroke = gradient, fill = none; each <circle> head overrides
// fill = gradient / stroke = none.
function Standing({ fill }) {
  return (
    <>
      <line x1="100" y1="72" x2="100" y2="150" strokeWidth="28" />
      <line x1="89" y1="86" x2="82" y2="146" strokeWidth="15" />
      <line x1="111" y1="86" x2="118" y2="146" strokeWidth="15" />
      <line x1="94" y1="150" x2="89" y2="214" strokeWidth="17" />
      <line x1="106" y1="150" x2="111" y2="214" strokeWidth="17" />
      <circle cx="100" cy="52" r="17" fill={fill} stroke="none" />
    </>
  );
}

function Pushup({ fill }) {
  return (
    <>
      {/* torso, slightly inclined plank */}
      <line x1="74" y1="150" x2="138" y2="162" strokeWidth="26" />
      {/* legs to feet */}
      <line x1="138" y1="162" x2="188" y2="172" strokeWidth="17" />
      {/* arms straight to the floor */}
      <line x1="72" y1="150" x2="71" y2="200" strokeWidth="14" />
      <line x1="82" y1="150" x2="81" y2="200" strokeWidth="14" />
      <circle cx="58" cy="150" r="15" fill={fill} stroke="none" />
    </>
  );
}

function Pullup({ fill }) {
  return (
    <>
      {/* bar */}
      <line x1="52" y1="34" x2="148" y2="34" strokeWidth="6" />
      {/* arms up to the bar */}
      <line x1="82" y1="36" x2="93" y2="94" strokeWidth="14" />
      <line x1="118" y1="36" x2="107" y2="94" strokeWidth="14" />
      {/* torso + legs */}
      <line x1="100" y1="96" x2="100" y2="156" strokeWidth="28" />
      <line x1="94" y1="156" x2="91" y2="214" strokeWidth="16" />
      <line x1="106" y1="156" x2="109" y2="214" strokeWidth="16" />
      <circle cx="100" cy="76" r="15" fill={fill} stroke="none" />
    </>
  );
}

function Handstand({ fill }) {
  return (
    <>
      {/* hands on floor */}
      <line x1="86" y1="212" x2="95" y2="150" strokeWidth="14" />
      <line x1="114" y1="212" x2="105" y2="150" strokeWidth="14" />
      {/* torso (inverted) */}
      <line x1="100" y1="150" x2="100" y2="86" strokeWidth="28" />
      {/* legs reaching up */}
      <line x1="94" y1="86" x2="89" y2="22" strokeWidth="16" />
      <line x1="106" y1="86" x2="111" y2="22" strokeWidth="16" />
      <circle cx="100" cy="170" r="15" fill={fill} stroke="none" />
    </>
  );
}

function RingDip({ fill }) {
  return (
    <>
      {/* ring straps */}
      <line x1="78" y1="18" x2="78" y2="90" strokeWidth="4" />
      <line x1="122" y1="18" x2="122" y2="90" strokeWidth="4" />
      <circle cx="78" cy="96" r="7" fill="none" strokeWidth="4" />
      <circle cx="122" cy="96" r="7" fill="none" strokeWidth="4" />
      {/* arms bent on the rings */}
      <line x1="80" y1="100" x2="90" y2="112" strokeWidth="13" />
      <line x1="90" y1="112" x2="100" y2="104" strokeWidth="14" />
      <line x1="120" y1="100" x2="110" y2="112" strokeWidth="13" />
      <line x1="110" y1="112" x2="100" y2="104" strokeWidth="14" />
      {/* torso + tucked legs */}
      <line x1="100" y1="104" x2="100" y2="156" strokeWidth="26" />
      <line x1="100" y1="156" x2="92" y2="196" strokeWidth="15" />
      <line x1="100" y1="156" x2="110" y2="194" strokeWidth="15" />
      <circle cx="100" cy="88" r="15" fill={fill} stroke="none" />
    </>
  );
}

function FrontLever({ fill }) {
  return (
    <>
      {/* bar at the right */}
      <line x1="172" y1="44" x2="172" y2="150" strokeWidth="6" />
      {/* straight arms to the bar */}
      <line x1="168" y1="98" x2="124" y2="95" strokeWidth="14" />
      {/* horizontal torso */}
      <line x1="124" y1="95" x2="72" y2="99" strokeWidth="26" />
      {/* extended legs (slight split) */}
      <line x1="72" y1="99" x2="26" y2="94" strokeWidth="16" />
      <line x1="72" y1="99" x2="26" y2="104" strokeWidth="16" />
      <circle cx="111" cy="86" r="14" fill={fill} stroke="none" />
    </>
  );
}

const POSES = {
  standing: Standing,
  pushup: Pushup,
  pullup: Pullup,
  handstand: Handstand,
  ringdip: RingDip,
  frontlever: FrontLever,
};

export default function AthleteSilhouette({ pose, tone = "blue", className = "", title }) {
  const uid = useId().replace(/:/g, "");
  const gradId = `fig-${uid}`;
  const fill = `url(#${gradId})`;
  const Pose = POSES[pose] || Standing;
  const top = tone === "gold" ? "#5a4a22" : "#27313f";
  const bottom = tone === "gold" ? "#0a0805" : "#05080d";

  return (
    <svg
      viewBox="0 0 200 230"
      className={className}
      role="img"
      aria-label={title}
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.55" stopColor={bottom} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <g
        stroke={fill}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      >
        <Pose fill={fill} />
      </g>
    </svg>
  );
}
