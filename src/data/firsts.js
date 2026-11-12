// Real member "firsts". Shared by the
// home Hall of Firsts grid (skills.jsx, UNLOCKS only) and the
// Hall of Fame page (pages/Transformations.jsx).
// Add a member: drop a photo in public/hall-of-fame/ and add a row here.
// `date` and `quote` are optional; `video` plays muted in the detail view.
import { RESULTS } from "./home";

export const UNLOCKS = [
  { id: "probin-muscle-up", name: "Probin", milestone: "Muscle-Up Unlocked",  img: "/hall-of-fame/probin-muscle-up.webp", video: "/hall-of-fame/probin-muscle-up.mp4", ratio: "4/5" },
  { id: "umang-back-lever", name: "Umang",  milestone: "Back Lever Unlocked", img: "/hall-of-fame/umang-back-lever.webp", video: "/hall-of-fame/umang-back-lever.mp4", ratio: "16/9" },
];

export const FIRSTS = [
  ...UNLOCKS,
  ...RESULTS.stories.map((s) => ({ id: s.id, name: s.name, milestone: s.achieved, quote: s.quote, img: s.media.img, video: s.video })),
];
