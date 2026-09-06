import { lazy, Suspense } from "react";
import { ChevronRight, Check, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import DotGrid from "@/components/reactbits/DotGrid";
import PageBackdrop from "@/components/PageBackdrop";
import { lowPower, useClientValue } from "@/lib/device";

// Decorative only, and hidden below `sm` anyway — never load three.js for it
// on a phone or a low-power device.
const SilhouetteBackdrop3D = lazy(() => import("@/components/home/SilhouetteBackdrop3D"));
import { useScrollReveal } from "@/lib/useScrollReveal";

const PROGRAMS_DATA = [
  { id: "adult-calisthenics", title: "Adult Calisthenics", emoji: "🏋️", description: "Build strength, control and athletic movement using only your bodyweight. Master the fundamentals and progress to advanced skills. Our adult calisthenics classes in Hyderabad run in coached morning and evening batches at Bowenpally, Secunderabad.", benefits: ["Pull-up & dip strength", "Core and grip stability", "Body composition improvement", "Skill-based progression"], level: "Beginner to Advanced", ageGroup: "16+ years", outcome: "A strong, athletic body with complete bodyweight mastery", image: "/disciplines/calisthenics.webp" },
  { id: "kids-calisthenics", title: "Kids Calisthenics", emoji: "⚡", description: "Build athletic foundation, coordination, discipline and confidence in children through fun and structured bodyweight training. Kids calisthenics classes in Hyderabad for ages 6–16, in age-banded evening batches that fit around school hours.", benefits: ["Coordination & body awareness", "Confidence building", "Discipline & focus", "Athletic development for any sport"], level: "Beginner to Intermediate", ageGroup: "6-16 years", outcome: "A fit, confident, athletically capable child", image: "/transformations/kiran-kids.webp" },
  { id: "bodyweight-strength", title: "Bodyweight Strength Training", emoji: "💪", description: "Master the fundamentals of bodyweight strength: pull-ups, dips, push-ups, rows, core control and full-body strength. Bodyweight strength training in Secunderabad with bars at eight heights, rings and every band strength on the floor.", benefits: ["Progressive pull-up training", "Dip and push-up mastery", "Core strength foundation", "Grip and wrist strength"], level: "Beginner to Advanced", ageGroup: "16+ years", outcome: "Complete upper body strength and functional core power", image: "/disciplines/strength.webp" },
  { id: "weight-loss", title: "Weight Loss Program", emoji: "🔥", description: "Burn fat and build lean muscle through structured bodyweight conditioning, circuit training and progressive overload. A weight loss program built on calisthenics conditioning — no treadmill hours, and nutrition guidance included.", benefits: ["Fat burning conditioning", "Lean muscle building", "Metabolic training", "Nutrition guidance"], level: "Beginner to Intermediate", ageGroup: "All ages", outcome: "Measurable fat loss and a lean, strong physique", image: "/transformations/rahul-weightloss.webp" },
  { id: "functional-fitness", title: "Functional Fitness", emoji: "⚙️", description: "Train movements that transfer to real-world performance. Build strength, endurance, agility and conditioning. Functional fitness and HYROX-style conditioning at our Bowenpally facility's performance lane.", benefits: ["Real-world strength patterns", "Cardio conditioning", "Agility and coordination", "Full-body athleticism"], level: "All Levels", ageGroup: "16+ years", outcome: "A functionally fit body ready for any physical challenge", image: "/disciplines/functional.webp" },
  { id: "mobility", title: "Mobility & Flexibility", emoji: "🤸", description: "Improve joint health, posture, flexibility and movement quality through targeted mobility training. Mobility and flexibility coaching in Secunderabad for desk-bound shoulders, stiff hips and painful wrists.", benefits: ["Joint health improvement", "Posture correction", "Injury prevention", "Movement quality"], level: "All Levels", ageGroup: "All ages", outcome: "Better movement, pain-free joints and improved posture", image: "/disciplines/mobility.webp" },
  { id: "beginner-program", title: "Beginner Transformation Program", emoji: "🌱", description: "The perfect starting point for complete beginners with zero fitness experience. Build from ground zero to strong and athletic. The beginner calisthenics program most new members in Hyderabad start with — zero experience required.", benefits: ["Zero experience needed", "Structured 12-week plan", "Full assessment included", "Gradual progressive loading"], level: "Complete Beginner", ageGroup: "16+ years", outcome: "A solid fitness foundation with visible strength gains", image: "/journey/foundation.webp" },
  { id: "handstand-skills", title: "Handstand & Skill Training", emoji: "🤸", description: "Learn calisthenics skills: handstands, L-sits, front lever progressions, and other impressive bodyweight feats. Handstand classes and skill coaching in Hyderabad, taught in our dedicated skill arena.", benefits: ["Freestanding handstand", "L-sit & tuck planche", "Front lever progressions", "Wrist and shoulder conditioning"], level: "Intermediate to Advanced", ageGroup: "14+ years", outcome: "Master impressive calisthenics skills with controlled technique", image: "/skills/handstand-demo-poster.webp" },
  { id: "personal-coaching", title: "Personal Coaching", emoji: "🎯", description: "One-on-one customized training sessions with our head coach. Personalized plan, direct feedback, rapid results. One-on-one calisthenics coaching in Secunderabad with a certified trainer, from ₹10,000/month.", benefits: ["Fully customized program", "Direct coach supervision", "Fastest results", "Flexible scheduling"], level: "All Levels", ageGroup: "All ages", outcome: "Maximum results with personalized attention and accountability", image: "/coaches/vidya-sagar.webp" },
  { id: "group-training", title: "Group Training", emoji: "👥", description: "Community-driven training sessions. Train with a motivated group, push each other and achieve more together. Group calisthenics training in Bowenpally from ₹3,000/month, in batches capped so every member still gets corrected.", benefits: ["Community motivation", "Cost-effective", "Social fitness environment", "Structured group programming"], level: "All Levels", ageGroup: "All ages", outcome: "Consistent training habits powered by community accountability", image: "/community/events.webp" },
  { id: "pullup-strength", title: "Pull-Up / Dip Strength", emoji: "🔗", description: "Dedicated program to build pull-up and dip strength from zero to advanced. Most beginners achieve their first pull-up in 6-10 weeks. The pull-up program behind most first pull-ups at our Secunderabad gym — see the full plan in our blog.", benefits: ["0 to 10+ pull-ups", "Dip strength development", "Grip and lat strength", "Proven progression system"], level: "Beginner to Intermediate", ageGroup: "14+ years", outcome: "10+ clean pull-ups and strong dip performance", image: "/transformations/priya-pullup.webp" },
  { id: "athletic-conditioning", title: "Athletic Conditioning", emoji: "⚡", description: "High-performance conditioning for athletes and fitness enthusiasts who want to push their limits. Athletic conditioning for sportspeople across Hyderabad who need a higher performance ceiling.", benefits: ["VO2 max improvement", "Explosive power", "Sport-specific conditioning", "Elite fitness baseline"], level: "Advanced", ageGroup: "16+ years", outcome: "Elite athletic performance and conditioning", image: "/disciplines/hyrox.webp" },
];

export default function Programs({ onBookTrial }) {
  useScrollReveal();
  const show3d = useClientValue(
    () => !lowPower() && window.matchMedia("(min-width: 640px)").matches,
    false
  );

  return (
    <div className="relative isolate pt-24 min-h-screen bg-obsidian">
      <SEO title="Calisthenics Classes & Training Programs in Hyderabad" description="12 coached programs at Cali Terrain, Bowenpally: adult calisthenics, kids 6–16, the 12-week beginner track, handstand & skills, weight loss and 1-on-1 personal coaching." path="/programs" />
      <PageBackdrop />

      <PageHero
        eyebrow="What We Offer"
        lines={["TRAINING", "PROGRAMS"]}
        ghost="12"
        sub="From complete beginners to advanced calisthenics athletes: a program for every goal and fitness level in Secunderabad."
        backdrop={
          /* 3D particle handstand standing in the open right half of the hero */
          <div className="absolute inset-y-0 right-[3%] hidden w-[44%] max-w-[520px] sm:block" aria-hidden="true">
            {show3d && (
              <Suspense fallback={null}>
                <SilhouetteBackdrop3D className="opacity-70" />
              </Suspense>
            )}
          </div>
        }
      />

      {/* Programs Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {PROGRAMS_DATA.map((program, i) => (
            <div
              key={program.id}
              id={program.id}
              className="scroll-mt-28 bg-[#131B25] border border-white/5 hover:border-[#2E8DFF]/30 overflow-hidden scroll-fade card-glow"
              style={{ transitionDelay: `${(i % 2) * 0.1}s` }}
            >
              <div className="aspect-[21/9] overflow-hidden">
                <img
                  src={program.image}
                  alt={`${program.title} at Cali Terrain, Bowenpally`}
                  loading="lazy"
                  decoding="async"
                  width="1120"
                  height="480"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = "none"; e.target.parentElement.style.background = "#1A2230"; }}
                />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="font-heading text-2xl text-white tracking-wide">{program.title}</h2>
                  <div className="flex gap-2 flex-shrink-0 ml-4">
                    <span className="text-xs bg-[#2E8DFF]/10 border border-[#2E8DFF]/30 text-[#2E8DFF] px-2 py-1 font-bold uppercase tracking-wider">
                      {program.level}
                    </span>
                  </div>
                </div>
                <p className="text-[#8A99AB] text-xs uppercase tracking-wider mb-3 font-bold">Age: {program.ageGroup}</p>
                <p className="text-[#9AA7B6] text-sm leading-relaxed mb-5">{program.description}</p>

                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#8A99AB] mb-3">Key Benefits</p>
                  <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
                    {program.benefits.map((b, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm text-[#9AA7B6]">
                        <Check className="w-3 h-3 text-[#2E8DFF] flex-shrink-0" /> {b}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1A2230] border border-white/5 p-4 mb-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#8A99AB] mb-1">Expected Outcome</p>
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
      <div className="relative overflow-hidden bg-[#1F6FE0] py-20 px-6">
        {/* React Bits DotGrid: white interactive dots over the blue band */}
        <div className="absolute inset-0 pointer-events-none opacity-60" aria-hidden="true">
          <DotGrid dotSize={3} gap={30} baseColor="#57A4FF" activeColor="#FFFFFF" proximity={150} />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-5xl md:text-6xl text-white mb-4">NOT SURE WHICH PROGRAM?</h2>
          <p className="text-white/80 mb-8 text-base max-w-lg mx-auto">
            Come in for a free assessment. Our coaches will recommend the best program based on your goals and current fitness.
          </p>
          <button onClick={onBookTrial} className="bg-white hover:bg-zinc-100 text-[#2E8DFF] font-bold uppercase tracking-widest px-8 py-4 text-sm inline-flex items-center gap-2 transition-colors duration-200">
            Book Free Assessment <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
