import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import PageBackdrop from "@/components/PageBackdrop";
import { BLOG_POSTS } from "@/data/mockData";
import { useScrollReveal } from "@/lib/useScrollReveal";

const CATEGORIES = ["All", "Education", "Training Tips", "Kids Fitness", "Mobility", "Skill Progressions"];

export default function Blog() {
  const [filter, setFilter] = useState("All");
  useScrollReveal();
  const filtered = filter === "All" ? BLOG_POSTS : BLOG_POSTS.filter((p) => p.category === filter);

  return (
    <div className="relative isolate pt-24 min-h-screen bg-obsidian">
      <SEO title="Fitness Blog" description="Calisthenics guides, training tips and fitness education from Cali Terrain." path="/blog" />
      <PageBackdrop />
      <PageHero
        eyebrow="Knowledge Hub"
        lines={["FITNESS", "BLOG"]}
        ghost="READ"
        sub="Calisthenics guides, training tips and fitness education from the Cali Terrain team."
      />

      <div className="max-w-7xl mx-auto px-6 pt-10 pb-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)} className={`text-xs font-bold uppercase tracking-widest px-4 py-2 border transition-colors duration-200 ${filter === cat ? "bg-[#8DB6D7] border-[#8DB6D7] text-[#041C38] shadow-[0_0_18px_rgba(141,182,215,0.35)]" : "bg-transparent border-white/20 text-[#92ABC4] hover:border-[#8DB6D7]/60 hover:text-white"}`}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {filtered.length === 0 ? (
          <p className="text-[#86A2BC] text-center py-20">No posts found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
              <Link key={post.id} to={`/blog/${post.slug || post.id}`} className="group bg-[#0A1D31] border border-white/5 hover:border-[#8DB6D7]/40 overflow-hidden scroll-fade card-glow" style={{ transitionDelay: `${(i % 3) * 0.1}s` }}>
                <div className="aspect-[16/9] overflow-hidden bg-[#0E2740]">
                  {post.cover_image ? (
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (
                    <div className="w-full h-full bg-[#0E2740] flex items-center justify-center">
                      <span className="font-heading text-4xl text-white/10">{post.category?.[0]}</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#8DB6D7]">{post.category}</span>
                    <div className="flex items-center gap-1 text-[#5A7896] text-xs">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <h2 className="font-heading text-xl text-white tracking-wide mb-2 group-hover:text-[#8DB6D7] transition-colors duration-200">{post.title}</h2>
                  <p className="text-[#86A2BC] text-sm leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                  <span className="text-[#8DB6D7] text-xs font-bold uppercase tracking-widest flex items-center gap-1">Read More <ArrowRight className="w-3 h-3" /></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
