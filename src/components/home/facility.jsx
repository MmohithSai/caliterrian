// Section 10: Facility Experience — interactive hotspot panorama
// (Community → folded into Hall of Firsts; Why Members Stay → folded into Results.)
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
import { Header, MediaSlot, Section } from "./ui";
import { reveal, stagger, vpOnce } from "./anim";
import { FACILITY } from "@/data/home";

const PIN_POS = [
  { left: "16%", top: "62%" }, { left: "34%", top: "40%" }, { left: "50%", top: "70%" },
  { left: "64%", top: "38%" }, { left: "78%", top: "58%" }, { left: "88%", top: "44%" },
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
        <MediaSlot media={FACILITY.panorama} parallax scrim="ct-media__scrim--full">
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
            Hover a zone to explore
          </span>
        </MediaSlot>

        {/* Hotspot detail card (desktop overlay) */}
        <div className="pointer-events-none absolute right-3 top-3 z-20 hidden w-60 border border-[#2E8DFF]/40 bg-[#0B1016]/90 p-3 backdrop-blur sm:block">
          <div className="overflow-hidden rounded-sm">
            <MediaSlot media={{ ...activeZone.media, ratio: "16/9" }} align="" showLabel={false} />
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

      {/* Zone selector grid — clicking a tile drives the panorama detail card */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={vpOnce}
        variants={stagger}
        className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
      >
        {zones.map((zone, i) => {
          const Icon = zone.icon;
          return (
            <motion.button
              key={zone.name}
              variants={reveal}
              onMouseEnter={() => i < PIN_POS.length && setActive(i)}
              onClick={() => i < PIN_POS.length && setActive(i)}
              className={`group overflow-hidden rounded-sm border text-left transition-colors ${active === i ? "border-[#2E8DFF]" : "border-[#1E2A38] hover:border-[#2E8DFF]/50"}`}
            >
              <MediaSlot media={{ ...zone.media, ratio: "1/1" }} align="" scrim="ct-media__scrim--full">
                <div className="flex">
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#2E8DFF]/40 bg-[#0B1016]/70 text-[#2E8DFF] backdrop-blur">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-auto">
                  <h3 className="font-heading text-base leading-none tracking-wide text-white">{zone.name}</h3>
                  <p className="mt-1 text-[10px] leading-snug text-[#C6D2DF]">{zone.desc}</p>
                  <span className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[#2E8DFF]">
                    Explore <ArrowRight className="h-2.5 w-2.5" />
                  </span>
                </div>
              </MediaSlot>
            </motion.button>
          );
        })}
      </motion.div>
    </Section>
  );
}
