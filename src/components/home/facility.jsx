// Section 10: Facility Experience — interactive hotspot panorama
// (Community → folded into Hall of Firsts; Why Members Stay → folded into Results.)
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Header, MediaSlot, Section } from "./ui";
import { reveal, vpOnce } from "./anim";
import { FACILITY } from "@/data/home";


// Pin placement matched to /facility/panorama.jpg (IMG_4006 wide shot):
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
        <MediaSlot media={FACILITY.panorama} img={FACILITY.panorama.img} parallax scrim="ct-media__scrim--pano">
          {zones.slice(0, PIN_POS.length).map((zone, i) => (
            <button
              key={zone.name}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              data-active={active === i ? "" : undefined}
              className="ct-pin absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={PIN_POS[i]}
              aria-label={zone.name}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border bg-[#0B1016]/80 backdrop-blur transition-transform">
                <Plus className="h-4 w-4" />
              </span>
            </button>
          ))}
          <span className="pointer-events-none absolute bottom-3 left-3 z-10 text-[10px] uppercase tracking-widest text-white/60">
            <span className="sm:hidden">Tap a zone to explore</span>
            <span className="hidden sm:inline">Hover a zone to explore</span>
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

      {/* Hotspot detail card (mobile — shown in-flow below the panorama since taps have no hover overlay to rely on) */}
      <div className="mt-3 border border-[#2E8DFF]/40 bg-[#0B1016]/90 p-3 sm:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-sm border border-[#2E8DFF]/40 text-[#2E8DFF]">
            <ActiveIcon className="h-3.5 w-3.5" />
          </span>
          <h3 className="font-heading text-base tracking-wide text-white">{activeZone.name}</h3>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-[#9AA7B6]">{activeZone.desc}</p>
      </div>
    </Section>
  );
}
