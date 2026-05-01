import { useState, useEffect } from "react";
import { MapPin, Phone, ChevronRight, Send } from "lucide-react";
import { InstagramIcon as Instagram } from "@/components/icons";
import { toast } from "sonner";
import SEO from "@/components/SEO";

const WA_LINK = "https://wa.me/918688458907?text=Hi%2C%20I%20would%20like%20to%20know%20more%20about%20Cali%20Terrain.";
const PROGRAMS = ["Adult Calisthenics", "Kids Calisthenics", "Weight Loss", "Bodyweight Strength", "Functional Fitness", "Mobility & Flexibility", "Beginner Program", "Handstand & Skill Training", "Personal Coaching", "Group Training", "Other"];

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

export default function Contact({ onBookTrial }) {
  const [form, setForm] = useState({ name: "", phone: "", age: "", fitness_goal: "", interested_program: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  useScrollReveal();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) { toast.error("Please fill your name and phone"); return; }
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Message sent! We'll contact you shortly.");
      setForm({ name: "", phone: "", age: "", fitness_goal: "", interested_program: "", message: "" });
      setSubmitting(false);
    }, 800);
  };

  return (
    <div className="pt-24 min-h-screen bg-obsidian">
      <SEO title="Contact Us" description="Contact Cali Terrain calisthenics gym at Bowenpally, Secunderabad. Call 8688458907." />
      <div className="bg-[#0D0D0D] border-b border-white/5 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="section-tag mb-2">Get In Touch</p>
          <h1 className="font-heading text-6xl md:text-8xl text-white leading-none mb-4">CONTACT<br /><span className="text-[#2EC4B6]">US</span></h1>
          <p className="text-zinc-400 text-base max-w-2xl">Have questions? Want to book a trial? We're here to help.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="scroll-fade">
            <h2 className="font-heading text-3xl text-white tracking-wide mb-8">FIND US</h2>
            <div className="flex flex-col gap-4 mb-10">
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-[#25D366]/10 border border-[#25D366]/30 hover:border-[#25D366] p-4 transition-colors duration-200">
                <div className="w-10 h-10 bg-[#25D366] flex items-center justify-center flex-shrink-0"><ChevronRight className="w-5 h-5 text-white" /></div>
                <div><p className="text-white font-bold text-sm">Chat on WhatsApp</p><p className="text-zinc-400 text-xs">Fastest response — we reply within minutes</p></div>
              </a>
              <a href="tel:+918688458907" className="flex items-center gap-4 bg-[#2EC4B6]/10 border border-[#2EC4B6]/30 hover:border-[#2EC4B6] p-4 transition-colors duration-200">
                <div className="w-10 h-10 bg-[#2EC4B6] flex items-center justify-center flex-shrink-0"><Phone className="w-5 h-5 text-white" /></div>
                <div><p className="text-white font-bold text-sm">+91 86884 58907</p><p className="text-zinc-400 text-xs">Call us directly during training hours</p></div>
              </a>
              <a href="https://instagram.com/caliterrain" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 border border-white/10 hover:border-white/30 p-4 transition-colors duration-200" style={{ background: "linear-gradient(135deg, rgba(240,148,51,0.1), rgba(188,24,136,0.1))" }}>
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}><Instagram className="w-5 h-5 text-white" /></div>
                <div><p className="text-white font-bold text-sm">@caliterrain</p><p className="text-zinc-400 text-xs">Follow for daily training content</p></div>
              </a>
            </div>

            <div className="flex gap-3 mb-10 bg-[#121212] border border-white/5 p-5">
              <MapPin className="w-5 h-5 text-[#2EC4B6] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-bold text-sm mb-1">Cali Terrain</p>
                <p className="text-zinc-400 text-sm leading-relaxed">SS Complex, 156/2, Sikh Rd,<br />near DPS School, Diamond Point,<br />Radha Swamy Colony, Bowenpally,<br />Secunderabad, Telangana 500009</p>
              </div>
            </div>

            <button onClick={onBookTrial} className="btn-primary text-sm w-full justify-center">Book Free Trial <ChevronRight className="w-4 h-4" /></button>

            <div className="mt-8 border border-white/10 overflow-hidden">
              <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15223.636890171589!2d78.48165189088192!3d17.46405843617763!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9ba4c0920139%3A0x802664c3d60b7e12!2sCali%20Terrain!5e0!3m2!1sen!2sin!4v1772995355729!5m2!1sen!2sin" width="100%" height="280" style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Cali Terrain Location" />
            </div>
          </div>

          {/* Contact Form */}
          <div className="scroll-fade scroll-fade-delay-2">
            <h2 className="font-heading text-3xl text-white tracking-wide mb-8">SEND US A MESSAGE</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5 block">Name *</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" className="w-full bg-[#1A1A1A] border border-white/10 focus:border-[#2EC4B6] text-white px-4 py-3 text-sm outline-none placeholder-zinc-600 transition-colors duration-200" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5 block">Phone *</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="Your mobile number" className="w-full bg-[#1A1A1A] border border-white/10 focus:border-[#2EC4B6] text-white px-4 py-3 text-sm outline-none placeholder-zinc-600 transition-colors duration-200" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5 block">Age</label>
                <input type="text" name="age" value={form.age} onChange={handleChange} placeholder="Your age" className="w-full bg-[#1A1A1A] border border-white/10 focus:border-[#2EC4B6] text-white px-4 py-3 text-sm outline-none placeholder-zinc-600 transition-colors duration-200" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5 block">Fitness Goal</label>
                <input type="text" name="fitness_goal" value={form.fitness_goal} onChange={handleChange} placeholder="e.g. Lose weight, build strength..." className="w-full bg-[#1A1A1A] border border-white/10 focus:border-[#2EC4B6] text-white px-4 py-3 text-sm outline-none placeholder-zinc-600 transition-colors duration-200" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5 block">Interested Program</label>
                <select name="interested_program" value={form.interested_program} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 focus:border-[#2EC4B6] text-white px-4 py-3 text-sm outline-none transition-colors duration-200">
                  <option value="">Select a program</option>
                  {PROGRAMS.map((p) => (<option key={p} value={p}>{p}</option>))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5 block">Message</label>
                <textarea name="message" value={form.message} onChange={handleChange} rows={4} placeholder="Any other questions..." className="w-full bg-[#1A1A1A] border border-white/10 focus:border-[#2EC4B6] text-white px-4 py-3 text-sm outline-none resize-none placeholder-zinc-600 transition-colors duration-200" />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary text-sm w-full justify-center">
                {submitting ? "Sending..." : "Send Message"} {!submitting && <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
