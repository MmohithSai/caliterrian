import { motion, useReducedMotion } from "framer-motion";
import Particles from "@/components/reactbits/Particles";

const EASE = [0.22, 1, 0.36, 1];

/**
 * Shared cinematic header band for inner pages.
 * Matches the homepage system: deep #03070D band, blueprint grid, blue
 * atmosphere, ct-eyebrow kicker, giant two-tone Bebas display whose lines
 * rise out of clip masks, and a ghost outline word anchored to the edge.
 *
 * lines: array of strings; pass { text, accent: true } (or a plain string)
 * per line. The last line is accented by default when strings are passed.
 *
 * backdrop: optional decorative layer (already positioned by the caller)
 * rendered between the atmosphere and the ghost word — e.g. the 3D particle
 * silhouette on /transformations.
 */
export default function PageHero({ eyebrow, lines, sub, ghost, backdrop, children }) {
  const reduce = useReducedMotion();

  const rise = (delay) =>
    reduce
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : {
          initial: { y: "112%" },
          animate: { y: "0%" },
          transition: { duration: 0.9, delay, ease: EASE },
        };

  const fade = (delay) =>
    reduce
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  const normalized = lines.map((line, i) =>
    typeof line === "string" ? { text: line, accent: i === lines.length - 1 && lines.length > 1 } : line
  );

  return (
    <header className="page-hero py-20 sm:py-24 px-6">
      <div className="page-hero__grid" aria-hidden="true" />
      <div className="page-hero__glow" aria-hidden="true" />
      {/* React Bits Particles: slow-drifting blue specks for atmospheric depth */}
      <div className="page-hero__particles" aria-hidden="true">
        <Particles
          particleCount={140}
          particleSpread={11}
          speed={0.06}
          particleBaseSize={70}
          alphaParticles
          disableRotation
          cameraDistance={22}
          moveParticlesOnHover
          particleHoverFactor={0.7}
        />
      </div>
      {backdrop}
      {ghost && (
        <motion.span className="page-hero__ghost" aria-hidden="true" {...fade(0.35)}>
          {ghost}
        </motion.span>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.p className="section-tag mb-4" {...fade(0)}>
          {eyebrow}
        </motion.p>

        <h1 className="page-hero__title mb-5">
          {normalized.map((line, i) => (
            <span key={i} className="page-hero__clip">
              <motion.span className={`block ${line.accent ? "accent" : ""}`} {...rise(0.08 + i * 0.09)}>
                {line.text}
              </motion.span>
            </span>
          ))}
        </h1>

        {sub && (
          <motion.p className="page-hero__sub" {...fade(0.32)}>
            {sub}
          </motion.p>
        )}

        {children && (
          <motion.div className="mt-8" {...fade(0.42)}>
            {children}
          </motion.div>
        )}
      </div>
    </header>
  );
}
