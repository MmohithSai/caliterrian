import { useEffect } from "react";
import { ChevronRight, Award, Users, Star } from "lucide-react";
import SEO from "@/components/SEO";

const COACHES = [
  {
    name: "Vidya Sagar", role: "Head Coach & Founder",
    bio: "With 9 years of experience in fitness and calisthenics, Coach Vidya Sagar founded Cali Terrain to bring world-class bodyweight training to Secunderabad.",
    specialties: ["Skills Progress Specialist", "Kids Calisthenics", "Beginner Transformations", "Weight Loss"],
    certifications: ["Personal Training Certification", "Special Population Certification", "Kids Fitness Instructor"],
    philosophy: "Calisthenics is not just exercise — it's building a relationship with your own body.",
    experience: "9 Years", members: "500+ Trained",
    image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=600&q=80",
  },
  {
    name: "Lakpa", role: "Coach & Competitive Athlete",
    bio: "Coach Lakpa is a champion-level calisthenics athlete. A Yodha Race winner in Chennai and All India Finalist, he brings competitive edge to his coaching.",
    specialties: ["Competitive Calisthenics", "Advanced Skill Training", "Strength & Conditioning", "Athletic Performance"],
    certifications: ["Yodha Race Winner — Chennai", "All India Finalist", "Calisthenics Strength Coach"],
    philosophy: "Strength, discipline, results. The bar doesn't care about your excuses. Show up and put in the work.",
    experience: "5+ Years", members: "300+ Trained",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
  },
];

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".scroll-fade");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in-view"); });
    }, { threshold: 0.1 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  });
}

export default function Coaches({ onBookTrial }) {
  useScrollReveal();
  return (
    <div className="pt-24 min-h-screen bg-obsidian">
      <SEO title="Our Coaches" description="Meet the expert calisthenics coaches at Cali Terrain, Secunderabad." />
      <div className="bg-[#0D0D0D] border-b border-white/5 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="section-tag mb-2">The Team</p>
          <h1 className="font-heading text-6xl md:text-8xl text-white leading-none mb-4">MEET THE<br /><span className="text-[#2EC4B6]">COACHES</span></h1>
          <p className="text-zinc-400 text-base max-w-2xl leading-relaxed">Expert bodyweight training coaches dedicated to transforming your fitness journey.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-20 space-y-20">
        {COACHES.map((coach, i) => (
          <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start scroll-fade">
            <div className={`relative ${i % 2 === 1 ? "lg:order-2" : ""}`}>
              <div className="aspect-[4/5] overflow-hidden bg-[#121212]">
                <img src={coach.image} alt={coach.name} className="w-full h-full object-cover object-top" onError={(e) => { e.target.style.display = "none"; e.target.parentElement.style.background = "#1A1A1A"; }} />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-[#2EC4B6] p-4 hidden md:block">
                <p className="font-heading text-xl text-white">{coach.experience}</p>
                <p className="text-white/70 text-xs uppercase tracking-widest">Experience</p>
              </div>
            </div>
            <div className={i % 2 === 1 ? "lg:order-1" : ""}>
              <p className="section-tag mb-2">Coach {i + 1}</p>
              <h2 className="font-heading text-4xl text-white tracking-wide mb-1">{coach.name}</h2>
              <p className="text-[#2EC4B6] font-bold text-sm uppercase tracking-widest mb-6">{coach.role}</p>
              <p className="text-zinc-400 text-base leading-relaxed mb-8">{coach.bio}</p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#121212] border border-white/5 p-4 text-center">
                  <Award className="w-5 h-5 text-[#2EC4B6] mx-auto mb-2" />
                  <p className="font-heading text-xl text-white">{coach.experience}</p>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider">Experience</p>
                </div>
                <div className="bg-[#121212] border border-white/5 p-4 text-center">
                  <Users className="w-5 h-5 text-[#2EC4B6] mx-auto mb-2" />
                  <p className="font-heading text-xl text-white">{coach.members}</p>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider">Impact</p>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {coach.specialties.map((s, j) => (<span key={j} className="bg-[#2EC4B6]/10 border border-[#2EC4B6]/30 text-[#2EC4B6] text-xs font-bold uppercase tracking-wider px-3 py-1">{s}</span>))}
                </div>
              </div>
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Certifications</p>
                <div className="space-y-2">
                  {coach.certifications.map((c, j) => (<div key={j} className="flex items-center gap-2 text-sm text-zinc-400"><Star className="w-3 h-3 text-[#2EC4B6] flex-shrink-0" /> {c}</div>))}
                </div>
              </div>
              <blockquote className="border-l-4 border-[#2EC4B6] pl-4 mb-8">
                <p className="text-zinc-300 text-sm italic leading-relaxed">"{coach.philosophy}"</p>
              </blockquote>
              <button onClick={onBookTrial} className="btn-primary text-sm">Train with this Coach <ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-[#0D0D0D] border-y border-white/5 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading text-4xl md:text-5xl text-white mb-10 text-center scroll-fade">WHY TRAIN WITH OUR COACHES</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{ icon: Users, title: "Beginner-Friendly", desc: "Patient, progressive coaching for complete beginners." }, { icon: Award, title: "Calisthenics Specialists", desc: "Coaches who specialize exclusively in bodyweight training." }, { icon: Star, title: "Proven Results", desc: "Hundreds of members transformed. Real results." }].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="bg-[#121212] border border-white/5 p-6 scroll-fade" style={{ transitionDelay: `${i * 0.1}s` }}>
                <Icon className="w-6 h-6 text-[#2EC4B6] mb-4" />
                <h3 className="font-heading text-xl text-white tracking-wide mb-2">{title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
