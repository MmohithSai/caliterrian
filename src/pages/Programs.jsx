import { useEffect } from "react";
import { ChevronRight, Check, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";

const PROGRAMS_DATA = [
  { id: "adult-calisthenics", title: "Adult Calisthenics", emoji: "🏋️", description: "Build strength, control and athletic movement using only your bodyweight. Master the fundamentals and progress to advanced skills.", benefits: ["Pull-up & dip strength", "Core and grip stability", "Body composition improvement", "Skill-based progression"], level: "Beginner to Advanced", ageGroup: "16+ years", outcome: "A strong, athletic body with complete bodyweight mastery", image: "https://images.unsplash.com/photo-1626807020058-30eb4ef93c84?w=800&q=80" },
  { id: "kids-calisthenics", title: "Kids Calisthenics", emoji: "⚡", description: "Build athletic foundation, coordination, discipline and confidence in children through fun and structured bodyweight training.", benefits: ["Coordination & body awareness", "Confidence building", "Discipline & focus", "Athletic development for any sport"], level: "Beginner to Intermediate", ageGroup: "6-16 years", outcome: "A fit, confident, athletically capable child", image: "https://images.unsplash.com/photo-1761039807514-292d7d33059f?w=800&q=80" },
  { id: "bodyweight-strength", title: "Bodyweight Strength Training", emoji: "💪", description: "Master the fundamentals of bodyweight strength: pull-ups, dips, push-ups, rows, core control and full-body strength.", benefits: ["Progressive pull-up training", "Dip and push-up mastery", "Core strength foundation", "Grip and wrist strength"], level: "Beginner to Advanced", ageGroup: "16+ years", outcome: "Complete upper body strength and functional core power", image: "https://images.unsplash.com/photo-1642267221102-15e7a4c39cd1?w=800&q=80" },
  { id: "weight-loss", title: "Weight Loss Program", emoji: "🔥", description: "Burn fat and build lean muscle through structured bodyweight conditioning, circuit training and progressive overload.", benefits: ["Fat burning conditioning", "Lean muscle building", "Metabolic training", "Nutrition guidance"], level: "Beginner to Intermediate", ageGroup: "All ages", outcome: "Measurable fat loss and a lean, strong physique", image: "https://images.unsplash.com/photo-1758520705368-bbd8830dda35?w=800&q=80" },
  { id: "functional-fitness", title: "Functional Fitness", emoji: "⚙️", description: "Train movements that transfer to real-world performance. Build strength, endurance, agility and conditioning.", benefits: ["Real-world strength patterns", "Cardio conditioning", "Agility and coordination", "Full-body athleticism"], level: "All Levels", ageGroup: "16+ years", outcome: "A functionally fit body ready for any physical challenge", image: "https://images.unsplash.com/photo-1772206605293-3fadeaa944e1?w=800&q=80" },
  { id: "mobility", title: "Mobility & Flexibility", emoji: "🤸", description: "Improve joint health, posture, flexibility and movement quality through targeted mobility training.", benefits: ["Joint health improvement", "Posture correction", "Injury prevention", "Movement quality"], level: "All Levels", ageGroup: "All ages", outcome: "Better movement, pain-free joints and improved posture", image: "https://images.unsplash.com/photo-1762769334319-e4b5124d8204?w=800&q=80" },
  { id: "beginner-program", title: "Beginner Transformation Program", emoji: "🌱", description: "The perfect starting point for complete beginners with zero fitness experience. Build from ground zero to strong and athletic.", benefits: ["Zero experience needed", "Structured 12-week plan", "Full assessment included", "Gradual progressive loading"], level: "Complete Beginner", ageGroup: "16+ years", outcome: "A solid fitness foundation with visible strength gains", image: "https://images.unsplash.com/photo-1710746904729-f3ad9f682bb9?w=800&q=80" },
  { id: "handstand-skills", title: "Handstand & Skill Training", emoji: "🤸", description: "Learn calisthenics skills: handstands, L-sits, front lever progressions, and other impressive bodyweight feats.", benefits: ["Freestanding handstand", "L-sit & tuck planche", "Front lever progressions", "Wrist and shoulder conditioning"], level: "Intermediate to Advanced", ageGroup: "14+ years", outcome: "Master impressive calisthenics skills with controlled technique", image: "https://images.unsplash.com/photo-1623092350739-4635ce84d47c?w=800&q=80" },
  { id: "personal-coaching", title: "Personal Coaching", emoji: "🎯", description: "One-on-one customized training sessions with our head coach. Personalized plan, direct feedback, rapid results.", benefits: ["Fully customized program", "Direct coach supervision", "Fastest results", "Flexible scheduling"], level: "All Levels", ageGroup: "All ages", outcome: "Maximum results with personalized attention and accountability", image: "https://images.pexels.com/photos/3912944/pexels-photo-3912944.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { id: "group-training", title: "Group Training", emoji: "👥", description: "Community-driven training sessions. Train with a motivated group, push each other and achieve more together.", benefits: ["Community motivation", "Cost-effective", "Social fitness environment", "Structured group programming"], level: "All Levels", ageGroup: "All ages", outcome: "Consistent training habits powered by community accountability", image: "https://images.unsplash.com/photo-1772206605293-3fadeaa944e1?w=800&q=80" },
  { id: "pullup-strength", title: "Pull-Up / Dip Strength", emoji: "🔗", description: "Dedicated program to build pull-up and dip strength from zero to advanced. Most beginners achieve their first pull-up in 6-10 weeks.", benefits: ["0 to 10+ pull-ups", "Dip strength development", "Grip and lat strength", "Proven progression system"], level: "Beginner to Intermediate", ageGroup: "14+ years", outcome: "10+ clean pull-ups and strong dip performance", image: "https://images.unsplash.com/photo-1622302802228-c74d3592546c?w=800&q=80" },
  { id: "athletic-conditioning", title: "Athletic Conditioning", emoji: "⚡", description: "High-performance conditioning for athletes and fitness enthusiasts who want to push their limits.", benefits: ["VO2 max improvement", "Explosive power", "Sport-specific conditioning", "Elite fitness baseline"], level: "Advanced", ageGroup: "16+ years", outcome: "Elite athletic performance and conditioning", image: "https://images.unsplash.com/photo-1758520705368-bbd8830dda35?w=800&q=80" },
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

export default function Programs({ onBookTrial }) {
  useScrollReveal();

  return (
    <div className="pt-24 min-h-screen bg-obsidian">
      <SEO title="Training Programs" description="12 calisthenics and bodyweight training programs at Cali Terrain, Secunderabad. Adult, kids, weight loss, handstand, personal coaching and more." />

      {/* Header */}
      <div className="bg-[#0D0D0D] border-b border-white/5 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="section-tag mb-2">What We Offer</p>
          <h1 className="font-heading text-6xl md:text-8xl text-white leading-none mb-4">
            TRAINING<br /><span className="text-[#2EC4B6]">PROGRAMS</span>
          </h1>
          <p className="text-zinc-400 text-base max-w-2xl leading-relaxed">
            From complete beginners to advanced calisthenics athletes — we have a program for every goal and fitness level in Secunderabad.
          </p>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {PROGRAMS_DATA.map((program, i) => (
            <div
              key={program.id}
              className="bg-[#121212] border border-white/5 hover:border-[#2EC4B6]/30 overflow-hidden scroll-fade card-glow"
              style={{ transitionDelay: `${(i % 2) * 0.1}s` }}
            >
              <div className="aspect-[21/9] overflow-hidden">
                <img
                  src={program.image}
                  alt={program.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = "none"; e.target.parentElement.style.background = "#1A1A1A"; }}
                />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="font-heading text-2xl text-white tracking-wide">{program.title}</h2>
                  <div className="flex gap-2 flex-shrink-0 ml-4">
                    <span className="text-xs bg-[#2EC4B6]/10 border border-[#2EC4B6]/30 text-[#2EC4B6] px-2 py-1 font-bold uppercase tracking-wider">
                      {program.level}
                    </span>
                  </div>
                </div>
                <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3 font-bold">Age: {program.ageGroup}</p>
                <p className="text-zinc-400 text-sm leading-relaxed mb-5">{program.description}</p>

                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Key Benefits</p>
                  <div className="grid grid-cols-2 gap-2">
                    {program.benefits.map((b, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm text-zinc-400">
                        <Check className="w-3 h-3 text-[#2EC4B6] flex-shrink-0" /> {b}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1A1A1A] border border-white/5 p-4 mb-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Expected Outcome</p>
                  <p className="text-white text-sm font-medium">{program.outcome}</p>
                </div>

                <button onClick={onBookTrial} className="btn-primary text-xs w-full justify-center">
                  Book Free Trial <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div className="bg-[#2EC4B6] py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-5xl md:text-6xl text-white mb-4">NOT SURE WHICH PROGRAM?</h2>
          <p className="text-white/80 mb-8 text-base max-w-lg mx-auto">
            Come in for a free assessment. Our coaches will recommend the best program based on your goals and current fitness.
          </p>
          <button onClick={onBookTrial} className="bg-white hover:bg-zinc-100 text-[#2EC4B6] font-bold uppercase tracking-widest px-8 py-4 text-sm inline-flex items-center gap-2 transition-colors duration-200">
            Book Free Assessment <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
