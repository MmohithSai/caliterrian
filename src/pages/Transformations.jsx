import { ChevronRight, Trophy, Zap, Users } from "lucide-react";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import CountUp from "@/components/reactbits/CountUp";
import DotGrid from "@/components/reactbits/DotGrid";
import PageBackdrop from "@/components/PageBackdrop";
import { UNLOCKS, FIRSTS } from "@/data/firsts";
import { MediaSlot } from "@/components/home/ui";
import { MemberStories } from "@/components/home/proof";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { MEMBERS_TRAINED } from "@/data/site";

export default function Transformations({ onBookTrial }) {
  useScrollReveal();
  // Photo-only firsts (no clip, not a video story) get their own grid.
  const photos = FIRSTS.filter((f) => !f.video);

  return (
    <div className="relative isolate pt-24 min-h-screen bg-obsidian">
      <SEO title="Hall of Fame: Member Skill Unlocks & Results" description="Muscle-ups, back levers, first pull-ups and weight-loss stories from real Cali Terrain members in Secunderabad, Hyderabad." path="/transformations" />
      <PageBackdrop />
      <PageHero
        eyebrow="Real Members"
        lines={["HALL OF", "FAME"]}
        ghost="PROOF"
        sub="Every skill here was unlocked on our floor. Muscle-ups, levers, first pull-ups and kilos gone."
      />

      <div className="bg-[#1F6FE0] py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8 text-center min-[420px]:grid-cols-3">
          {[{ icon: Trophy, value: MEMBERS_TRAINED, label: "Members Transformed" }, { icon: Zap, value: "90%", label: "Achieve First Pull-Up" }, { icon: Users, value: "15kg", label: "Avg Weight Lost" }].map(({ icon: Icon, value, label }, i) => {
            const num = parseInt(value, 10);
            const suffix = String(value).replace(String(num), "");
            return (
              <div key={i}>
                <Icon className="w-5 h-5 text-white/70 mx-auto mb-2" />
                <div className="font-heading text-3xl md:text-4xl text-white mb-1 tnum">
                  {/* React Bits CountUp: stats count in as the band scrolls into view */}
                  <CountUp to={num} duration={1.6} delay={i * 0.12} />
                  {suffix}
                </div>
                <div className="text-white/70 text-xs uppercase tracking-widest">{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <p className="section-tag">Latest Unlocks</p>
        <h2 className="font-heading text-3xl md:text-4xl text-white tracking-wide mb-8">Skills unlocked at our Secunderabad gym</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {UNLOCKS.map((u, i) => (
            <figure key={u.id} className={`group bg-[#131B25] border border-white/5 hover:border-[#2E8DFF]/30 overflow-hidden scroll-fade card-glow ${u.ratio === "16/9" ? "lg:col-span-2" : ""}`} style={{ transitionDelay: `${i * 0.1}s` }}>
              <MediaSlot media={{ img: u.img, label: u.milestone, ratio: u.ratio }} video={u.video} showLabel={false} />
              <figcaption className="p-6">
                <span className="inline-block bg-[#2E8DFF]/10 border border-[#2E8DFF]/30 text-[#2E8DFF] text-xs font-bold uppercase tracking-wider px-3 py-1 mb-3">{u.milestone}</span>
                <h3 className="font-heading text-2xl text-white tracking-wide">{u.name}</h3>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16">
        <MemberStories />
      </div>

      {photos.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <p className="section-tag">Hall of Firsts</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((f) => (
              <figure key={f.id} className="bg-[#131B25] border border-white/5 overflow-hidden scroll-fade">
                <img src={f.img} alt={`${f.name}: ${f.milestone}`} loading="lazy" decoding="async" className="aspect-[4/5] w-full object-cover" />
                <figcaption className="p-4">
                  <p className="text-[#2E8DFF] text-xs font-bold uppercase tracking-wider">{f.milestone}</p>
                  <p className="font-heading text-xl text-white tracking-wide">{f.name}</p>
                  {f.quote && <p className="mt-2 text-[#8A99AB] text-sm italic">“{f.quote}”</p>}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      <div className="relative overflow-hidden bg-[#0E141C] border-y border-white/5 py-20 px-6">
        {/* React Bits DotGrid: interactive blueprint dots behind the closing CTA */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <DotGrid dotSize={3} gap={28} baseColor="#1A2534" activeColor="#2E8DFF" proximity={140} />
        </div>
        <div className="relative max-w-4xl mx-auto text-center scroll-fade">
          <h2 className="font-heading text-5xl md:text-6xl text-white mb-4">YOUR STORY STARTS HERE</h2>
          <p className="text-[#9AA7B6] text-base max-w-lg mx-auto mb-8">Every transformation started with a single decision. Book your free trial.</p>
          <button onClick={onBookTrial} className="btn-primary text-sm">Start My Transformation <ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
