import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  Dumbbell,
  Flame,
  Heart,
  Shield,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import SEO from "@/components/SEO";
import HeroScrollAnimation from "@/components/HeroScrollAnimation";
import { TESTIMONIALS, TRANSFORMATIONS } from "@/data/mockData";

const PROGRAMS = [
  { id: "adult-calisthenics", title: "Adult Calisthenics", icon: Dumbbell, desc: "Build strength, control and athletic movement using only your bodyweight." },
  { id: "kids-calisthenics", title: "Kids Calisthenics", icon: Zap, desc: "Build athletic foundation, coordination and confidence in children." },
  { id: "weight-loss", title: "Weight Loss", icon: Flame, desc: "Burn fat and build lean muscle through structured bodyweight conditioning." },
  { id: "bodyweight-strength", title: "Bodyweight Strength", icon: Trophy, desc: "Master pull-ups, dips, push-ups, rows, core control and full-body strength." },
  { id: "functional-fitness", title: "Functional Fitness", icon: Target, desc: "Train movements that transfer to real-world performance and athleticism." },
  { id: "handstand-skills", title: "Handstand & Skills", icon: Sparkles, desc: "Learn calisthenics skills: handstands, L-sits, front lever progressions." },
];

const WHY_US = [
  { icon: Shield, title: "Calisthenics-Only Gym", desc: "Dedicated bodyweight training facility, not a generic gym." },
  { icon: Users, title: "Expert Coaching", desc: "Certified coaches specializing in calisthenics and progressive training." },
  { icon: Target, title: "Structured Programs", desc: "12 programs designed for every goal from beginners to advanced athletes." },
  { icon: Trophy, title: "Proven Results", desc: "500+ members transformed. Real results backed by real training." },
  { icon: Heart, title: "Community Driven", desc: "Train with a motivated group that pushes you to be your best." },
  { icon: Zap, title: "Kids Programs", desc: "Specialized kids calisthenics classes building fitness from an early age." },
];

const JOURNEY_STEPS = [
  { num: "01", title: "Book Free Trial", desc: "Sign up for a free trial session with no commitment required." },
  { num: "02", title: "Get Assessed", desc: "Our coaches assess your current fitness and set clear goals." },
  { num: "03", title: "Start Training", desc: "Join a structured program with expert guidance and support." },
  { num: "04", title: "See Results", desc: "Track your progress and celebrate milestones along the way." },
];

const STATS = [
  { value: "500+", label: "Members Trained" },
  { value: "9+", label: "Years Experience" },
  { value: "12", label: "Training Programs" },
  { value: "4.9", label: "Google Rating" },
];

const FAQ = [
  { q: "Do I need prior fitness experience?", a: "Absolutely not. Our Beginner Transformation Program is designed for people with zero fitness experience. We start from the basics and build you up." },
  { q: "What age groups do you train?", a: "We train kids from 6-16 years and adults from 16+ years. We have specialized programs for each age group." },
  { q: "What are the batch timings?", a: "Morning batches run from 5:00 AM to 11:00 AM. Evening batches run from 5:00 PM to 10:00 PM. Multiple slots are available." },
  { q: "Is calisthenics good for weight loss?", a: "Yes. Our weight loss program combines bodyweight conditioning with circuit training. Many members lose 10-15kg in 3-5 months." },
  { q: "Where is Cali Terrain located?", a: "We are at SS Complex, 156/2, Sikh Rd, near DPS School, Bowenpally, Secunderabad, Telangana 500009." },
];

function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll(".scroll-fade");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in-view");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function SectionHeading({ align = "left", tag, title, highlight }) {
  const alignClass = align === "center" ? "text-center mx-auto" : "";

  return (
    <div className={`mb-14 scroll-fade ${alignClass}`}>
      <p className="section-tag">{tag}</p>
      <h2 className="font-heading text-5xl sm:text-6xl text-white leading-none">
        {title} <span className="text-[#2EC4B6]">{highlight}</span>
      </h2>
    </div>
  );
}

export default function Home({ onBookTrial }) {
  const [faqOpen, setFaqOpen] = useState(null);
  useScrollReveal();

  return (
    <div className="min-h-screen bg-obsidian">
      <SEO />
      <HeroScrollAnimation onBookTrial={onBookTrial} />

      <section className="relative overflow-hidden bg-[#2EC4B6] px-6 py-10">
        <div className="stat-sheen pointer-events-none absolute inset-0 opacity-20" />
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 text-center md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="stat-tile">
              <div className="font-heading text-4xl text-white md:text-5xl">{stat.value}</div>
              <div className="text-xs uppercase tracking-widest text-white/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading tag="What We Offer" title="TRAINING" highlight="PROGRAMS" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROGRAMS.map(({ icon: Icon, ...program }, index) => (
              <div
                key={program.id}
                className="interactive-card group border border-white/5 bg-[#121212] p-6 scroll-fade"
                style={{ transitionDelay: `${(index % 3) * 0.1}s` }}
              >
                <span className="mb-5 flex h-11 w-11 items-center justify-center border border-[#2EC4B6]/25 bg-[#2EC4B6]/10 text-[#2EC4B6] transition-colors duration-300 group-hover:bg-[#2EC4B6] group-hover:text-[#001814]">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mb-2 font-heading text-xl tracking-wide text-white">{program.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-zinc-500">{program.desc}</p>
                <Link to="/programs" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#2EC4B6] transition-transform duration-200 group-hover:translate-x-1">
                  Learn More <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center scroll-fade">
            <Link to="/programs" className="btn-secondary text-sm">
              View All 12 Programs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section className="bg-[#0D0D0D] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading align="center" tag="Why Cali Terrain" title="WHY TRAIN" highlight="WITH US" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_US.map(({ icon: Icon, title, desc }, index) => (
              <div
                key={title}
                className="interactive-card border border-white/5 bg-[#121212] p-6 scroll-fade"
                style={{ transitionDelay: `${(index % 3) * 0.1}s` }}
              >
                <Icon className="icon-float mb-4 h-6 w-6 text-[#2EC4B6]" />
                <h3 className="mb-2 font-heading text-xl tracking-wide text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading tag="Real Results" title="MEMBER" highlight="TRANSFORMATIONS" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TRANSFORMATIONS.slice(0, 3).map((item, index) => (
              <div
                key={item.id}
                className="interactive-card border border-white/5 bg-[#121212] p-6 scroll-fade"
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <span className="mb-4 inline-block border border-[#2EC4B6]/30 bg-[#2EC4B6]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#2EC4B6]">
                  {item.achievement_type}
                </span>
                <h3 className="mb-2 font-heading text-2xl tracking-wide text-white">{item.member_name}</h3>
                <p className="mb-4 text-sm font-semibold text-zinc-300">{item.summary}</p>
                {item.testimonial && (
                  <p className="mb-4 border-l-2 border-[#2EC4B6] pl-3 text-sm italic leading-relaxed text-zinc-500">
                    "{item.testimonial}"
                  </p>
                )}
                <p className="text-xs uppercase tracking-wider text-zinc-600">{item.date}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center scroll-fade">
            <Link to="/transformations" className="btn-secondary text-sm">
              See All Transformations <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section className="bg-[#0D0D0D] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading align="center" tag="How It Works" title="YOUR" highlight="JOURNEY" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {JOURNEY_STEPS.map((step, index) => (
              <div
                key={step.num}
                className="step-card relative border border-white/5 bg-[#121212] p-6 scroll-fade"
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <span className="absolute right-4 top-4 font-heading text-5xl text-[#2EC4B6]/20">{step.num}</span>
                <div className="relative z-10">
                  <h3 className="mb-2 font-heading text-xl tracking-wide text-white">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading tag="Member Reviews" title="WHAT MEMBERS" highlight="SAY" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="interactive-card border border-white/5 bg-[#121212] p-6 scroll-fade"
                style={{ transitionDelay: `${(index % 3) * 0.1}s` }}
              >
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                    <Star key={starIndex} className="h-4 w-4 fill-[#2EC4B6] text-[#2EC4B6]" />
                  ))}
                </div>
                <p className="mb-4 text-sm italic leading-relaxed text-zinc-300">"{testimonial.content}"</p>
                <p className="text-sm font-bold text-white">{testimonial.name}</p>
                <p className="text-xs text-zinc-500">{testimonial.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section className="bg-[#0D0D0D] px-6 py-24">
        <div className="mx-auto max-w-7xl text-center scroll-fade">
          <p className="section-tag">Investment in Yourself</p>
          <h2 className="mb-6 font-heading text-5xl leading-none text-white sm:text-6xl">
            MEMBERSHIP <span className="text-[#2EC4B6]">PLANS</span>
          </h2>
          <div className="mx-auto mb-10 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              ["Group Training", "Starting from", "Rs. 3,000", "/mo", "border-white/5"],
              ["Personal Training", "Starting from", "Rs. 10,000", "/mo", "border-[#2EC4B6]/30"],
              ["Drop-In", "Per session", "Rs. 400", "", "border-white/5"],
            ].map(([name, caption, price, suffix, border]) => (
              <div key={name} className={`interactive-card border ${border} bg-[#121212] p-6`}>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">{name}</p>
                <p className="mb-1 text-sm text-zinc-400">{caption}</p>
                <p className="font-heading text-3xl text-white">
                  <span className="text-[#2EC4B6]">{price}</span>
                  <span className="text-sm text-zinc-500">{suffix}</span>
                </p>
              </div>
            ))}
          </div>
          <Link to="/pricing" className="btn-secondary text-sm">
            View Full Pricing <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="section-divider" />

      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <SectionHeading align="center" tag="Common Questions" title="FAQ" highlight="" />
          <div className="space-y-3">
            {FAQ.map((item, index) => (
              <div
                key={item.q}
                className="faq-panel border border-white/5 bg-[#121212] scroll-fade"
                style={{ transitionDelay: `${index * 0.05}s` }}
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                  aria-expanded={faqOpen === index}
                >
                  <span className="pr-4 text-sm font-medium text-white">{item.q}</span>
                  <ChevronRight className={`h-4 w-4 flex-shrink-0 text-[#2EC4B6] transition-transform duration-200 ${faqOpen === index ? "rotate-90" : ""}`} />
                </button>
                <div className={`faq-answer px-6 ${faqOpen === index ? "is-open" : ""}`}>
                  <p className="pb-4 text-sm leading-relaxed text-zinc-400">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section className="relative overflow-hidden bg-[#2EC4B6] px-6 py-24">
        <div className="stat-sheen pointer-events-none absolute inset-0 opacity-25" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="mb-6 font-heading text-6xl leading-none text-white md:text-7xl">
            YOUR TRANSFORMATION
            <br />
            STARTS TODAY
          </h2>
          <p className="mx-auto mb-10 max-w-lg text-base text-white/80">
            Book a FREE trial session at Cali Terrain, Bowenpally. No commitment. Just come, train, and experience the difference.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={onBookTrial}
              className="kinetic-button inline-flex items-center gap-2 bg-white px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#2EC4B6] transition-colors duration-200 hover:bg-zinc-100"
            >
              Book Free Trial <ChevronRight className="h-4 w-4" />
            </button>
            <a
              href="https://wa.me/918688458907?text=Hi%2C%20I%20want%20to%20book%20a%20free%20trial%20at%20Cali%20Terrain."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-2 border-white bg-transparent px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-colors duration-200 hover:bg-white/10"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
