import { useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import SEO from "@/components/SEO";
import { GALLERY } from "@/data/mockData";

const CATEGORIES = ["All", "skills", "training", "kids", "group", "workshop", "transformation", "facility"];

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".scroll-fade");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in-view"); });
    }, { threshold: 0.05 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  });
}

export default function Gallery() {
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState(null);
  useScrollReveal();
  const filtered = filter === "All" ? GALLERY : GALLERY.filter((i) => i.category === filter);

  return (
    <div className="pt-24 min-h-screen bg-obsidian">
      <SEO title="Photo Gallery" description="Inside Cali Terrain calisthenics gym in Secunderabad." />
      <div className="bg-[#0D0D0D] border-b border-white/5 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="section-tag mb-2">Visual Stories</p>
          <h1 className="font-heading text-6xl md:text-8xl text-white leading-none mb-4">GALLERY</h1>
          <p className="text-zinc-400 text-base max-w-2xl">Training sessions, skills, kids batches and community moments from Cali Terrain.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-10 pb-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)} className={`text-xs font-bold uppercase tracking-widest px-4 py-2 border transition-colors duration-200 ${filter === cat ? "bg-[#2EC4B6] border-[#2EC4B6] text-white" : "bg-transparent border-white/20 text-zinc-400 hover:border-white hover:text-white"}`}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <ImageIcon className="w-12 h-12 text-zinc-600" />
            <p className="text-zinc-500 text-sm">No images found for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((img, i) => (
              <div key={img.id} className="aspect-square overflow-hidden bg-[#121212] cursor-pointer group relative scroll-fade" style={{ transitionDelay: `${(i % 4) * 0.05}s` }} onClick={() => setLightbox(img)}>
                <img src={img.url} alt={img.caption || "Gallery"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={(e) => { e.target.style.display = "none"; e.target.parentElement.style.background = "#1A1A1A"; }} />
                {img.caption && (
                  <div className="absolute inset-0 bg-obsidian/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <p className="text-white text-xs font-medium">{img.caption}</p>
                  </div>
                )}
                <span className="absolute top-2 right-2 bg-[#2EC4B6] text-white text-xs font-bold uppercase tracking-wider px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{img.category}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-obsidian/95 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.caption} className="w-full max-h-[80vh] object-contain" />
            {lightbox.caption && <p className="text-zinc-400 text-sm text-center mt-4">{lightbox.caption}</p>}
            <button onClick={() => setLightbox(null)} className="mt-4 mx-auto block text-zinc-400 hover:text-white text-xs uppercase tracking-widest font-bold transition-colors duration-200">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
