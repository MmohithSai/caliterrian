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
