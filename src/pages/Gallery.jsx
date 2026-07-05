import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import PageBackdrop from "@/components/PageBackdrop";
import { GALLERY } from "@/data/mockData";
import { useScrollReveal } from "@/lib/useScrollReveal";

const CATEGORIES = ["All", "skills", "training", "kids", "group", "workshop", "transformation", "facility"];

export default function Gallery() {
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState(null);
  useScrollReveal({ threshold: 0.05 });
  const filtered = filter === "All" ? GALLERY : GALLERY.filter((i) => i.category === filter);

  return (
    <div className="relative isolate pt-24 min-h-screen bg-obsidian">
      <SEO title="Photo Gallery" description="Inside Cali Terrain calisthenics gym in Secunderabad." path="/gallery" />
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
        {filtered.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <ImageIcon className="w-12 h-12 text-[#5C6B7C]" />
            <p className="text-[#8A99AB] text-sm">No images found for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((img, i) => (
              <div key={img.id} className="aspect-square overflow-hidden bg-[#131B25] cursor-pointer group relative scroll-fade" style={{ transitionDelay: `${(i % 4) * 0.05}s` }} onClick={() => setLightbox(img)}>
                <img src={img.url} alt={img.caption || "Gallery"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={(e) => { e.target.style.display = "none"; e.target.parentElement.style.background = "#1A2230"; }} />
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
