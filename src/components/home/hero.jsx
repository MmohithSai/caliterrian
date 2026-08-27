// Section 1 · Hero — full-screen 3D facility tour; the fixed navbar floats over it.
import { lazy, Suspense } from "react";

// Three.js + GSAP stay in their own chunk; the placeholder holds the fold.
const FacilityGallery3D = lazy(() => import("./FacilityGallery3D"));

export function HeroSection({ onBookTrial }) {
  return (
    <section className="relative isolate h-svh min-h-[600px] overflow-hidden bg-[#05080D]" aria-label="Cali Terrain — the facility">
      <h1 className="sr-only">Cali Terrain — Calisthenics Gym in Secunderabad, Hyderabad</h1>
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Loading experience…</span>
          </div>
        }
      >
        <FacilityGallery3D onBookTrial={onBookTrial} />
      </Suspense>
    </section>
  );
}
