// Section 10: Facility Experience — interactive hotspot panorama
// (Community → folded into Hall of Firsts; Why Members Stay → folded into Results.)
import { lazy, Suspense, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Plus } from "lucide-react";
import { Header, MediaSlot, Section } from "./ui";
import { reveal, vpOnce } from "./anim";
import { FACILITY } from "@/data/home";

// Three.js + GSAP stay in their own chunk (see FacilityGallerySection below).
const FacilityGallery3D = lazy(() => import("./FacilityGallery3D"));


// Pin placement matched to /facility/panorama.webp (IMG_4006 wide shot):
// mobility mats right of the mirror, strength lab through the left doorway,
// performance lane down the turf, rig platform center, monkey bars overhead.
const PIN_POS = [
  { left: "84%", top: "62%" }, { left: "25%", top: "44%" }, { left: "32%", top: "72%" },
  { left: "62%", top: "36%" }, { left: "55%", top: "54%" }, { left: "46%", top: "26%" },
];

// ── SECTION 10 · Facility Experience ──────────────────────────────────────
export function FacilitySection() {
  const zones = FACILITY.zones;
  const [active, setActive] = useState(0);
  const activeZone = zones[active];
  const ActiveIcon = activeZone.icon;

  return (
    <Section id="facility">
      <Header eyebrow={FACILITY.eyebrow} lines={FACILITY.title} sub={FACILITY.sub} maxSub="max-w-3xl" />

      {/* Cinematic panorama with parallax + interactive zone hotspots */}
      <motion.div initial="hidden" whileInView="visible" viewport={vpOnce} variants={reveal} className="relative overflow-hidden rounded-sm border border-[#1E2A38]">
        {/* Ratio via classes: the 21:9 strip is 140px tall on a phone, so it crops to 16:10 there */}
        <MediaSlot media={{ ...FACILITY.panorama, ratio: undefined }} img={FACILITY.panorama.img} parallax scrim="ct-media__scrim--pano" className="aspect-[16/10] sm:aspect-[21/9]">
          {/* Pins are hover targets — hidden on phones, where the 3D gallery below covers every zone */}
          <div className="hidden sm:contents">
          {zones.slice(0, PIN_POS.length).map((zone, i) => (
            <button
              key={zone.name}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              data-active={active === i ? "" : undefined}
              className="ct-pin absolute z-10 -m-1.5 -translate-x-1/2 -translate-y-1/2 p-1.5"
              style={PIN_POS[i]}
              aria-label={zone.name}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border bg-[#0B1016]/80 backdrop-blur transition-transform">
                <Plus className="h-4 w-4" />
              </span>
            </button>
          ))}
          </div>
          <span className="pointer-events-none absolute bottom-3 left-3 z-10 hidden text-[10px] uppercase tracking-widest text-white/60 sm:inline">
            Hover a zone to explore
          </span>
        </MediaSlot>

        {/* Hotspot detail card (desktop overlay) */}
        <div className="pointer-events-none absolute right-3 top-3 z-20 hidden w-60 border border-[#2E8DFF]/40 bg-[#0B1016]/90 p-3 backdrop-blur sm:block">
          <div className="overflow-hidden rounded-sm">
            <MediaSlot media={{ ...activeZone.media, ratio: "16/9" }} img={activeZone.media.img} align="" showLabel={false} />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-sm border border-[#2E8DFF]/40 text-[#2E8DFF]">
              <ActiveIcon className="h-3.5 w-3.5" />
            </span>
            <h3 className="font-heading text-base tracking-wide text-white">{activeZone.name}</h3>
          </div>
          <p className="mt-2 text-[11px] leading-snug text-[#9AA7B6]">{activeZone.desc}</p>
        </div>
      </motion.div>
    </Section>
  );
}

// ── SECTION 10b · Zone Gallery ────────────────────────────────────────────
// The spherical 3D gallery that used to be the hero, now a full-height stage
// under the panorama. WebGL chunk loads once the section nears the viewport.
export function FacilityGallerySection({ onBookTrial }) {
  const ref = useRef(null);
  const near = useInView(ref, { once: true, margin: "600px 0px" });

  return (
    <section
      ref={ref}
      id="facility-gallery"
      className="relative isolate h-svh min-h-[600px] overflow-hidden bg-[#05080D]"
      aria-label="Facility zones — 3D gallery"
    >
      {near ? (
        <Suspense fallback={<GalleryPlaceholder />}>
          <FacilityGallery3D onBookTrial={onBookTrial} />
        </Suspense>
      ) : (
        <GalleryPlaceholder />
      )}
    </section>
  );
}

function GalleryPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <span className="text-[10px] uppercase tracking-[0.3em] text-white/70">Loading experience…</span>
    </div>
  );
}
