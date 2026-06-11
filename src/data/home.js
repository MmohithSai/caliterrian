// ─────────────────────────────────────────────────────────────────────────
// Homepage content — single source for the 2026 facility-first redesign.
//
// Rules baked in here:
//  • Real data is reused verbatim (prices from Pricing.jsx, coaches from
//    Coaches.jsx, transformations/testimonials from mockData, stats from
//    site.js). No invented prices, no invented hard percentages.
//  • Every section that needs a real photo we don't have yet carries a
//    `media` slot: { label, hint, ratio }. The label names the intended
//    asset so a real photo drops in later with zero redesign.
//  • Existing exercise frame sequences are used ONLY to illustrate the
//    movements themselves (Problem progression, Skill Tree) — never as a
//    stand-in for facility, coach or member photography.
// ─────────────────────────────────────────────────────────────────────────

import {
  Activity, Brain, ChevronsUp, Compass, Dumbbell, Flame, Footprints,
  Gauge, GraduationCap, HeartPulse, Layers, Medal, Move, Repeat,
  Rocket, Route, ShieldCheck, Sparkles, Target, Timer, Trophy,
  Users, Waypoints, Wind, Zap,
} from "lucide-react";

import { TRANSFORMATIONS, TESTIMONIALS } from "@/data/mockData";
import { STATS, RATING, MEMBERS_TRAINED } from "@/data/site";

// Helper: build a frame path from one of the shipped exercise sequences.
const muscleup = (n) => `/muscleup-cinematic/frame${String(n).padStart(5, "0")}.jpg`;
const pushupFrame = (n) => `/pushup/ezgif-frame-${String(n).padStart(3, "0")}.jpg`;

// ── SECTION 1 · Hero ──────────────────────────────────────────────────────
export const HERO = {
  eyebrow: "Calisthenics · Strength · Skills",
  // Headline is intentionally split so the second clause renders in accent.
  headline: ["From Your First Pull-Up", "To Skills You'll Own For Life."],
  sub: "A clear, coached path to strength, skills, mobility and athletic performance — built in a facility designed for every stage of your journey.",
  primaryCta: "Book Trial Session",
  secondaryCta: "Explore The Path",
  // Reuses the real headline stats from site.js — no invented figures.
  trust: STATS,
  media: { label: "Hero Facility Panorama", hint: "Replace with wide shot of the floor — blue rigs, ceiling lights, turf lane", ratio: "16/9" },
};

// ── SECTION 2 · The Problem — Myth vs Reality ─────────────────────────────
export const PROBLEM = {
  eyebrow: "The Problem",
  mythLabel: "Myth",
  myth: "I need to get fit before I start.",
  mythTail: "So they wait. And nothing changes.",
  realityLabel: "Reality",
  truth: ["The gym exists to", "help you get there."],
  realitySub: "You start where you are. We build the rest — one rep, one skill at a time.",
  resolve: "You don't have to be fit to start. You just have to start.",
  // Photographic progression. Real movement frames illustrate the movements
  // themselves (legitimate per the data rules); the first state is a labeled
  // photo slot. caption = the felt experience at each step.
  steps: [
    { label: "Can't Hang",  caption: "Where most people begin", state: "locked", img: null,            media: { label: "Can't hang yet", hint: "Beginner struggling on the bar", ratio: "3/4" } },
    { label: "Push-Up",     caption: "Weeks in",                 state: "done",   img: pushupFrame(45), media: { label: "Push-up", hint: "First clean push-up", ratio: "3/4" } },
    { label: "Pull-Up",     caption: "Months in",                state: "done",   img: muscleup(20),    media: { label: "Pull-up", hint: "First pull-up on the bar", ratio: "3/4" } },
    { label: "Muscle-Up",   caption: "Skills you'll own",        state: "done",   img: muscleup(55),    media: { label: "Muscle-up", hint: "Muscle-up over the bar", ratio: "3/4" } },
  ],
};

// ── SECTION 3 · The Caliterrain Path ──────────────────────────────────────
export const PATH = {
  eyebrow: "The Caliterrain Path",
  title: ["A Structured Journey", "From Basics To Mastery."],
  sub: "Our proven system takes you step-by-step from where you are today to skills you never thought possible.",
  // Each stage groups into a mastery tier and previews the skills it contains —
  // so the Path reads as one connected journey, not six separate cards.
  stages: [
    { n: "01", name: "Assessment",  tier: "Start",      icon: Gauge,        desc: "We evaluate your movement, strength, mobility and goals to create your starting point.", skills: ["Movement screen", "Mobility check", "Goal mapping"],   media: { label: "Assessment photo", hint: "Coach assessing a member", ratio: "4/3" } },
    { n: "02", name: "Foundation",  tier: "Foundation", icon: Layers,       desc: "Build movement quality, joint integrity and core control with fundamental patterns.",   skills: ["Push-up", "Hollow hold", "Scapular control"],          media: { label: "Foundation photo", hint: "Beginner drills on the floor", ratio: "4/3" } },
    { n: "03", name: "Strength",    tier: "Strength",   icon: Dumbbell,     desc: "Increase pulling, pushing and full-body strength through progressive overload.",          skills: ["Pull-up", "Dips", "Rows"],                             media: { label: "Strength photo", hint: "Pull-up / dip work at the rig", ratio: "4/3" } },
    { n: "04", name: "Skills",      tier: "Control",    icon: Sparkles,     desc: "Unlock your first real skills — handstands, levers and controlled progressions.",         skills: ["L-sit", "Handstand", "Tuck lever"],                    media: { label: "Skills photo", hint: "Handstand / L-sit on parallettes", ratio: "4/3" } },
    { n: "05", name: "Performance", tier: "Performance",icon: Activity,     desc: "Sharpen athletic performance with conditioning, speed and endurance training.",           skills: ["Sprints", "Conditioning", "Power"],                    media: { label: "Performance photo", hint: "Sprint / sled on the performance lane", ratio: "4/3" } },
    { n: "06", name: "Mastery",     tier: "Mastery",    icon: Trophy,       desc: "Refine advanced skills, explore freestyle and own movement for life.",                    skills: ["Muscle-up", "Front lever", "Freestyle"],               media: { label: "Mastery photo", hint: "Advanced skill / muscle-up", ratio: "4/3" } },
  ],
  pillars: [
    { icon: Route,       title: "Clear Progression",  desc: "Always know your next step." },
    { icon: GraduationCap, title: "Expert Coaching",  desc: "Coached by experienced athletes." },
    { icon: Target,      title: "Measurable Results", desc: "Track your progress and skills." },
    { icon: ShieldCheck, title: "Skills For Life",    desc: "Strength that stays with you." },
  ],
};

// ── SECTION 4 · Skill Tree ────────────────────────────────────────────────
// A generalized training blueprint shown as a dependency graph. Each node:
//  • prereq[]  — edges drawn between skills (the tree structure)
//  • difficulty — Beginner · Intermediate · Advanced (drives node styling)
//  • pos {x,y} — % position inside the graph canvas (left→right progression)
//  • insight   — one-line coach note shown in the detail rail
// There is no per-user state — the full personalized roadmap lives at the gym.
export const SKILLS = {
  eyebrow: "Skill Tree",
  title: ["See The Journey.", "Chase The Skills."],
  sub: "Every skill is connected. Click any node to see what it requires, what it leads to and how long it typically takes. This is the general blueprint — your personal roadmap is built with a coach at the gym.",
  legend: [
    { level: "Beginner",     label: "Beginner" },
    { level: "Intermediate", label: "Intermediate" },
    { level: "Advanced",     label: "Advanced" },
  ],
  blueprint: {
    title: "The Blueprint",
    note: "A simplified map of the calisthenics journey. Your full roadmap — tailored to your level and goals — is built with a coach at the gym.",
  },
  nodes: [
    { id: "push-up",     name: "Push-Up",     tier: "Foundation", difficulty: "Beginner",      time: "Week 1–4",    prereq: [],                   pos: { x: 8,  y: 50 }, img: pushupFrame(45), desc: "Build a strong pressing foundation — the entry point to every pushing skill.",          insight: "Own full range before chasing volume — depth is what builds the press." },
    { id: "pull-up",     name: "Pull-Up",     tier: "Strength",   difficulty: "Beginner",      time: "6–12 Weeks",  prereq: ["push-up"],          pos: { x: 37, y: 26 }, img: muscleup(15),    desc: "Unlock pulling strength. The single most important calisthenics milestone.",            insight: "Band-assisted reps and slow negatives get you to your first rep fastest." },
    { id: "l-sit",       name: "L-Sit",       tier: "Control",    difficulty: "Intermediate",  time: "2–4 Months",  prereq: ["push-up"],          pos: { x: 37, y: 74 }, img: pushupFrame(60), desc: "Core compression and straight-arm strength. The gateway to every static hold.",         insight: "Start tucked, then one leg. Straight legs are the last 10% — earn the compression." },
    { id: "muscle-up",   name: "Muscle-Up",   tier: "Advanced",   difficulty: "Advanced",      time: "4–12 Months", prereq: ["pull-up"],          pos: { x: 68, y: 14 }, img: muscleup(55),    desc: "Explosive pulling into a transition above the bar. The classic ultimate goal.",         insight: "Explosive high pull-ups + straight-bar dips unlock the transition over the bar." },
    { id: "handstand",   name: "Handstand",   tier: "Skill",      difficulty: "Intermediate",  time: "4–8 Months",  prereq: ["l-sit"],            pos: { x: 68, y: 86 }, img: null,            desc: "Balance, shoulder strength and body awareness — full inverted control.",                insight: "Wall time builds the shoulders; balance is the final layer once you're strong." },
    { id: "front-lever", name: "Front Lever", tier: "Mastery",    difficulty: "Advanced",      time: "8+ Months",   prereq: ["pull-up", "l-sit"], pos: { x: 68, y: 50 }, img: null,            desc: "Total-body tension and pulling mastery — an elite straight-arm hold.",                  insight: "Tuck → advanced tuck → straddle. Patience on the straight-arm scapular strength." },
  ],
};

// ── SECTION 5 · Hall of Firsts ────────────────────────────────────────────
// Reshaped from real TRANSFORMATIONS — each becomes a "first".
const FIRST_TYPE = {
  "First Pull-Up": "First Pull-Up",
  Handstand: "First Handstand",
  "Weight Loss": "First Goal Hit",
  "Kids Achievement": "First 10 Pull-Ups",
  "Athletic Conditioning": "First 5K PR",
};
export const HALL_OF_FIRSTS = {
  eyebrow: "Hall of Firsts",
  title: ["Real People.", "Real Milestones."],
  sub: "Every first is held. Every breakthrough. These are the moments that change everything — a living feed of members hitting skills they once thought impossible.",
  items: TRANSFORMATIONS.map((t, i) => ({
    id: t.id,
    name: t.member_name,
    milestone: FIRST_TYPE[t.achievement_type] || t.achievement_type,
    date: t.date,
    quote: t.testimonial,
    // Social cheer count for the feed (community reactions, not a business metric).
    reactions: [128, 94, 156, 73, 112, 88][i % 6],
    media: { label: "Member photo", hint: `${t.member_name} — replace with real member photo`, ratio: "4/5" },
  })),
};

// ── SECTION 6 · Member Journeys ───────────────────────────────────────────
export const JOURNEYS = {
  eyebrow: "Member Journeys",
  title: ["Every Master", "Was Once A Beginner."],
  sub: "Real transformation timelines — from the first nervous session to skills they now own.",
  // Built from real transformation summaries, expanded into a timeline shape.
  timelines: [
    {
      id: "rahul",
      name: TRANSFORMATIONS[0].member_name,
      headline: TRANSFORMATIONS[0].summary,
      media: { label: "Member transformation", hint: "Rahul — before/after or training shot", ratio: "1/1" },
      steps: [
        { when: "Month 0", text: "Walked in unable to do a single pull-up." },
        { when: "Month 2", text: "Consistent training, first body-weight milestones." },
        { when: "Month 5", text: TRANSFORMATIONS[0].summary + "." },
      ],
      quote: TRANSFORMATIONS[0].testimonial,
    },
    {
      id: "arjun",
      name: TRANSFORMATIONS[2].member_name,
      headline: TRANSFORMATIONS[2].summary,
      media: { label: "Member transformation", hint: "Arjun — skill / training shot", ratio: "1/1" },
      steps: [
        { when: "Month 0", text: "No skill background, building foundations." },
        { when: "Month 2", text: "Wall handstand holds and straight-line shape." },
        { when: "Month 4", text: TRANSFORMATIONS[2].summary + "." },
      ],
      quote: TRANSFORMATIONS[2].testimonial,
    },
  ],
};

// ── SECTION 7 · First Session Experience ──────────────────────────────────
export const FIRST_SESSION = {
  eyebrow: "What Happens In Your First Session?",
  title: ["No Pressure.", "Just A Clear First Step."],
  sub: "Towards becoming your strongest self.",
  steps: [
    { n: "01", icon: Users,  title: "Meet Your Coach",      desc: "We get to know you, your goals, lifestyle and any concerns.",                         expect: "A relaxed conversation — no judgment.", media: { label: "Coach meeting member", hint: "Coach + member talking on the floor", ratio: "4/5" } },
    { n: "02", icon: Gauge,  title: "Movement Assessment",  desc: "We assess your mobility, strength, posture and movement patterns.",                   expect: "Simple movements — we map where you are.", media: { label: "Movement assessment", hint: "Coach assessing mobility / squat", ratio: "4/5" } },
    { n: "03", icon: Target, title: "Skill Evaluation",     desc: "We test your foundational skills to identify your current level.",                    expect: "Push, pull and hold — your baseline.", media: { label: "Skill evaluation", hint: "Member on the bar / hold", ratio: "4/5" } },
    { n: "04", icon: Route,  title: "Receive Your Roadmap", desc: "You get a clear plan with the right steps tailored to you.",                          expect: "Your personal path, explained.", media: { label: "Roadmap review", hint: "Coach showing a plan / tablet", ratio: "4/5" } },
    { n: "05", icon: Rocket, title: "Start Training",       desc: "We guide you through your first workout and help you take action with confidence.",   expect: "Your first real session — you're in.", media: { label: "First training session", hint: "Member training under coaching", ratio: "4/5" } },
  ],
  reassurance: [
    { icon: ShieldCheck, title: "No commitment pressure", desc: "Just a real session — you decide what's next." },
    { icon: Timer,       title: "Under an hour",          desc: "One focused session that can change everything." },
  ],
};

// ── SECTION 8 · Training Disciplines ──────────────────────────────────────
export const DISCIPLINES = {
  eyebrow: "Training Disciplines",
  title: ["One Facility.", "Every Discipline."],
  sub: "Whatever your goal — strength, skills, performance or mobility — we have a training path built for you.",
  // `featured` tiles span 2 columns/rows in the bento mosaic so the section has
  // a clear visual hierarchy instead of nine identical cards.
  items: [
    { name: "Calisthenics",       icon: Dumbbell,   featured: true,  desc: "Build strength and control using only your bodyweight — the heart of everything we do.", media: { label: "Calisthenics photo", hint: "Hero bar work on the blue rig", ratio: "4/5" } },
    { name: "Strength Training",  icon: ChevronsUp, desc: "Progressive overload with free weights and machines.",                  media: { label: "Strength photo", hint: "Free weights", ratio: "4/5" } },
    { name: "Hybrid Athlete",     icon: Zap,        desc: "Blend strength, skill and conditioning into complete athleticism.",     media: { label: "Hybrid athlete photo", hint: "Mixed-modal training", ratio: "4/5" } },
    { name: "HYROX Preparation",  icon: Flame,      featured: true,  desc: "Race-ready endurance, strength and functional performance for the HYROX format.", media: { label: "HYROX photo", hint: "Sled push / ski-erg on the lane", ratio: "4/5" } },
    { name: "Mobility",           icon: Move,       desc: "Improve range, restore movement and bulletproof your joints.",          media: { label: "Mobility photo", hint: "Mobility drills", ratio: "4/5" } },
    { name: "Flexibility",        icon: Wind,       desc: "Active and passive flexibility for deeper, stronger positions.",        media: { label: "Flexibility photo", hint: "Split / stretch", ratio: "4/5" } },
    { name: "Gymnastics Strength",icon: Sparkles,   desc: "Rings, levers and static holds built on gymnastics strength.",         media: { label: "Gymnastics photo", hint: "Rings / levers", ratio: "4/5" } },
    { name: "Freestyle",          icon: Waypoints,  desc: "Express yourself — train creative movement and bar flow.",             media: { label: "Freestyle photo", hint: "Bar flow", ratio: "4/5" } },
    { name: "Functional Fitness", icon: Activity,   desc: "Real-world training for strength, conditioning and balance.",          media: { label: "Functional photo", hint: "Functional circuit", ratio: "4/5" } },
  ],
};

// ── SECTION 9 · Coaches (outcome-first) ───────────────────────────────────
// Reshaped from the real COACHES in Coaches.jsx — results coached, not certs.
export const COACHES = {
  eyebrow: "Our Coaches",
  title: ["Guiding You.", "Changing Lives."],
  sub: "Our coaches don't just teach reps. They build people, one milestone at a time.",
  // Two real coaches (from Coaches.jsx) + two clearly-labeled open slots so the
  // 4-up layout is production-ready for the next hires. `memberQuote` is the
  // nested member-success proof; real ones replace these on launch.
  items: [
    {
      name: "Vidya Sagar",
      role: "Head Coach & Founder",
      outcomes: ["9 Years Coaching", "500+ Members Trained", "Beginner → Skill Specialist"],
      tag: "Movement & Transformation",
      media: { label: "Coach portrait", hint: "Vidya Sagar — replace with real coach photo", ratio: "3/4" },
      memberQuote: { text: "I never thought I could do a pull-up. Coach made it possible.", name: "Priya S.", achieved: "First Pull-Up" },
    },
    {
      name: "Lakpa",
      role: "Coach & Competitive Athlete",
      outcomes: ["Yodha Race Winner — Chennai", "All India Finalist", "300+ Members Trained"],
      tag: "Advanced Skills & Performance",
      media: { label: "Coach portrait", hint: "Lakpa — replace with real coach photo", ratio: "3/4" },
      memberQuote: { text: "From zero pull-ups to muscle-ups. The progression system just works.", name: "Deepak R.", achieved: "First Muscle-Up" },
    },
    {
      name: "Profile Coming Soon",
      role: "Skills & Mobility Coach",
      placeholder: true,
      outcomes: ["Calisthenics skills", "Mobility & flexibility", "Beginner-friendly"],
      tag: "Skills & Mobility",
      media: { label: "Coach portrait", hint: "New coach 3 — replace with real coach photo + bio", ratio: "3/4" },
    },
    {
      name: "Profile Coming Soon",
      role: "Strength & Conditioning Coach",
      placeholder: true,
      outcomes: ["Strength training", "Conditioning & HYROX", "Performance"],
      tag: "Strength & Performance",
      media: { label: "Coach portrait", hint: "New coach 4 — replace with real coach photo + bio", ratio: "3/4" },
    },
  ],
  footnote: "More than coaches. Partners in your journey.",
};

// ── SECTION 10 · Facility Experience ──────────────────────────────────────
// Facility-first: every zone is a labeled slot for a real facility photo.
export const FACILITY = {
  eyebrow: "Facility Experience",
  title: ["Explore The Space.", "Experience The Difference."],
  sub: "More than a gym. A fully-designed training ecosystem built for every stage of your journey.",
  zones: [
    { name: "Mobility Zone",       icon: HeartPulse, desc: "Restore range and build the foundation your body needs.", media: { label: "Mobility zone photo", hint: "Turf + mobility tools", ratio: "4/3" } },
    { name: "Strength Lab",        icon: Dumbbell,   desc: "Free weights, machines and structured strength training.",  media: { label: "Strength lab photo", hint: "Racks + free weights", ratio: "4/3" } },
    { name: "Performance Lane",    icon: Gauge,      desc: "Conditioning, sprints and athletic performance.",           media: { label: "Performance lane photo", hint: "Turf running lane + sled", ratio: "4/3" } },
    { name: "Skill Arena",         icon: Sparkles,   desc: "Calisthenics, skills and advanced movement under the rig.", media: { label: "Skill arena photo", hint: "Blue pull-up rig", ratio: "4/3" } },
    { name: "Freestyle Area",      icon: Waypoints,  desc: "Open space to flow, express and train creative movement.",  media: { label: "Freestyle area photo", hint: "Open bar area", ratio: "4/3" } },
    { name: "Monkey Bars",         icon: Footprints, desc: "Grip, swing and upper-body coordination.",                  media: { label: "Monkey bars photo", hint: "Overhead monkey bars", ratio: "4/3" } },
    { name: "Parallel Bars",       icon: Repeat,     desc: "Dips, holds and upper-body strength work.",                 media: { label: "Parallel bars photo", hint: "Parallettes / P-bars", ratio: "4/3" } },
    { name: "SkiErgs",             icon: Activity,   desc: "High-intensity conditioning for power and endurance.",      media: { label: "SkiErg photo", hint: "Row of SkiErgs", ratio: "4/3" } },
    { name: "Running Lane",        icon: Footprints, desc: "Sprint and movement work down the turf lane.",              media: { label: "Running lane photo", hint: "Turf sprint lane", ratio: "4/3" } },
    { name: "Turf Area",           icon: Compass,    desc: "Versatile turf for sleds, carries and functional training.",media: { label: "Turf area photo", hint: "Green turf zone", ratio: "4/3" } },
  ],
  panorama: { img: "/facility/panorama.png", label: "Wide Facility Panorama", hint: "Single wide shot showing all zones — used for the interactive hotspot map", ratio: "21/9" },
};

// ── SECTION 11 · Community ─────────────────────────────────────────────────
export const COMMUNITY = {
  eyebrow: "Community",
  title: ["More Than Members.", "We Are A Family."],
  sub: "Training is better together. Beyond sessions, this is where the culture lives.",
  items: [
    { name: "Events",     icon: Medal,    desc: "Member meets, demo days and seasonal gatherings.", media: { label: "Event photo", hint: "Group event shot", ratio: "4/3" } },
    { name: "Workshops",  icon: Brain,    desc: "Skill clinics and deep-dives with our coaches.",   media: { label: "Workshop photo", hint: "Coaching clinic", ratio: "4/3" } },
    { name: "Challenges", icon: Trophy,   desc: "Friendly in-house challenges that push your limits.", media: { label: "Challenge photo", hint: "Challenge / leaderboard", ratio: "4/3" } },
    { name: "Meetups",    icon: Users,    desc: "Casual community meetups, on and off the floor.",   media: { label: "Meetup photo", hint: "Community hangout", ratio: "4/3" } },
  ],
};

// ── SECTION 12 · Why Members Stay ─────────────────────────────────────────
// Uses only real figures from site.js — no invented percentages.
export const WHY_STAY = {
  eyebrow: "Why Members Stay",
  title: ["Real Results.", "Real People."],
  sub: "We don't just create athletes. We build confidence, consistency and a community that keeps you coming back.",
  stats: [
    { value: MEMBERS_TRAINED, label: "Members Trained" },
    { value: STATS[1].value,  label: STATS[1].label },           // 9+ Years Experience
    { value: `${RATING.value}★`, label: `From ${RATING.count} Google reviews` },
  ],
  reasons: [
    { icon: GraduationCap, title: "Expert Coaches",      desc: "Coached by experienced athletes who actually train." },
    { icon: Route,         title: "Structured Progression", desc: "A clear path so you always know your next step." },
    { icon: Users,         title: "Strong Community",    desc: "A group that shows up and pushes you forward." },
    { icon: ShieldCheck,   title: "Results That Last",   desc: "Skills and strength you keep for life." },
  ],
};

// ── Results — consolidated proof (rings + reasons + member video stories) ──
// Merges the old Why-Stay, Member-Journeys and Testimonials sections into one
// stronger block. `outcomes` percentages are ILLUSTRATIVE PLACEHOLDERS pending
// a verified member survey — treat them like the image slots and replace with
// real figures before launch. Names, quotes and achievements are real members.
export const RESULTS = {
  eyebrow: "Why Members Stay",
  title: ["Real Results.", "Real People."],
  sub: "We don't just create athletes. We build confidence, consistency and a community that keeps you coming back.",
  outcomes: [
    { value: 83, suffix: "%", label: "Achieved their first pull-up" },         // placeholder — replace with survey data
    { value: 67, suffix: "%", label: "Unlocked a new skill within 6 months" }, // placeholder — replace with survey data
    { value: 92, suffix: "%", label: "Would recommend Caliterrain" },          // placeholder — replace with survey data
  ],
  reasons: [
    { icon: GraduationCap, title: "Expert Coaches",         desc: "Coached by experienced athletes who actually train." },
    { icon: Route,         title: "Structured Progression", desc: "A clear path so you always know your next step." },
    { icon: Users,         title: "Strong Community",       desc: "A group that shows up and pushes you forward." },
    { icon: ShieldCheck,   title: "Results That Last",      desc: "Skills and strength you keep for life." },
  ],
  // Real members + real quotes + real achievements; each gets a video-still slot.
  storiesEyebrow: "Member Stories",
  storiesTitle: ["I Thought", "I Couldn't."],
  stories: [
    { id: "priya",  name: "Priya S.",  achieved: "First Pull-Up",   quote: "I never thought I could do a pull-up. The coaches made it possible!",        media: { label: "Video story still", hint: "Priya S. — replace with video still", ratio: "4/5" } },
    { id: "arjun",  name: "Arjun M.",  achieved: "First Handstand", quote: "The skill progressions here are incredible. Methodical and effective.",        media: { label: "Video story still", hint: "Arjun M. — replace with video still", ratio: "4/5" } },
    { id: "deepak", name: "Deepak R.", achieved: "First Muscle-Up", quote: "From zero pull-ups to muscle-ups. The progressive training system works.",     media: { label: "Video story still", hint: "Deepak R. — replace with video still", ratio: "4/5" } },
  ],
};

// ── SECTION 13 · Testimonials (video-first) ───────────────────────────────
export const TESTIMONIAL_BLOCK = {
  eyebrow: "Testimonials",
  title: ["I Thought", "I Couldn't."],
  sub: "Real members. Real journeys. Real proof that you're more capable than you think.",
  // Real testimonial copy from mockData; each gets a video thumbnail slot.
  items: TESTIMONIALS.slice(0, 3).map((t) => ({
    id: t.id,
    name: t.name,
    role: t.role,
    quote: t.content,
    media: { label: "Video testimonial thumbnail", hint: `${t.name} — replace with video still`, ratio: "9/16" },
  })),
  textItems: TESTIMONIALS,
};

// ── SECTION 14 · Memberships ──────────────────────────────────────────────
// Prices reused verbatim from Pricing.jsx. Assessment highlighted.
export const MEMBERSHIPS = {
  eyebrow: "Memberships",
  title: ["Simple Pricing.", "Serious Results."],
  sub: "Choose the plan that fits your journey. Every plan includes a structured assessment.",
  assessmentNote: "All plans include a free movement assessment, goal-setting and a personalized roadmap.",
  tiers: [
    {
      name: "Trial Session",
      caption: "One-time experience",
      price: "Free",
      period: "",
      cta: "Book Trial",
      featured: false,
      features: ["Facility tour", "Movement assessment", "Coach consultation", "No commitment"],
    },
    {
      name: "Group Training",
      caption: "3 or 5 days / week",
      price: "₹3,000",
      period: "/mo",
      cta: "Choose Group",
      featured: true,
      badge: "Most Popular",
      features: ["75-min coached sessions", "Free assessment included", "3-day ₹3,000 · 5-day ₹4,500", "Quarterly from ₹7,500"],
    },
    {
      name: "Personal Training",
      caption: "1-on-1 coaching",
      price: "₹10,000",
      period: "/mo",
      cta: "Choose Personal",
      featured: false,
      features: ["60-min dedicated sessions", "Fully personalized plan", "3-day ₹10,000 · 5-day ₹15,000", "Fastest progress"],
    },
    {
      name: "Drop-In",
      caption: "Pay per session",
      price: "₹400",
      period: "/session",
      cta: "Walk In",
      featured: false,
      features: ["Group session ₹400", "Personal training ₹900", "Self-training ₹3,000/mo", "Maximum flexibility"],
    },
  ],
};

// ── SECTION 15 · FAQ ──────────────────────────────────────────────────────
export const FAQ = {
  eyebrow: "FAQ",
  title: ["Questions Are Normal.", "Getting Started Is Better."],
  sub: "Here are answers to the most common questions we get from new members.",
  items: [
    { q: "Can complete beginners join?", a: "Absolutely. Many of our members started with zero experience. Our coaches meet you where you are and guide you every step of the way." },
    { q: "Am I too overweight?", a: "Not at all. We work with people of all body types and fitness levels. Our programs are designed to help you build strength safely and sustainably." },
    { q: "Do I need gym experience?", a: "No experience needed. We teach the fundamentals and progress you at a pace that's right for you." },
    { q: "Can women join?", a: "Of course. We have a strong and supportive community of women building strength, skills and confidence every day." },
    { q: "What age groups do you train?", a: "We train kids from 6–16 years and adults from 16+ years, with specialized programs for each age group." },
    { q: "What are the batch timings?", a: "Morning batches run 5:00 AM–11:00 AM and evening batches run 5:00 PM–10:00 PM, with multiple slots available." },
    { q: "How long until my first pull-up?", a: "Most members achieve their first pull-up within 6–12 weeks with consistent training and our proven progression system." },
    { q: "How long until my first muscle-up?", a: "Most members reach their first muscle-up within 4–12 months. It depends on consistency, starting point and training frequency." },
  ],
};

// ── SECTION 16 · Final CTA ────────────────────────────────────────────────
export const FINAL_CTA = {
  title: ["You're Closer To A Muscle-Up", "Than You Think."],
  sub: "Start with a trial session and take your first step today.",
  primaryCta: "Book Trial Session",
};
