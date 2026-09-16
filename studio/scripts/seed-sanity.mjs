/**
 * Phase 2 — seed the Sanity dataset from the app's hardcoded content.
 *
 * Ports src/data/mockData.js + the page consts (Home/Programs/Coaches/Pricing)
 * and the contact details (Footer/Contact) into Sanity documents — zero manual
 * re-entry. Remote images are fetched once and uploaded as Sanity assets.
 *
 * Idempotent: every document uses a deterministic _id and createOrReplace, so
 * you can re-run it safely (it overwrites the seeded docs, leaving anything you
 * authored by hand untouched).
 *
 * Usage:
 *   cd studio
 *   # project id is read from .env (SANITY_STUDIO_PROJECT_ID); the write token
 *   # is NOT stored — pass it at run time:
 *   SANITY_WRITE_TOKEN=sk... npm run seed
 *
 * Get a write token at: https://www.sanity.io/manage → your project → API →
 * Tokens → "Add API token" → Editor.
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── env ──────────────────────────────────────────────────────────────────────
// Read studio/.env without a dotenv dependency; process.env still wins.
function loadEnv() {
  const env = { ...process.env };
  try {
    const raw = readFileSync(join(__dirname, "..", ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && env[m[1]] === undefined) {
        env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* no .env — rely on process.env */
  }
  return env;
}

const env = loadEnv();
const projectId =
  env.SANITY_STUDIO_PROJECT_ID || env.SANITY_PROJECT_ID || env.SANITY_STUDIO_API_PROJECT_ID;
const dataset = env.SANITY_STUDIO_DATASET || env.SANITY_DATASET || "production";
const token = env.SANITY_WRITE_TOKEN || env.SANITY_AUTH_TOKEN || env.SANITY_API_TOKEN;

if (!projectId) {
  console.error(
    "✗ Missing project id. Set SANITY_STUDIO_PROJECT_ID in studio/.env " +
      "(run `npx sanity init --env` first)."
  );
  process.exit(1);
}
if (!token) {
  console.error(
    "✗ Missing write token. Run with:  SANITY_WRITE_TOKEN=sk... npm run seed\n" +
      "  Create one at https://www.sanity.io/manage → project → API → Tokens (Editor)."
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-01-01",
  useCdn: false,
});

// ── helpers ───────────────────────────────────────────────────────────────────
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

// Zero-padded, lexicographically sortable ranks for orderable lists. These sort
// in seed order and sit before anything later reordered by drag-and-drop.
const rank = (i) => String(i + 1).padStart(6, "0");

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// "March 2025" → "2025-03-01"; passes through ISO dates unchanged.
function toDate(str) {
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  const months = {
    january: "01", february: "02", march: "03", april: "04", may: "05", june: "06",
    july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
  };
  const m = str.toLowerCase().match(/([a-z]+)\s+(\d{4})/);
  if (m && months[m[1]]) return `${m[2]}-${months[m[1]]}-01`;
  return undefined;
}

// Minimal Markdown → Portable Text. Handles ##/### headings, "- " bullets and
// "1." numbered lists, and paragraphs — enough for the seeded blog content.
function markdownToPortableText(md) {
  const blocks = [];
  const span = (text) => ({ _type: "span", _key: key(), text, marks: [] });
  for (const rawLine of md.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    let style = "normal";
    let listItem;
    let text = line;
    if (line.startsWith("### ")) { style = "h3"; text = line.slice(4); }
    else if (line.startsWith("## ")) { style = "h2"; text = line.slice(3); }
    else if (line.startsWith("# ")) { style = "h1"; text = line.slice(2); }
    else if (line.startsWith("- ")) { listItem = "bullet"; text = line.slice(2); }
    else {
      const num = line.match(/^\d+\.\s+(.*)$/);
      if (num) { listItem = "number"; text = num[1]; }
    }
    const block = {
      _type: "block",
      _key: key(),
      style,
      markDefs: [],
      children: [span(text)],
    };
    if (listItem) { block.listItem = listItem; block.level = 1; }
    blocks.push(block);
  }
  return blocks;
}

// Upload remote images once; cache by URL so shared images aren't re-fetched.
const assetCache = new Map();
async function uploadImage(url, label) {
  if (!url) return undefined;
  if (assetCache.has(url)) return assetCache.get(url);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const filename = (label ? slugify(label) : "image") + ".jpg";
    const asset = await client.assets.upload("image", buf, { filename });
    const ref = { _type: "image", asset: { _type: "reference", _ref: asset._id } };
    assetCache.set(url, ref);
    process.stdout.write(`  ↑ ${label || url}\n`);
    return ref;
  } catch (err) {
    console.warn(`  ! image skipped (${label || url}): ${err.message}`);
    assetCache.set(url, undefined);
    return undefined;
  }
}

// ── source data (mirrors src/) ─────────────────────────────────────────────────
const SITE = {
  gymName: "Cali Terrain",
  tagline: "Master your body. Redefine your limits.",
  phone: "+918688458907",
  whatsapp: "918688458907",
  address:
    "SS Complex, 156/2, Sikh Rd, near DPS School, Diamond Point, Radha Swamy Colony, Bowenpally, Secunderabad, Telangana 500009",
  googleRating: 4.9,
  socialLinks: [
    { platform: "whatsapp", url: "https://wa.me/918688458907" },
    { platform: "instagram", url: "https://instagram.com/caliterrain" },
  ],
};

const STATS = [
  { value: "500+", label: "Members Trained" },
  { value: "9+", label: "Years Experience" },
  { value: "12", label: "Training Programs" },
  { value: "4.9", label: "Google Rating" },
];

const WHY_US = [
  { icon: "Shield", title: "Calisthenics-Only Gym", desc: "Dedicated bodyweight training facility, not a generic gym." },
  { icon: "Users", title: "Expert Coaching", desc: "Certified coaches specializing in calisthenics and progressive training." },
  { icon: "Target", title: "Structured Programs", desc: "12 programs designed for every goal from beginners to advanced athletes." },
  { icon: "Trophy", title: "Proven Results", desc: "500+ members transformed. Real results backed by real training." },
  { icon: "Heart", title: "Community Driven", desc: "Train with a motivated group that pushes you to be your best." },
  { icon: "Zap", title: "Kids Programs", desc: "Specialized kids calisthenics classes building fitness from an early age." },
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

const SCHEDULE = {
  groupMorning: ["5:00 AM - 6:30 AM", "6:30 AM - 8:00 AM", "8:00 AM - 9:30 AM", "9:30 AM - 11:00 AM"],
  groupEvening: ["5:00 PM - 6:00 PM (Kids Only)", "6:00 PM - 7:00 PM (Kids & Adults)", "7:00 PM - 8:30 PM", "8:30 PM - 10:00 PM"],
  personalMorning: ["6:00 AM - 7:00 AM", "7:00 AM - 8:00 AM", "8:00 AM - 9:00 AM", "9:00 AM - 10:00 AM"],
  personalEvening: ["6:00 PM - 7:00 PM", "7:00 PM - 8:00 PM", "8:00 PM - 9:00 PM", "9:00 PM - 10:00 PM"],
};

const price = (s) => Number(String(s).replace(/,/g, ""));
const PLANS = [
  { name: "Group — 3 Days/Week", category: "group", subtitle: "Mon, Wed, Fri", highlight: false,
    tiers: [{ duration: "Monthly", price: "3,000" }, { duration: "Quarterly", price: "7,500" }, { duration: "Half Yearly", price: "13,500" }] },
  { name: "Group — 5 Days/Week", category: "group", subtitle: "Mon - Fri", highlight: true,
    tiers: [{ duration: "Monthly", price: "4,500" }, { duration: "Quarterly", price: "12,000" }, { duration: "Half Yearly", price: "21,000" }] },
  { name: "Personal — 3 Days/Week", category: "personal", subtitle: "Mon, Wed, Fri", highlight: false,
    tiers: [{ duration: "Monthly", price: "10,000" }, { duration: "Quarterly", price: "25,500" }] },
  { name: "Personal — 5 Days/Week", category: "personal", subtitle: "Mon - Fri", highlight: true,
    tiers: [{ duration: "Monthly", price: "15,000" }, { duration: "Quarterly", price: "40,000" }] },
];

const PROGRAMS = [
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

// Programs highlighted on the home page (mirrors Home.jsx PROGRAMS).
const FEATURED_PROGRAM_IDS = [
  "adult-calisthenics", "kids-calisthenics", "weight-loss",
  "bodyweight-strength", "functional-fitness", "handstand-skills",
];

const COACHES = [
  { name: "Vidya Sagar", role: "Head Coach & Founder", bio: "With 9 years of experience in fitness and calisthenics, Coach Vidya Sagar founded Cali Terrain to bring world-class bodyweight training to Secunderabad.", specialties: ["Skills Progress Specialist", "Kids Calisthenics", "Beginner Transformations", "Weight Loss"], certifications: ["Personal Training Certification", "Special Population Certification", "Kids Fitness Instructor"], philosophy: "Calisthenics is not just exercise — it's building a relationship with your own body.", experience: "9 Years", members: "500+ Trained", image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=600&q=80" },
  { name: "Lakpa", role: "Coach & Competitive Athlete", bio: "Coach Lakpa is a champion-level calisthenics athlete. A Yodha Race winner in Chennai and All India Finalist, he brings competitive edge to his coaching.", specialties: ["Competitive Calisthenics", "Advanced Skill Training", "Strength & Conditioning", "Athletic Performance"], certifications: ["Yodha Race Winner — Chennai", "All India Finalist", "Calisthenics Strength Coach"], philosophy: "Strength, discipline, results. The bar doesn't care about your excuses. Show up and put in the work.", experience: "5+ Years", members: "300+ Trained", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80" },
];

const TESTIMONIALS = [
  { id: 1, name: "Arun K.", role: "Member - 1 Year", content: "Best decision I made for my fitness. The coaching here is world-class.", rating: 5 },
  { id: 2, name: "Meena S.", role: "Member - 6 Months", content: "My kids love coming here. The kids program is structured and fun.", rating: 5 },
  { id: 3, name: "Ravi T.", role: "Member - 8 Months", content: "I've tried every gym in Secunderabad. Nothing compares to Cali Terrain.", rating: 5 },
  { id: 4, name: "Lakshmi P.", role: "Member - 3 Months", content: "As a complete beginner, I was nervous. The coaches made me feel welcome from day one.", rating: 5 },
  { id: 5, name: "Deepak R.", role: "Member - 1.5 Years", content: "From zero pull-ups to muscle-ups. The progressive training system works.", rating: 5 },
  { id: 6, name: "Ananya G.", role: "Member - 4 Months", content: "Lost 8kg in 4 months. The combination of training and nutrition guidance is perfect.", rating: 5 },
];

const TRANSFORMATIONS = [
  { id: 1, member_name: "Rahul K.", achievement_type: "Weight Loss", summary: "Lost 18kg in 5 months with calisthenics", testimonial: "Cali Terrain changed my life. I went from 95kg to 77kg and gained real strength.", date: "March 2025" },
  { id: 2, member_name: "Priya S.", achievement_type: "First Pull-Up", summary: "Achieved first pull-up after 8 weeks of training", testimonial: "I never thought I could do a pull-up. The coaches made it possible!", date: "January 2025" },
  { id: 3, member_name: "Arjun M.", achievement_type: "Handstand", summary: "30-second freestanding handstand after 4 months", testimonial: "The skill progressions here are incredible. Methodical and effective.", date: "February 2025" },
  { id: 4, member_name: "Sneha R.", achievement_type: "Weight Loss", summary: "Lost 12kg and gained visible muscle definition", testimonial: "Better than any gym I've been to. The community keeps you motivated.", date: "April 2025" },
  { id: 5, member_name: "Kiran D.", achievement_type: "Kids Achievement", summary: "12-year-old achieved 10 clean pull-ups", testimonial: "My son's confidence has skyrocketed since joining Cali Terrain.", date: "December 2024" },
  { id: 6, member_name: "Vikram P.", achievement_type: "Athletic Conditioning", summary: "Improved 5K time by 4 minutes with conditioning program", testimonial: "The functional fitness program is next level.", date: "November 2024" },
];

const GALLERY = [
  { id: 1, url: "https://images.unsplash.com/photo-1622302802228-c74d3592546c?w=600&q=80", caption: "Training Session", category: "training" },
  { id: 2, url: "https://images.unsplash.com/photo-1626807020058-30eb4ef93c84?w=600&q=80", caption: "Group Workout", category: "group" },
  { id: 3, url: "https://images.unsplash.com/photo-1623092350739-4635ce84d47c?w=600&q=80", caption: "Handstand Practice", category: "skills" },
  { id: 4, url: "https://images.unsplash.com/photo-1642267221102-15e7a4c39cd1?w=600&q=80", caption: "Strength Training", category: "training" },
  { id: 5, url: "https://images.unsplash.com/photo-1710746904729-f3ad9f682bb9?w=600&q=80", caption: "Beginner Session", category: "training" },
  { id: 6, url: "https://images.unsplash.com/photo-1758520705368-bbd8830dda35?w=600&q=80", caption: "Weight Loss Program", category: "transformation" },
  { id: 7, url: "https://images.unsplash.com/photo-1762769334319-e4b5124d8204?w=600&q=80", caption: "Mobility Work", category: "training" },
  { id: 8, url: "https://images.unsplash.com/photo-1772206605293-3fadeaa944e1?w=600&q=80", caption: "Functional Fitness", category: "group" },
  { id: 9, url: "https://images.unsplash.com/photo-1761039807514-292d7d33059f?w=600&q=80", caption: "Kids Training", category: "kids" },
  { id: 10, url: "https://images.pexels.com/photos/3912944/pexels-photo-3912944.jpeg?auto=compress&cs=tinysrgb&w=600", caption: "Personal Coaching", category: "training" },
  { id: 11, url: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=600", caption: "Facility", category: "facility" },
  { id: 12, url: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600", caption: "Workshop Day", category: "workshop" },
];

const BLOG_POSTS = [
  { id: 1, slug: "calisthenics-for-beginners", title: "CALISTHENICS FOR BEGINNERS: WHERE TO START", category: "Education", excerpt: "A complete guide to starting your calisthenics journey from absolute zero.", cover_image: "https://images.unsplash.com/photo-1622302802228-c74d3592546c?w=800&q=80", created_at: "2025-03-15", content: "## What is Calisthenics?\n\nCalisthenics is bodyweight training — using your own body as resistance to build strength, flexibility and control.\n\n## Where to Start\n\n### Step 1: Master the Basics\n- Push-ups (start with knee push-ups)\n- Squats (bodyweight squats)\n- Rows (inverted rows on a bar)\n- Dead hangs (grip strength)\n\n### Step 2: Build Consistency\nStart with 3 sessions per week. Focus on form, not reps.\n\n### Step 3: Progressive Overload\nIncrease difficulty gradually. From knee push-ups to full push-ups to diamond push-ups.\n\n## Why Cali Terrain?\nOur beginner program is specifically designed to take you from zero fitness to a strong, confident athlete." },
  { id: 2, slug: "benefits-of-pull-ups", title: "5 REASONS WHY PULL-UPS ARE THE KING OF EXERCISES", category: "Training Tips", excerpt: "Why the pull-up is the single most important exercise you should master.", cover_image: "https://images.unsplash.com/photo-1642267221102-15e7a4c39cd1?w=800&q=80", created_at: "2025-02-20", content: "## The Pull-Up: King of Upper Body\n\n1. Builds the entire back, biceps and core simultaneously\n2. Develops real-world grip strength\n3. Improves posture and shoulder health\n4. Scales from beginner to advanced\n5. Requires zero equipment (just a bar)\n\n## How to Get Your First Pull-Up\n\nMost beginners at Cali Terrain achieve their first pull-up in 6-10 weeks following our structured program." },
  { id: 3, slug: "kids-calisthenics-benefits", title: "WHY EVERY CHILD SHOULD TRAIN CALISTHENICS", category: "Kids Fitness", excerpt: "How calisthenics builds coordination, confidence and athletic ability in children.", cover_image: "https://images.unsplash.com/photo-1761039807514-292d7d33059f?w=800&q=80", created_at: "2025-01-10", content: "## Benefits for Children\n\n### Physical Development\n- Coordination and body awareness\n- Bone density and joint health\n- Cardiovascular fitness\n\n### Mental Development\n- Discipline and focus\n- Confidence from achieving goals\n- Social skills from group training\n\n## Our Kids Program\nClasses for ages 6-16 at Cali Terrain, Bowenpally." },
];

// About page — no source in the app yet; seed sensible starter copy.
const ABOUT = {
  headline: "Built for the Calisthenics Athlete",
  mission:
    "To make world-class bodyweight training accessible to everyone in Secunderabad — from complete beginners to competitive athletes.",
  vision:
    "A community where strength, discipline and movement mastery transform how people relate to their own bodies.",
  foundedYear: 2016,
  values: [
    { title: "Mastery over machines", description: "We build real strength and control using only the body — no shortcuts." },
    { title: "Progress for everyone", description: "Structured progressions meet every member where they are." },
    { title: "Community accountability", description: "We train together and push each other to show up." },
  ],
  story:
    "Cali Terrain was founded to bring dedicated calisthenics coaching to Secunderabad. What began as a small bar setup has grown into a full bodyweight-training facility with 500+ members transformed across 12 structured programs.",
};

// ── seed routines ──────────────────────────────────────────────────────────────
async function seedPrograms() {
  console.log("• programs");
  for (let i = 0; i < PROGRAMS.length; i++) {
    const p = PROGRAMS[i];
    const image = await uploadImage(p.image, p.title);
    await client.createOrReplace({
      _id: `program-${p.id}`,
      _type: "program",
      orderRank: rank(i),
      title: p.title,
      slug: { _type: "slug", current: p.id },
      icon: p.emoji,
      description: p.description,
      benefits: p.benefits,
      level: p.level,
      ageGroup: p.ageGroup,
      outcome: p.outcome,
      ...(image ? { image } : {}),
    });
  }
}

async function seedTrainers() {
  console.log("• trainers");
  for (let i = 0; i < COACHES.length; i++) {
    const c = COACHES[i];
    const image = await uploadImage(c.image, c.name);
    await client.createOrReplace({
      _id: `trainer-${slugify(c.name)}`,
      _type: "trainer",
      orderRank: rank(i),
      name: c.name,
      role: c.role,
      bio: c.bio,
      philosophy: c.philosophy,
      specialties: c.specialties,
      certifications: c.certifications,
      experience: c.experience,
      membersTrained: c.members.replace(/\s*Trained$/i, ""),
      ...(image ? { image } : {}),
    });
  }
}

async function seedPlans() {
  console.log("• membership plans");
  for (let i = 0; i < PLANS.length; i++) {
    const pl = PLANS[i];
    await client.createOrReplace({
      _id: `plan-${slugify(pl.name)}`,
      _type: "membershipPlan",
      orderRank: rank(i),
      name: pl.name,
      category: pl.category,
      subtitle: pl.subtitle,
      highlight: pl.highlight,
      tiers: pl.tiers.map((t) => ({
        _type: "planTier",
        _key: key(),
        duration: t.duration,
        price: price(t.price),
        currency: "₹",
      })),
    });
  }
}

async function seedTestimonials() {
  console.log("• testimonials");
  for (let i = 0; i < TESTIMONIALS.length; i++) {
    const t = TESTIMONIALS[i];
    await client.createOrReplace({
      _id: `testimonial-${t.id}`,
      _type: "testimonial",
      orderRank: rank(i),
      name: t.name,
      role: t.role,
      content: t.content,
      rating: t.rating,
      featured: i < 3,
    });
  }
}

async function seedSuccessStories() {
  console.log("• success stories");
  for (let i = 0; i < TRANSFORMATIONS.length; i++) {
    const s = TRANSFORMATIONS[i];
    await client.createOrReplace({
      _id: `success-${s.id}`,
      _type: "successStory",
      memberName: s.member_name,
      achievementType: s.achievement_type,
      summary: s.summary,
      testimonial: s.testimonial,
      date: toDate(s.date),
      featured: i < 3,
    });
  }
}

async function seedFaqs() {
  console.log("• faqs");
  for (let i = 0; i < FAQ.length; i++) {
    const f = FAQ[i];
    await client.createOrReplace({
      _id: `faq-${i + 1}`,
      _type: "faq",
      orderRank: rank(i),
      question: f.q,
      answer: f.a,
    });
  }
}

async function seedGallery() {
  console.log("• gallery");
  for (let i = 0; i < GALLERY.length; i++) {
    const g = GALLERY[i];
    const image = await uploadImage(g.url, g.caption);
    if (!image) continue; // image is required on this type
    await client.createOrReplace({
      _id: `gallery-${g.id}`,
      _type: "galleryImage",
      orderRank: rank(i),
      image,
      caption: g.caption,
      category: g.category,
    });
  }
}

async function seedBlog() {
  console.log("• blog posts");
  for (const b of BLOG_POSTS) {
    const coverImage = await uploadImage(b.cover_image, b.title);
    await client.createOrReplace({
      _id: `post-${b.slug}`,
      _type: "blogPost",
      title: b.title,
      slug: { _type: "slug", current: b.slug },
      category: b.category,
      excerpt: b.excerpt,
      publishedAt: new Date(b.created_at).toISOString(),
      body: markdownToPortableText(b.content),
      ...(coverImage ? { coverImage } : {}),
    });
  }
}

async function seedSingletons() {
  console.log("• site settings");
  await client.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    gymName: SITE.gymName,
    tagline: SITE.tagline,
    phone: SITE.phone,
    whatsapp: SITE.whatsapp,
    address: SITE.address,
    googleRating: SITE.googleRating,
    socialLinks: SITE.socialLinks.map((s) => ({ _type: "socialLink", _key: key(), ...s })),
  });

  console.log("• home page");
  await client.createOrReplace({
    _id: "homePage",
    _type: "homePage",
    heroHeadline: SITE.tagline,
    heroSubtext: "Premium calisthenics & bodyweight training in Bowenpally, Secunderabad.",
    stats: STATS.map((s) => ({ _type: "stat", _key: key(), ...s })),
    whyUs: WHY_US.map((w) => ({ _type: "whyUsItem", _key: key(), title: w.title, description: w.desc, icon: w.icon })),
    journeySteps: JOURNEY_STEPS.map((j) => ({ _type: "journeyStep", _key: key(), step: j.num, title: j.title, description: j.desc })),
    featuredPrograms: FEATURED_PROGRAM_IDS.map((id) => ({ _type: "reference", _key: key(), _ref: `program-${id}` })),
  });

  console.log("• schedule settings");
  await client.createOrReplace({ _id: "scheduleSettings", _type: "scheduleSettings", ...SCHEDULE });

  console.log("• about page");
  await client.createOrReplace({
    _id: "aboutPage",
    _type: "aboutPage",
    headline: ABOUT.headline,
    mission: ABOUT.mission,
    vision: ABOUT.vision,
    foundedYear: ABOUT.foundedYear,
    values: ABOUT.values.map((v) => ({ _type: "valueItem", _key: key(), ...v })),
    story: [
      { _type: "block", _key: key(), style: "normal", markDefs: [], children: [{ _type: "span", _key: key(), text: ABOUT.story, marks: [] }] },
    ],
  });
}

// ── run ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Seeding "${dataset}" on project ${projectId}…\n`);
  // Programs first — homePage.featuredPrograms references them.
  await seedPrograms();
  await seedTrainers();
  await seedPlans();
  await seedTestimonials();
  await seedSuccessStories();
  await seedFaqs();
  await seedGallery();
  await seedBlog();
  await seedSingletons();
  console.log("\n✓ Seed complete.");
}

main().catch((err) => {
  console.error("\n✗ Seed failed:", err.message);
  process.exit(1);
});
