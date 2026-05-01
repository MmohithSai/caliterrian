import { useEffect, useState } from "react";
import { ChevronRight, Clock, Users, User, Gift } from "lucide-react";
import SEO from "@/components/SEO";
import SpinWheel from "@/components/SpinWheel";

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

const G3 = [{ duration: "Monthly", price: "3,000" }, { duration: "Quarterly", price: "7,500" }, { duration: "Half Yearly", price: "13,500" }];
const G5 = [{ duration: "Monthly", price: "4,500" }, { duration: "Quarterly", price: "12,000" }, { duration: "Half Yearly", price: "21,000" }];
const P3 = [{ duration: "Monthly", price: "10,000" }, { duration: "Quarterly", price: "25,500" }];
const P5 = [{ duration: "Monthly", price: "15,000" }, { duration: "Quarterly", price: "40,000" }];
const GM = ["5:00 AM - 6:30 AM", "6:30 AM - 8:00 AM", "8:00 AM - 9:30 AM", "9:30 AM - 11:00 AM"];
const GE = ["5:00 PM - 6:00 PM (Kids Only)", "6:00 PM - 7:00 PM (Kids & Adults)", "7:00 PM - 8:30 PM", "8:30 PM - 10:00 PM"];
const PM = ["6:00 AM - 7:00 AM", "7:00 AM - 8:00 AM", "8:00 AM - 9:00 AM", "9:00 AM - 10:00 AM"];
const PE = ["6:00 PM - 7:00 PM", "7:00 PM - 8:00 PM", "8:00 PM - 9:00 PM", "9:00 PM - 10:00 PM"];

function PriceCard({ plans, title, subtitle, icon: Icon, highlight }) {
  return (
    <div className={`bg-[#121212] border p-6 scroll-fade card-glow ${highlight ? "border-[#2EC4B6]/50" : "border-white/5"}`}>
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 flex items-center justify-center ${highlight ? "bg-[#2EC4B6]/20 border-[#2EC4B6]/40" : "bg-white/5 border-white/10"} border`}>
          <Icon className={`w-5 h-5 ${highlight ? "text-[#2EC4B6]" : "text-zinc-400"}`} />
        </div>
        <div>
          <h3 className="font-heading text-xl text-white tracking-wide">{title}</h3>
          <p className="text-zinc-500 text-xs uppercase tracking-wider">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-3">
        {plans.map((p, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
            <span className="text-zinc-400 text-sm">{p.duration}</span>
            <span className="font-heading text-2xl text-white tracking-wide"><span className="text-[#2EC4B6] text-base mr-1">₹</span>{p.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimingBlock({ title, icon: Icon, morning, evening }) {
  return (
    <div className="bg-[#121212] border border-white/5 p-6 scroll-fade">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-[#2EC4B6]/10 border border-[#2EC4B6]/30 flex items-center justify-center"><Icon className="w-5 h-5 text-[#2EC4B6]" /></div>
        <h3 className="font-heading text-xl text-white tracking-wide">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#2EC4B6] mb-3">Morning Batches</p>
          <div className="space-y-2">
            {morning.map((t, i) => (<div key={i} className="flex items-center gap-2 text-zinc-400 text-sm"><Clock className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" /> {t}</div>))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#2EC4B6] mb-3">Evening Batches</p>
          <div className="space-y-2">
            {evening.map((t, i) => (<div key={i} className="flex items-center gap-2 text-zinc-400 text-sm"><Clock className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" /><span className={t.includes("Kids") ? "text-[#2EC4B6] font-medium" : ""}>{t}</span></div>))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Pricing({ onBookTrial }) {
  const [wheelOpen, setWheelOpen] = useState(false);
  useScrollReveal();

  return (
    <div className="pt-24 min-h-screen bg-obsidian">
      <SEO title="Pricing & Schedule" description="Cali Terrain membership plans and batch timings. Group sessions from Rs 3000/month." />
      <div className="bg-[#0D0D0D] border-b border-white/5 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="section-tag mb-2">Investment in Yourself</p>
          <h1 className="font-heading text-6xl md:text-8xl text-white leading-none mb-4">MEMBERSHIP<br /><span className="text-[#2EC4B6]">PLANS</span></h1>
          <p className="text-zinc-400 text-base max-w-2xl leading-relaxed">Flexible pricing for every goal. Group sessions, personal training, and drop-in options.</p>
        </div>
      </div>

      {/* Group Sessions */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-10 scroll-fade">
          <p className="section-tag">Group Sessions</p>
          <h2 className="font-heading text-4xl sm:text-5xl text-white leading-none">GROUP TRAINING</h2>
          <p className="text-zinc-500 text-sm mt-2">75-minute sessions with expert coaching in a motivating group environment.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PriceCard plans={G3} title="3 DAYS / WEEK" subtitle="Mon, Wed, Fri" icon={Users} />
          <PriceCard plans={G5} title="5 DAYS / WEEK" subtitle="Mon - Fri" icon={Users} highlight />
        </div>
      </section>
      <div className="section-divider" />

      {/* Personal Training */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-10 scroll-fade">
          <p className="section-tag">Personal Training</p>
          <h2 className="font-heading text-4xl sm:text-5xl text-white leading-none">1-ON-1 COACHING</h2>
          <p className="text-zinc-500 text-sm mt-2">60-minute dedicated sessions with a personal coach.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PriceCard plans={P3} title="3 DAYS / WEEK" subtitle="Mon, Wed, Fri" icon={User} />
          <PriceCard plans={P5} title="5 DAYS / WEEK" subtitle="Mon - Fri" icon={User} highlight />
        </div>
      </section>
      <div className="section-divider" />

      {/* Other Packages */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-10 scroll-fade">
          <p className="section-tag">Flexible Options</p>
          <h2 className="font-heading text-4xl sm:text-5xl text-white leading-none">OTHER PACKAGES</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#121212] border border-white/5 p-6 text-center scroll-fade card-glow">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Per Day</p>
            <p className="text-zinc-400 text-sm mb-1">Group Session</p>
            <p className="font-heading text-3xl text-white"><span className="text-[#2EC4B6] text-lg mr-1">₹</span>400</p>
          </div>
          <div className="bg-[#121212] border border-white/5 p-6 text-center scroll-fade card-glow">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Per Day</p>
            <p className="text-zinc-400 text-sm mb-1">Personal Training</p>
            <p className="font-heading text-3xl text-white"><span className="text-[#2EC4B6] text-lg mr-1">₹</span>900</p>
          </div>
          <div className="bg-[#121212] border border-[#2EC4B6]/30 p-6 text-center scroll-fade card-glow">
            <p className="text-xs font-bold uppercase tracking-widest text-[#2EC4B6] mb-2">Self Training</p>
            <p className="text-zinc-400 text-sm mb-1">Monthly Access</p>
            <p className="font-heading text-3xl text-white"><span className="text-[#2EC4B6] text-lg mr-1">₹</span>3,000</p>
          </div>
        </div>
      </section>
      <div className="section-divider" />

      {/* Batch Timings */}
      <section className="bg-[#0D0D0D] py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 scroll-fade">
            <p className="section-tag">Schedule</p>
            <h2 className="font-heading text-4xl sm:text-5xl text-white leading-none">BATCH TIMINGS</h2>
            <p className="text-zinc-500 text-sm mt-2">Choose a batch that fits your routine.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TimingBlock title="GROUP SESSIONS" icon={Users} morning={GM} evening={GE} />
            <TimingBlock title="PERSONAL TRAINING" icon={User} morning={PM} evening={PE} />
          </div>
        </div>
      </section>

      {/* Spin Wheel */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto scroll-fade">
          <div className="relative bg-gradient-to-r from-[#2EC4B6]/10 via-[#121212] to-[#2EC4B6]/10 border border-[#2EC4B6]/40 p-8 sm:p-12 text-center overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2EC4B6] to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2EC4B6] to-transparent" />
            <Gift className="w-10 h-10 text-[#2EC4B6] mx-auto mb-4 animate-bounce" />
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#2EC4B6] mb-2">New Member Offer</p>
            <h2 className="font-heading text-4xl sm:text-5xl text-white leading-none mb-3">SPIN THE WHEEL<br /><span className="text-[#2EC4B6]">FOR DISCOUNTS</span></h2>
            <p className="text-zinc-400 text-sm max-w-lg mx-auto mb-6">Every new member gets to spin our lucky wheel for exclusive discounts!</p>
            <button onClick={() => setWheelOpen(true)} className="btn-primary text-sm mx-auto">Spin the Wheel Now! <ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center scroll-fade">
          <h2 className="font-heading text-4xl sm:text-5xl text-white leading-none mb-4">START WITH A <span className="text-[#2EC4B6]">FREE TRIAL</span></h2>
          <p className="text-zinc-400 text-sm mb-8 max-w-lg mx-auto">Not sure which plan fits you? Book a FREE trial session.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={onBookTrial} className="btn-primary text-sm">Book Free Trial <ChevronRight className="w-4 h-4" /></button>
            <a href="https://wa.me/918688458907?text=Hi%2C%20I%20want%20to%20know%20about%20Cali%20Terrain%20membership%20plans." target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">Ask on WhatsApp</a>
          </div>
        </div>
      </section>
      <SpinWheel open={wheelOpen} onClose={() => setWheelOpen(false)} />
    </div>
  );
}
