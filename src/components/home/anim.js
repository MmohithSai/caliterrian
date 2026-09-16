// Shared framer-motion presets for the homepage sections. Kept in a plain
// .js module (not the .jsx component file) so react-refresh stays happy.
export const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
export const vpOnce = { once: true, margin: "-80px" };

// ── Principle-based presets (Path rail + Skill Tree) ──────────────────────
// Plain opacity fade — reduced-motion fallback for the spring/draw variants.
export const fade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

// "Drawing" connector lines: scale from 0 along their axis (set transformOrigin
// to the start of the line). Straight-ahead principle — the path threads itself.
export const drawX = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: { scaleX: 1, opacity: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};
export const drawY = {
  hidden: { scaleY: 0, opacity: 0 },
  visible: { scaleY: 1, opacity: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

// Stage/skill nodes punch in with a spring overshoot (anticipation +
// exaggeration) so each milestone lands with weight.
export const nodePop = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 320, damping: 15 } },
};

// Per-column container: node pops first, its copy rises just after.
export const columnStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
