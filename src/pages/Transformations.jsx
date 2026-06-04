import { useState } from "react";
import { ChevronRight, Trophy, Zap, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { TRANSFORMATIONS } from "@/data/mockData";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { MEMBERS_TRAINED } from "@/data/site";

const TYPES = ["All", "Weight Loss", "First Pull-Up", "Handstand", "Kids Achievement", "Athletic Conditioning"];

export default function Transformations({ onBookTrial }) {
  const [filter, setFilter] = useState("All");
  useScrollReveal();
  const filtered = filter === "All" ? TRANSFORMATIONS : TRANSFORMATIONS.filter((i) => i.achievement_type === filter);

  return (
    <div className="pt-24 min-h-screen bg-obsidian">
      <SEO title="Member Transformations" description="Real success stories from Cali Terrain members in Secunderabad." path="/transformations" />
      <div className="bg-[#0D0D0D] border-b border-white/5 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="section-tag mb-2">Real Results</p>
          <h1 className="font-heading text-6xl md:text-8xl text-white leading-none mb-4">MEMBER<br /><span className="text-[#2EC4B6]">TRANSFORMATIONS</span></h1>
          <p className="text-zinc-400 text-base max-w-2xl leading-relaxed">Real members, real results. From weight loss to first pull-ups to handstands.</p>
        </div>
      </div>

      <div className="bg-[#2EC4B6] py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[{ icon: Trophy, value: MEMBERS_TRAINED, label: "Members Transformed" }, { icon: Zap, value: "90%", label: "Achieve First Pull-Up" }, { icon: Users, value: "15kg", label: "Avg Weight Lost" }].map(({ icon: Icon, value, label }, i) => (
            <div key={i}>
              <Icon className="w-5 h-5 text-white/70 mx-auto mb-2" />
              <div className="font-heading text-3xl md:text-4xl text-white mb-1">{value}</div>
              <div className="text-white/70 text-xs uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-4">
        <div className="flex flex-wrap gap-2">
          {TYPES.map((type) => (
            <button key={type} onClick={() => setFilter(type)} className={`text-xs font-bold uppercase tracking-widest px-4 py-2 border transition-colors duration-200 ${filter === type ? "bg-[#2EC4B6] border-[#2EC4B6] text-white" : "bg-transparent border-white/20 text-zinc-400 hover:border-white hover:text-white"}`}>{type}</button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-20"><p className="text-zinc-500 text-sm">No transformations found for this category.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, i) => (
              <div key={item.id} className="bg-[#121212] border border-white/5 hover:border-[#2EC4B6]/30 overflow-hidden scroll-fade card-glow" style={{ transitionDelay: `${(i % 3) * 0.1}s` }}>
                <div className="aspect-[16/9] bg-[#1A1A1A] border-b border-white/5 flex items-center justify-center">
                  <Trophy className="w-12 h-12 text-[#2EC4B6]/30" />
                </div>
                <div className="p-6">
                  <span className="inline-block bg-[#2EC4B6]/10 border border-[#2EC4B6]/30 text-[#2EC4B6] text-xs font-bold uppercase tracking-wider px-3 py-1 mb-4">{item.achievement_type}</span>
                  <h3 className="font-heading text-2xl text-white tracking-wide mb-2">{item.member_name}</h3>
                  <p className="text-zinc-300 font-semibold text-sm mb-4">{item.summary}</p>
                  {item.testimonial && <p className="text-zinc-500 text-sm italic leading-relaxed border-l-2 border-[#2EC4B6] pl-3 mb-4">"{item.testimonial}"</p>}
                  {item.date && <p className="text-zinc-600 text-xs uppercase tracking-wider">{item.date}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#0D0D0D] border-y border-white/5 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center scroll-fade">
          <h2 className="font-heading text-5xl md:text-6xl text-white mb-4">YOUR STORY STARTS HERE</h2>
          <p className="text-zinc-400 text-base max-w-lg mx-auto mb-8">Every transformation started with a single decision. Book your free trial.</p>
          <button onClick={onBookTrial} className="btn-primary text-sm">Start My Transformation <ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
