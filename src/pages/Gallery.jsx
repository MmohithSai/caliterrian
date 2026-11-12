import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import PageBackdrop from "@/components/PageBackdrop";
import { useScrollReveal } from "@/lib/useScrollReveal";

const CATEGORIES = ["All", "facility", "members", "skills", "training", "group", "workshop"];

// Facility stills are frames from our own walkthrough footage (gym assets/);
// member shots are the real Hall of Fame clips' posters.
const GALLERY = [
  { id: 1,  url: "/gallery/rig-and-mats.webp",     caption: "Main Rig & Crash Mats",           category: "facility" },
  { id: 2,  url: "/hall-of-fame/umang-back-lever.webp", caption: "Umang: Back Lever Unlocked", category: "members" },
  { id: 3,  url: "/gallery/strength-floor.webp",   caption: "Strength Floor & Rings",          category: "facility" },
  { id: 4,  url: "/hall-of-fame/probin-muscle-up.webp", caption: "Probin: Muscle-Up Unlocked",  category: "members" },
  { id: 5,  url: "/gallery/turf-lane.webp",        caption: "Turf Lane: Sled & Rope Work",     category: "facility" },
  { id: 6,  url: "/gallery/overhead-floor.webp",   caption: "Bars, Turf & Mats From Above",    category: "facility" },
  { id: 7,  url: "/stories/prerana-weightloss.webp", caption: "Prerana: 10 kg Down",           category: "members" },
  { id: 8,  url: "/gallery/plates-and-rig.webp",   caption: "Rings, Plates & Air Bikes",       category: "facility" },
  { id: 9,  url: "/gallery/bar-zone.webp",         caption: "Bar Zone & Wall Ladder",          category: "facility" },
  { id: 10, url: "/stories/umang-pullups.webp",    caption: "Umang: 4 to 15+ Pull-Ups",        category: "members" },
  { id: 11, url: "/gallery/racks-by-windows.webp", caption: "Power Racks by the Windows",      category: "facility" },
  { id: 12, url: "/gallery/rig-and-fan.webp",      caption: "Pull-Up Rig & Boxes",             category: "facility" },
  { id: 13, url: "/stories/advika-skating.webp",   caption: "Advika: National Medalist",       category: "members" },
  { id: 14, url: "/disciplines/calisthenics.webp", caption: "Calisthenics Training Session",   category: "training" },
  { id: 15, url: "/community/events.webp",         caption: "Group Community Workout",         category: "group" },
  { id: 16, url: "/skills/handstand-demo-poster.webp", caption: "Handstand Practice & Alignment", category: "skills" },
  { id: 17, url: "/disciplines/strength.webp",     caption: "Heavy Strength Training",         category: "training" },
  { id: 18, url: "/journey/foundation.webp",       caption: "Beginner Movement Session",       category: "training" },
  { id: 19, url: "/disciplines/mobility.webp",     caption: "Joint Mobility & Active Recovery", category: "training" },
  { id: 20, url: "/disciplines/functional.webp",   caption: "Functional Fitness Circuit",      category: "group" },
  { id: 21, url: "/coaches/vidya-sagar.webp",      caption: "1-on-1 Personal Coaching",        category: "training" },
  { id: 22, url: "/facility/panorama.webp",        caption: "Facility Panorama & Rig",         category: "facility" },
  { id: 23, url: "/community/workshops.webp",      caption: "Pull-Up Clinic & Workshop Day",   category: "workshop" },
  { id: 24, url: "/disciplines/freestyle.webp",    caption: "Freestyle Bar Flow",              category: "skills" },
  { id: 25, url: "/disciplines/gymnastics.webp",   caption: "Gymnastics Rings Support",        category: "skills" },
  { id: 26, url: "/disciplines/hyrox.webp",        caption: "HYROX Sled Push Conditioning",    category: "training" },
  { id: 27, url: "/community/meetups.webp",        caption: "Community Meetup & Bonding",      category: "group" },
];

export default function Gallery() {
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState(null);
  useScrollReveal({ threshold: 0.05 });
  const filtered = filter === "All" ? GALLERY : GALLERY.filter((i) => i.category === filter);

  return (
    <div className="relative isolate pt-24 min-h-screen bg-obsidian">
      <SEO title="Calisthenics Gym Photos in Bowenpally, Secunderabad" description="Inside Cali Terrain: the 10-zone indoor calisthenics facility in Bowenpally: rig, rings, skill arena, kids batches and coached group sessions." path="/gallery" />
      <PageBackdrop />
      <PageHero
        eyebrow="Visual Stories"
        lines={[{ text: "GALLERY", accent: false }]}
        ghost="CT"
        sub="Training sessions, skills, kids batches and community moments from Cali Terrain."
      />

      <div className="max-w-7xl mx-auto px-6 pt-10 pb-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)} className={`text-xs font-bold uppercase tracking-widest px-4 py-2 border transition-colors duration-200 ${filter === cat ? "bg-[#2E8DFF] border-[#2E8DFF] text-white shadow-[0_0_18px_rgba(46,141,255,0.35)]" : "bg-transparent border-white/20 text-[#9AA7B6] hover:border-[#2E8DFF]/60 hover:text-white"}`}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="font-heading text-2xl text-white tracking-wide mb-6">
          {filter === "All" ? "Inside the Cali Terrain facility" : `${filter} photos`}
          <span className="ml-3 text-sm font-body font-normal text-[#5C6B7C]">Bowenpally, Secunderabad</span>
        </h2>
        {filtered.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <ImageIcon className="w-12 h-12 text-[#5C6B7C]" />
            <p className="text-[#8A99AB] text-sm">No images found for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((img, i) => (
              <div key={img.id} className="aspect-square overflow-hidden bg-[#131B25] cursor-pointer group relative scroll-fade" style={{ transitionDelay: `${(i % 4) * 0.05}s` }} onClick={() => setLightbox(img)}>
                <img src={img.url} alt={`${img.caption || "Cali Terrain"}: calisthenics gym in Bowenpally, Secunderabad`} loading="lazy" decoding="async" width="600" height="600" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={(e) => { e.target.style.display = "none"; e.target.parentElement.style.background = "#1A2230"; }} />
                {img.caption && (
                  <div className="absolute inset-0 bg-obsidian/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <p className="text-white text-xs font-medium">{img.caption}</p>
                  </div>
                )}
                <span className="absolute top-2 right-2 bg-[#2E8DFF] text-white text-xs font-bold uppercase tracking-wider px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{img.category}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-obsidian/95 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={lightbox.url} alt={lightbox.caption} className="w-full max-h-[80vh] object-contain" />
              {lightbox.caption && <p className="text-[#9AA7B6] text-sm text-center mt-4">{lightbox.caption}</p>}
              <button onClick={() => setLightbox(null)} className="mt-4 mx-auto block text-[#9AA7B6] hover:text-white text-xs uppercase tracking-widest font-bold transition-colors duration-200">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
