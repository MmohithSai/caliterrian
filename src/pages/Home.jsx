import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
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
import { STATS } from "@/data/site";
import {
  fadeUp,
  staggerContainer,
  scaleIn,
  viewportOnce,
  useSectionScroll,
} from "@/lib/animations";
import { useImageSequenceCanvas } from "@/lib/imageSequence";
import { useScrollReveal } from "@/lib/useScrollReveal";

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

const FAQ = [
  { q: "Do I need prior fitness experience?", a: "Absolutely not. Our Beginner Transformation Program is designed for people with zero fitness experience. We start from the basics and build you up." },
  { q: "What age groups do you train?", a: "We train kids from 6-16 years and adults from 16+ years. We have specialized programs for each age group." },
  { q: "What are the batch timings?", a: "Morning batches run from 5:00 AM to 11:00 AM. Evening batches run from 5:00 PM to 10:00 PM. Multiple slots are available." },
  { q: "Is calisthenics good for weight loss?", a: "Yes. Our weight loss program combines bodyweight conditioning with circuit training. Many members lose 10-15kg in 3-5 months." },
  { q: "Where is Cali Terrain located?", a: "We are at SS Complex, 156/2, Sikh Rd, near DPS School, Bowenpally, Secunderabad, Telangana 500009." },
];

function SectionHeading({ align = "left", tag, title, highlight }) {
  const alignClass = align === "center" ? "text-center mx-auto" : "";

  return (
    <motion.div
      className={`mb-14 ${alignClass}`}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      <p className="section-tag">{tag}</p>
      <h2 className="font-heading text-5xl sm:text-6xl text-white leading-none">
        {title} <span className="text-[#2EC4B6]">{highlight}</span>
      </h2>
    </motion.div>
  );
}

// 30 fps source: 90 frames covering one complete rep
// (frame 1 = top, ~frame 45 = bottom, frame 90 = back to top).
const PUSHUP_FRAME_COUNT = 90;
const PUSHUP_FRAME_PATH = (i) =>
  `/pushup/ezgif-frame-${String(i + 1).padStart(3, "0")}.jpg`;

function ProgramCard({ program, progress, index, reduceMotion }) {
  const Icon = program.icon;
  // Cards reveal staggered between progress 0.18 → 0.82
  const start = 0.18 + index * 0.085;
  const end = start + 0.16;
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [40, 0]);
  const blur = useTransform(progress, [start, end], [6, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  return (
    <motion.div
      style={reduceMotion ? undefined : { opacity, y, filter }}
      className="will-change-transform"
    >
      <motion.div
        whileHover={
          reduceMotion
            ? undefined
            : {
                y: -6,
                scale: 1.05,
                boxShadow: "0 22px 60px rgba(0, 255, 200, 0.18)",
                borderColor: "rgba(46, 196, 182, 0.42)",
              }
        }
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="premium-program-card group h-full border border-white/10 bg-[#0A0A0A]/85 p-5 backdrop-blur-md"
      >
        <motion.span
          className="mb-3 flex h-10 w-10 items-center justify-center border border-[#2EC4B6]/30 bg-[#2EC4B6]/10 text-[#2EC4B6]"
          whileHover={reduceMotion ? undefined : { scale: 1.08, rotate: -3 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          <Icon className="h-4 w-4" />
        </motion.span>
        <h3 className="mb-1.5 font-heading text-lg tracking-wide text-white">
          {program.title}
        </h3>
        <p className="mb-3 text-xs leading-relaxed text-zinc-400">{program.desc}</p>
        <Link
          to="/programs"
          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#2EC4B6] transition-transform duration-300 group-hover:translate-x-1"
        >
          Learn More <ArrowRight className="h-3 w-3" />
        </Link>
      </motion.div>
    </motion.div>
  );
}

function TrainingProgramsSection() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <TrainingProgramsSectionStatic />;
  return <TrainingProgramsSectionScroll />;
}

function TrainingProgramsSectionScroll() {
  const containerRef = useRef(null);
  const { canvasRef, smoothed } = useImageSequenceCanvas({
    containerRef,
    frameCount: PUSHUP_FRAME_COUNT,
    framePath: PUSHUP_FRAME_PATH,
  });

  // Heading + supporting copy reveal early
  const headOpacity = useTransform(smoothed, [0.0, 0.12], [0, 1]);
  const headY = useTransform(smoothed, [0.0, 0.12], [40, 0]);
  const ctaOpacity = useTransform(smoothed, [0.84, 0.95], [0, 1]);
  const ctaY = useTransform(smoothed, [0.84, 0.95], [30, 0]);
  // Canvas glow swells as the rep peaks
  const glowOpacity = useTransform(
    smoothed,
    [0, 0.5, 1],
    [0.25, 0.55, 0.25]
  );

  return (
    <section
      ref={containerRef}
      className="relative bg-[#0A0A0A]"
      style={{ height: "240vh" }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Gradient stack: keeps left side dark for text legibility, lets athlete glow on right */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.95)_0%,rgba(10,10,10,0.78)_30%,rgba(10,10,10,0.32)_62%,rgba(10,10,10,0.55)_100%)]" />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: glowOpacity,
            background:
              "radial-gradient(circle at 72% 50%, rgba(46,196,182,0.22), transparent 55%)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(to_bottom,#0A0A0A,transparent)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,#0A0A0A,transparent)]" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col px-6 py-16 lg:py-20">
          <motion.div
            style={{ opacity: headOpacity, y: headY }}
            className="max-w-xl"
          >
            <p className="section-tag">What We Offer</p>
            <h2 className="font-heading text-5xl leading-none text-white sm:text-6xl lg:text-7xl">
              TRAINING <span className="text-[#2EC4B6]">PROGRAMS</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-zinc-400">
              Push your limits. Master your bodyweight. From foundational
              strength to advanced skills — pick the path that moves you forward.
            </p>
          </motion.div>

          <div className="mt-auto grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PROGRAMS.map((program, index) => (
              <ProgramCard
                key={program.id}
                program={program}
                index={index}
                progress={smoothed}
                reduceMotion={false}
              />
            ))}
          </div>

          <motion.div
            style={{ opacity: ctaOpacity, y: ctaY }}
            className="mt-6 text-center sm:text-left"
          >
            <Link to="/programs" className="btn-secondary text-sm">
              View All 12 Programs <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>

        {/* Subtle progress bar — shows where you are in the rep */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/5">
          <motion.div
            className="h-full bg-[#2EC4B6]"
            style={{ scaleX: smoothed, transformOrigin: "0 50%" }}
          />
        </div>
      </div>
    </section>
  );
}

function TrainingProgramsSectionStatic() {
  return (
    <section className="relative overflow-hidden px-6 py-24">
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading tag="What We Offer" title="TRAINING" highlight="PROGRAMS" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAMS.map(({ icon: Icon, ...program }) => (
            <div
              key={program.id}
              className="premium-program-card group border border-white/5 bg-[#121212]/95 p-6"
            >
              <span className="mb-5 flex h-11 w-11 items-center justify-center border border-[#2EC4B6]/25 bg-[#2EC4B6]/10 text-[#2EC4B6]">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mb-2 font-heading text-xl tracking-wide text-white">
                {program.title}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-zinc-500">
                {program.desc}
              </p>
              <Link
                to="/programs"
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#2EC4B6]"
              >
                Learn More <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/programs" className="btn-secondary text-sm">
            View All 12 Programs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// 240 frames @ 30fps of the runner travelling across the frame from left to right.
const RUNNING_FRAME_COUNT = 240;
const RUNNING_FRAME_PATH = (i) =>
  `/running/ezgif-frame-${String(i + 1).padStart(3, "0")}.jpg`;

function WhyUsCard({ Icon, title, desc, progress, index, reduceMotion }) {
  // 6 cards, reveal windows mapped to the girl's left-to-right journey
  const start = 0.1 + index * 0.12;
  const end = start + 0.14;
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [28, 0]);
  const x = useTransform(progress, [start, end], [-24, 0]);
  const blur = useTransform(progress, [start, end], [4, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  return (
    <motion.div
      style={reduceMotion ? undefined : { opacity, y, x, filter }}
      className="will-change-transform"
    >
      <motion.div
        whileHover={
          reduceMotion
            ? undefined
            : {
                y: -4,
                boxShadow: "0 18px 48px rgba(46, 196, 182, 0.18)",
                borderColor: "rgba(46, 196, 182, 0.4)",
              }
        }
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="h-full border border-white/10 bg-[#0A0A0A]/80 p-5 backdrop-blur-md"
      >
        <Icon className="mb-3 h-5 w-5 text-[#2EC4B6]" />
        <h3 className="mb-1.5 font-heading text-lg tracking-wide text-white">
          {title}
        </h3>
        <p className="text-xs leading-relaxed text-zinc-400">{desc}</p>
      </motion.div>
    </motion.div>
  );
}

function WhyUsSection() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <WhyUsSectionStatic />;
  return <WhyUsSectionScroll />;
}

function WhyUsSectionScroll() {
  const containerRef = useRef(null);
  const { canvasRef, smoothed } = useImageSequenceCanvas({
    containerRef,
    frameCount: RUNNING_FRAME_COUNT,
    framePath: RUNNING_FRAME_PATH,
  });

  const headOpacity = useTransform(smoothed, [0, 0.1], [0, 1]);
  const headY = useTransform(smoothed, [0, 0.1], [30, 0]);
  // Teal trail line that sweeps across as she runs — pure scroll-progress driven
  const trailScaleX = useTransform(smoothed, [0, 1], [0, 1]);
  // Subtle vignette pulse mid-sprint
  const vignetteOpacity = useTransform(
    smoothed,
    [0, 0.5, 1],
    [0.2, 0.45, 0.2]
  );

  return (
    <section
      ref={containerRef}
      className="relative bg-[#0D0D0D]"
      style={{ height: "240vh" }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Vertical dark gradient — keeps top heading and bottom cards readable while
            preserving the runner's mid-frame definition. */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.85)_0%,rgba(10,10,10,0.35)_30%,rgba(10,10,10,0.35)_60%,rgba(10,10,10,0.92)_100%)]" />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: vignetteOpacity,
            background:
              "radial-gradient(circle at 50% 50%, transparent 35%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col px-6 py-16 lg:py-20">
          <motion.div
            style={{ opacity: headOpacity, y: headY }}
            className="text-center"
          >
            <p className="section-tag">Why Cali Terrain</p>
            <h2 className="font-heading text-5xl leading-none text-white sm:text-6xl lg:text-7xl">
              WHY TRAIN <span className="text-[#2EC4B6]">WITH US</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-300">
              Six reasons our members keep showing up — built into every session,
              every coach, every program.
            </p>
          </motion.div>

          {/* Cards laid out left → right, revealing as she crosses the frame. */}
          <div className="mt-auto grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {WHY_US.map(({ icon: Icon, title, desc }, index) => (
              <WhyUsCard
                key={title}
                Icon={Icon}
                title={title}
                desc={desc}
                progress={smoothed}
                index={index}
                reduceMotion={false}
              />
            ))}
          </div>
        </div>

        {/* Teal trail line sweeping the bottom of the viewport as she runs */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/5">
          <motion.div
            className="h-full bg-[#2EC4B6]"
            style={{ scaleX: trailScaleX, transformOrigin: "0 50%" }}
          />
        </div>
      </div>
    </section>
  );
}

function WhyUsSectionStatic() {
  return (
    <section className="bg-[#0D0D0D] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          align="center"
          tag="Why Cali Terrain"
          title="WHY TRAIN"
          highlight="WITH US"
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_US.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="interactive-card border border-white/5 bg-[#121212] p-6"
            >
              <Icon className="icon-float mb-4 h-6 w-6 text-[#2EC4B6]" />
              <h3 className="mb-2 font-heading text-xl tracking-wide text-white">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TransformationsSection() {
  const sectionRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const { y, opacity, scale } = useSectionScroll(sectionRef, { parallaxRange: 30 });

  // Per-card stagger variant with index-based delay
  const cardVariant = (index) => ({
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: index * 0.12,
      },
    },
  });

  // Extract initials for profile avatar
  const getInitials = (name) => {
    const parts = name.replace(/\./g, "").trim().split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <motion.section
      ref={sectionRef}
      className="transformations-section px-6 py-28 will-change-transform"
      style={{ y, opacity, scale }}
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading tag="Real Results" title="MEMBER" highlight="TRANSFORMATIONS" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TRANSFORMATIONS.slice(0, 3).map((item, index) => (
            <motion.div
              key={item.id}
              variants={cardVariant(index)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                      y: -6,
                      boxShadow:
                        "0 22px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(46, 196, 182, 0.12)",
                      borderColor: "rgba(46, 196, 182, 0.4)",
                    }
              }
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="transform-card border border-white/[0.06] bg-[#0F0F0F]/90 p-6 backdrop-blur-sm"
            >
              {/* Profile header with avatar */}
              <div className="mb-5 flex items-center gap-4">
                <div className="profile-avatar" aria-hidden="true">
                  {getInitials(item.member_name)}
                </div>
                <div>
                  <h3 className="font-heading text-2xl leading-none tracking-wide text-white">
                    {item.member_name}
                  </h3>
                  <p className="mt-0.5 text-xs uppercase tracking-wider text-zinc-500">
                    {item.date}
                  </p>
                </div>
              </div>

              {/* Achievement badge */}
              <motion.span
                className="mb-4 inline-block border border-[#2EC4B6]/25 bg-[#2EC4B6]/8 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#2EC4B6]"
                initial={{ opacity: 0, scale: 1.1 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 + 0.2 }}
              >
                {item.achievement_type}
              </motion.span>

              {/* Summary */}
              <p className="mb-4 text-sm font-semibold leading-snug text-zinc-200">
                {item.summary}
              </p>

              {/* Testimonial quote */}
              {item.testimonial && (
                <p className="mb-4 border-l-2 border-[#2EC4B6]/50 pl-3 text-sm italic leading-relaxed text-zinc-400">
                  &ldquo;{item.testimonial}&rdquo;
                </p>
              )}
            </motion.div>
          ))}
        </div>
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
        >
          <Link to="/transformations" className="btn-secondary text-sm">
            See All Transformations <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}

function JourneySection() {
  const sectionRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const stepShift = useSpring(
    useTransform(
      scrollYProgress,
      [0, 1],
      shouldReduceMotion ? [0, 0] : [24, -24]
    ),
    { stiffness: 80, damping: 30, mass: 0.5 }
  );
  const sectionScale = useTransform(
    scrollYProgress,
    [0, 0.5],
    shouldReduceMotion ? [1, 1] : [0.98, 1]
  );

  return (
    <motion.section
      ref={sectionRef}
      className="bg-[#0D0D0D] px-6 py-24 will-change-transform"
      style={{ scale: sectionScale }}
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading align="center" tag="How It Works" title="YOUR" highlight="JOURNEY" />
        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          style={{ y: stepShift }}
        >
          {JOURNEY_STEPS.map((step) => (
            <motion.div
              key={step.num}
              variants={fadeUp}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : { y: -4, borderColor: "rgba(46, 196, 182, 0.35)" }
              }
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="step-card relative border border-white/5 bg-[#121212] p-6"
            >
              <span className="absolute right-4 top-4 font-heading text-5xl text-[#2EC4B6]/20">{step.num}</span>
              <div className="relative z-10">
                <h3 className="mb-2 font-heading text-xl tracking-wide text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

function TestimonialsSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading tag="Member Reviews" title="WHAT MEMBERS" highlight="SAY" />
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              variants={fadeUp}
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      y: [0, -4, 0],
                      transition: {
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.4,
                      },
                    }
              }
              className="interactive-card border border-white/5 bg-[#121212] p-6"
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                  <Star key={starIndex} className="h-4 w-4 fill-[#2EC4B6] text-[#2EC4B6]" />
                ))}
              </div>
              <p className="mb-4 text-sm italic leading-relaxed text-zinc-300">"{testimonial.content}"</p>
              <p className="text-sm font-bold text-white">{testimonial.name}</p>
              <p className="text-xs text-zinc-500">{testimonial.role}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function PricingSection() {
  const sectionRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const sectionScale = useTransform(
    scrollYProgress,
    [0, 0.5],
    shouldReduceMotion ? [1, 1] : [0.98, 1]
  );

  const plans = [
    { name: "Group Training", caption: "Starting from", price: "Rs. 3,000", suffix: "/mo", border: "border-white/5", featured: false },
    { name: "Personal Training", caption: "Starting from", price: "Rs. 10,000", suffix: "/mo", border: "border-[#2EC4B6]/30", featured: true },
    { name: "Drop-In", caption: "Per session", price: "Rs. 400", suffix: "", border: "border-white/5", featured: false },
  ];

  return (
    <motion.section
      ref={sectionRef}
      className="bg-[#0D0D0D] px-6 py-24 will-change-transform"
      style={{ scale: sectionScale }}
    >
      <motion.div
        className="mx-auto max-w-7xl text-center"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        <motion.p variants={fadeUp} className="section-tag">
          Investment in Yourself
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="mb-6 font-heading text-5xl leading-none text-white sm:text-6xl"
        >
          MEMBERSHIP <span className="text-[#2EC4B6]">PLANS</span>
        </motion.h2>
        <motion.div
          className="mx-auto mb-10 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3"
          variants={staggerContainer}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              whileHover={
                shouldReduceMotion ? undefined : { scale: 1.05, y: -4 }
              }
              animate={
                plan.featured && !shouldReduceMotion
                  ? {
                      boxShadow: [
                        "0 0 0 rgba(46, 196, 182, 0)",
                        "0 0 32px rgba(46, 196, 182, 0.22)",
                        "0 0 0 rgba(46, 196, 182, 0)",
                      ],
                      transition: {
                        duration: 3.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }
                  : undefined
              }
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`interactive-card border ${plan.border} bg-[#121212] p-6`}
            >
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">{plan.name}</p>
              <p className="mb-1 text-sm text-zinc-400">{plan.caption}</p>
              <p className="font-heading text-3xl text-white">
                <span className="text-[#2EC4B6]">{plan.price}</span>
                <span className="text-sm text-zinc-500">{plan.suffix}</span>
              </p>
            </motion.div>
          ))}
        </motion.div>
        <motion.div variants={fadeUp}>
          <Link to="/pricing" className="btn-secondary text-sm">
            View Full Pricing <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

function FaqSection({ faqOpen, setFaqOpen }) {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <SectionHeading align="center" tag="Common Questions" title="FAQ" highlight="" />
        <motion.div
          className="space-y-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {FAQ.map((item, index) => (
            <motion.div
              key={item.q}
              variants={fadeUp}
              className="faq-panel border border-white/5 bg-[#121212]"
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
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FinalCtaSection({ onBookTrial }) {
  return (
    <section className="relative overflow-hidden bg-[#2EC4B6] px-6 py-24">
      <div className="stat-sheen pointer-events-none absolute inset-0 opacity-25" />
      <motion.div
        className="relative mx-auto max-w-4xl text-center"
        variants={scaleIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
      >
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
      </motion.div>
    </section>
  );
}

export default function Home({ onBookTrial }) {
  const [faqOpen, setFaqOpen] = useState(null);
  useScrollReveal({ threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  return (
    <div className="min-h-screen bg-obsidian">
      <SEO path="/" />
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

      <TrainingProgramsSection />

      <div className="section-divider" />

      <WhyUsSection />

      <div className="section-divider" />

      <TransformationsSection />

      <div className="section-divider" />

      <JourneySection />

      <div className="section-divider" />

      <TestimonialsSection />

      <div className="section-divider" />

      <PricingSection onBookTrial={onBookTrial} />

      <div className="section-divider" />

      <FaqSection faqOpen={faqOpen} setFaqOpen={setFaqOpen} />

      <div className="section-divider" />

      <FinalCtaSection onBookTrial={onBookTrial} />
    </div>
  );
}
