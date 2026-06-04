import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { BLOG_POSTS } from "@/data/mockData";
import { useScrollReveal } from "@/lib/useScrollReveal";

const CATEGORIES = ["All", "Education", "Training Tips", "Kids Fitness", "Mobility", "Skill Progressions"];

export default function Blog() {
  const [filter, setFilter] = useState("All");
  useScrollReveal();
  const filtered = filter === "All" ? BLOG_POSTS : BLOG_POSTS.filter((p) => p.category === filter);

  return (
    <div className="pt-24 min-h-screen bg-obsidian">
      <SEO title="Fitness Blog" description="Calisthenics guides, training tips and fitness education from Cali Terrain." path="/blog" />
      <div className="bg-[#0D0D0D] border-b border-white/5 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="section-tag mb-2">Knowledge Hub</p>
          <h1 className="font-heading text-6xl md:text-8xl text-white leading-none mb-4">FITNESS<br /><span className="text-[#2EC4B6]">BLOG</span></h1>
          <p className="text-zinc-400 text-base max-w-2xl leading-relaxed">Calisthenics guides, training tips and fitness education from the Cali Terrain team.</p>
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
          <p className="text-zinc-500 text-center py-20">No posts found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
              <Link key={post.id} to={`/blog/${post.slug || post.id}`} className="group bg-[#121212] border border-white/5 hover:border-[#2EC4B6]/40 overflow-hidden scroll-fade card-glow" style={{ transitionDelay: `${(i % 3) * 0.1}s` }}>
                <div className="aspect-[16/9] overflow-hidden bg-[#1A1A1A]">
                  {post.cover_image ? (
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (
                    <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
                      <span className="font-heading text-4xl text-white/10">{post.category?.[0]}</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#2EC4B6]">{post.category}</span>
                    <div className="flex items-center gap-1 text-zinc-600 text-xs">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <h2 className="font-heading text-xl text-white tracking-wide mb-2 group-hover:text-[#2EC4B6] transition-colors duration-200">{post.title}</h2>
                  <p className="text-zinc-500 text-sm leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                  <span className="text-[#2EC4B6] text-xs font-bold uppercase tracking-widest flex items-center gap-1">Read More <ArrowRight className="w-3 h-3" /></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
