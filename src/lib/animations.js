import { useScroll, useTransform, useReducedMotion } from "framer-motion";

const APPLE_EASE = [0.16, 1, 0.3, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

export const staggerContainerSlow = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.16, delayChildren: 0.05 },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: APPLE_EASE },
  },
};

export const blurReveal = {
  hidden: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -48 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: APPLE_EASE },
  },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 48 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: APPLE_EASE },
  },
};

export const imageReveal = {
  hidden: { opacity: 0, scale: 1.1 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.9, ease: APPLE_EASE },
  },
};

export const viewportOnce = { once: true, amount: 0.18 };

export function useSectionScroll(
  ref,
  { parallaxRange = 30, fade = true, scaleEnter = true } = {}
) {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [parallaxRange, -parallaxRange]
  );

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.3],
    !fade || reduceMotion ? [1, 1] : [0, 1]
  );

  const scale = useTransform(
    scrollYProgress,
    [0, 0.5],
    !scaleEnter || reduceMotion ? [1, 1] : [0.98, 1]
  );

  return { y, opacity, scale };
}
