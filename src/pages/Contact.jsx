import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, ChevronRight, Send } from "lucide-react";
import { InstagramIcon as Instagram, WhatsAppIcon as WhatsApp } from "@/components/icons";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { submitForm } from "@/lib/supabase";
import { NAP, SOCIAL, telLink, waLink } from "@/data/site";
import { trackFormSubmit, trackWhatsApp, trackCall } from "@/lib/analytics";

const WA_LINK = waLink("Hi, I would like to know more about Cali Terrain.");
const PROGRAMS = ["Adult Calisthenics", "Kids Calisthenics", "Weight Loss", "Bodyweight Strength", "Functional Fitness", "Mobility & Flexibility", "Beginner Program", "Handstand & Skill Training", "Personal Coaching", "Group Training", "Other"];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function Contact({ onBookTrial }) {
  const [form, setForm] = useState({ name: "", phone: "", age: "", fitness_goal: "", interested_program: "", message: "", company: "" });
  const [submitting, setSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) { toast.error("Please fill your name and phone"); return; }
    setSubmitting(true);
    const { ok, error } = await submitForm("submit-lead", form);
    if (ok) {
      trackFormSubmit("contact");
      toast.success("Message sent! We'll contact you shortly.");
      setForm({ name: "", phone: "", age: "", fitness_goal: "", interested_program: "", message: "", company: "" });
    } else {
      toast.error(error || "Could not send. Please try WhatsApp or call us.");
    }
    setSubmitting(false);
  };

  const contactCards = [
    {
      id: "whatsapp",
      href: WA_LINK,
      icon: <WhatsApp className="w-5 h-5 text-white" />,
      iconBg: "bg-[#25D366]",
      borderColor: "border-[#25D366]/30 hover:border-[#25D366]",
      bgStyle: { background: "linear-gradient(135deg, rgba(37,211,102,0.08), rgba(37,211,102,0.02))" },
      title: "Chat on WhatsApp",
      subtitle: "Fastest response — we reply within minutes",
      glow: "rgba(37,211,102,0.15)",
      onTrack: () => trackWhatsApp("contact"),
    },
    {
      id: "phone",
      href: telLink(),
      icon: <Phone className="w-5 h-5 text-white" />,
      iconBg: "bg-[#2EC4B6]",
      borderColor: "border-[#2EC4B6]/30 hover:border-[#2EC4B6]",
      bgStyle: { background: "linear-gradient(135deg, rgba(46,196,182,0.08), rgba(46,196,182,0.02))" },
      title: NAP.phoneDisplay,
      subtitle: "Call us directly during training hours",
      glow: "rgba(46,196,182,0.15)",
      onTrack: () => trackCall("contact"),
    },
    {
      id: "instagram",
      href: SOCIAL.instagram,
      icon: <Instagram className="w-5 h-5 text-white" />,
      iconBg: "",
      iconGradient: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
      borderColor: "border-white/10 hover:border-[#e6683c]/50",
      bgStyle: { background: "linear-gradient(135deg, rgba(240,148,51,0.06), rgba(188,24,136,0.06))" },
      title: SOCIAL.instagramHandle,
      subtitle: "Follow for daily training content",
      glow: "rgba(225,48,108,0.12)",
    },
  ];

  return (
    <div className="pt-24 min-h-screen bg-obsidian">
      <SEO title="Contact Us" description="Contact Cali Terrain calisthenics gym at Bowenpally, Secunderabad. Call 8688458907." path="/contact" />

      {/* Hero Header */}
      <div className="relative bg-[#0D0D0D] border-b border-white/5 py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 20% 80%, rgba(46,196,182,0.06), transparent 50%)" }} />
        <motion.div
          className="max-w-7xl mx-auto relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="section-tag mb-2">Get In Touch</p>
          <h1 className="font-heading text-6xl md:text-8xl text-white leading-none mb-4">CONTACT<br /><span className="text-[#2EC4B6]">US</span></h1>
          <p className="text-zinc-400 text-base max-w-2xl">Have questions? Want to book a trial? We're here to help.</p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            <motion.h2 variants={fadeUp} className="font-heading text-3xl text-white tracking-wide mb-8">FIND US</motion.h2>
            <motion.div variants={stagger} className="flex flex-col gap-4 mb-10">
              {contactCards.map((card) => (
                <motion.a
                  key={card.id}
                  variants={fadeUp}
                  href={card.href}
                  onClick={card.onTrack}
                  target={card.id !== "phone" ? "_blank" : undefined}
                  rel={card.id !== "phone" ? "noopener noreferrer" : undefined}
                  className={`contact-link-card group flex items-center gap-4 border ${card.borderColor} p-4 transition-all duration-280`}
                  style={card.bgStyle}
                  whileHover={{ x: 6, boxShadow: `0 8px 30px ${card.glow}` }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={`w-11 h-11 ${card.iconBg} flex items-center justify-center flex-shrink-0 transition-transform duration-280 group-hover:scale-110`}
                    style={card.iconGradient ? { background: card.iconGradient } : undefined}
                  >
                    {card.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm group-hover:text-[#2EC4B6] transition-colors duration-200">{card.title}</p>
                    <p className="text-zinc-500 text-xs">{card.subtitle}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 transition-all duration-200 group-hover:text-[#2EC4B6] group-hover:translate-x-1 flex-shrink-0" />
                </motion.a>
              ))}
            </motion.div>

            {/* Address */}
            <motion.div
              variants={fadeUp}
              className="flex gap-3 mb-10 bg-[#121212] border border-white/5 p-5 hover:border-white/15 transition-colors duration-200"
              whileHover={{ borderColor: "rgba(46,196,182,0.2)" }}
            >
              <MapPin className="w-5 h-5 text-[#2EC4B6] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-bold text-sm mb-1">{NAP.name}</p>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {NAP.addressLines.map((line, i) => (
                    <span key={i}>{line}{i < NAP.addressLines.length - 1 && <br />}</span>
                  ))}
                </p>
              </div>
            </motion.div>

            {/* Book Trial CTA */}
            <motion.button
              variants={fadeUp}
              onClick={onBookTrial}
              className="btn-primary text-sm w-full justify-center"
              whileHover={{ scale: 1.02, boxShadow: "0 0 35px rgba(46,196,182,0.4)" }}
              whileTap={{ scale: 0.98 }}
            >
              Book Free Trial <ChevronRight className="w-4 h-4" />
            </motion.button>

            {/* Map */}
            <motion.div
              variants={fadeUp}
              className="mt-8 border border-white/10 overflow-hidden hover:border-white/20 transition-colors duration-300"
            >
              <iframe src={NAP.mapEmbed} width="100%" height="280" style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Cali Terrain Location" />
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h2 className="font-heading text-3xl text-white tracking-wide mb-8">SEND US A MESSAGE</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Honeypot: hidden from humans, bots fill it → silently rejected server-side */}
              <input
                type="text" name="company" value={form.company} onChange={handleChange}
                tabIndex={-1} autoComplete="off" aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 opacity-0" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="form-field-group">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5 block">Name *</label>
                  <input
                    type="text" name="name" value={form.name} onChange={handleChange} required
                    placeholder="Your full name"
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    className={`contact-input w-full bg-[#1A1A1A] border text-white px-4 py-3 text-sm outline-none placeholder-zinc-600 transition-all duration-200 ${focusedField === "name" ? "border-[#2EC4B6] shadow-[0_0_12px_rgba(46,196,182,0.15)]" : "border-white/10"}`}
                  />
                </div>
                <div className="form-field-group">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5 block">Phone *</label>
                  <input
                    type="tel" name="phone" value={form.phone} onChange={handleChange} required
                    placeholder="Your mobile number"
                    onFocus={() => setFocusedField("phone")}
                    onBlur={() => setFocusedField(null)}
                    className={`contact-input w-full bg-[#1A1A1A] border text-white px-4 py-3 text-sm outline-none placeholder-zinc-600 transition-all duration-200 ${focusedField === "phone" ? "border-[#2EC4B6] shadow-[0_0_12px_rgba(46,196,182,0.15)]" : "border-white/10"}`}
                  />
                </div>
              </div>
              <div className="form-field-group">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5 block">Age</label>
                <input
                  type="text" name="age" value={form.age} onChange={handleChange}
                  placeholder="Your age"
                  onFocus={() => setFocusedField("age")}
                  onBlur={() => setFocusedField(null)}
                  className={`contact-input w-full bg-[#1A1A1A] border text-white px-4 py-3 text-sm outline-none placeholder-zinc-600 transition-all duration-200 ${focusedField === "age" ? "border-[#2EC4B6] shadow-[0_0_12px_rgba(46,196,182,0.15)]" : "border-white/10"}`}
                />
              </div>
              <div className="form-field-group">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5 block">Fitness Goal</label>
                <input
                  type="text" name="fitness_goal" value={form.fitness_goal} onChange={handleChange}
                  placeholder="e.g. Lose weight, build strength..."
                  onFocus={() => setFocusedField("fitness_goal")}
                  onBlur={() => setFocusedField(null)}
                  className={`contact-input w-full bg-[#1A1A1A] border text-white px-4 py-3 text-sm outline-none placeholder-zinc-600 transition-all duration-200 ${focusedField === "fitness_goal" ? "border-[#2EC4B6] shadow-[0_0_12px_rgba(46,196,182,0.15)]" : "border-white/10"}`}
                />
              </div>
              <div className="form-field-group">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5 block">Interested Program</label>
                <select
                  name="interested_program" value={form.interested_program} onChange={handleChange}
                  onFocus={() => setFocusedField("program")}
                  onBlur={() => setFocusedField(null)}
                  className={`contact-input w-full bg-[#1A1A1A] border text-white px-4 py-3 text-sm outline-none transition-all duration-200 ${focusedField === "program" ? "border-[#2EC4B6] shadow-[0_0_12px_rgba(46,196,182,0.15)]" : "border-white/10"}`}
                >
                  <option value="">Select a program</option>
                  {PROGRAMS.map((p) => (<option key={p} value={p}>{p}</option>))}
                </select>
              </div>
              <div className="form-field-group">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5 block">Message</label>
                <textarea
                  name="message" value={form.message} onChange={handleChange} rows={4}
                  placeholder="Any other questions..."
                  onFocus={() => setFocusedField("message")}
                  onBlur={() => setFocusedField(null)}
                  className={`contact-input w-full bg-[#1A1A1A] border text-white px-4 py-3 text-sm outline-none resize-none placeholder-zinc-600 transition-all duration-200 ${focusedField === "message" ? "border-[#2EC4B6] shadow-[0_0_12px_rgba(46,196,182,0.15)]" : "border-white/10"}`}
                />
              </div>
              <motion.button
                type="submit"
                disabled={submitting}
                className="btn-primary text-sm w-full justify-center"
                whileHover={{ scale: 1.02, boxShadow: "0 0 35px rgba(46,196,182,0.4)" }}
                whileTap={{ scale: 0.97 }}
              >
                {submitting ? "Sending..." : "Send Message"} {!submitting && <Send className="w-4 h-4" />}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
