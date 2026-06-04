import { useState } from "react";
import { X, ChevronRight, CheckCircle2 } from "lucide-react";
import { WhatsAppIcon as WhatsApp } from "@/components/icons";
import { toast } from "sonner";
import { submitForm } from "@/lib/supabase";
import { trackFormSubmit, trackWhatsApp } from "@/lib/analytics";

const WA_NUMBER = "918688458907";
const PROGRAMS = [
  "Adult Calisthenics", "Kids Calisthenics", "Weight Loss", "Bodyweight Strength",
  "Functional Fitness", "Mobility & Flexibility", "Beginner Program",
  "Handstand & Skill Training", "Personal Coaching", "Group Training", "Other",
];

const TIME_SLOTS = ["Morning (5AM - 11AM)", "Evening (5PM - 10PM)", "Flexible"];

const emptyForm = { name: "", phone: "", age: "", program: "", goal: "", preferred_time: "", company: "" };

const buildWaLink = (form) => {
  const msg = `Hi Cali Terrain! I'd like to book a free trial.\n\nName: ${form.name}\nPhone: ${form.phone}\nAge: ${form.age || "Not specified"}\nProgram: ${form.program || "Not specified"}\nGoal: ${form.goal || "Not specified"}\nPreferred Time: ${form.preferred_time || "Flexible"}`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
};

export default function TrialBookingModal({ open, onClose }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Always reset state when the modal closes, so reopening shows a fresh form.
  const handleClose = () => {
    setForm(emptyForm);
    setSubmitting(false);
    setSubmitted(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Please fill your name and phone number");
      return;
    }
    setSubmitting(true);

    // Persist the booking first (the lead must never be lost), then show the
    // success screen. The WhatsApp redirect happens on an explicit click there,
    // which keeps it inside a user gesture (no popup-blocker issues).
    const { ok, error } = await submitForm("submit-booking", form);
    setSubmitting(false);
    if (!ok) {
      toast.error(error || "Could not book. Please try WhatsApp or call us.");
      return;
    }
    trackFormSubmit("trial_booking");
    setSubmitted(true);
  };

  const goToWhatsApp = () => {
    trackWhatsApp("trial_booking");
    window.open(buildWaLink(form), "_blank", "noopener,noreferrer");
    handleClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="relative bg-[#0D0D0D] border border-white/10 p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} aria-label="Close" className="absolute top-4 right-4 text-zinc-500 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          /* ---------- Success screen ---------- */
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#2EC4B6]/15 flex items-center justify-center mb-5">
              <CheckCircle2 className="w-9 h-9 text-[#2EC4B6]" />
            </div>
            <h2 className="font-heading text-3xl text-white mb-2">YOU'RE BOOKED!</h2>
            <p className="text-zinc-400 text-sm max-w-sm mx-auto mb-1">
              Thanks{form.name ? `, ${form.name.split(" ")[0]}` : ""} — we've received your free trial request.
            </p>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-7">
              Our team will reach out shortly to confirm your slot. Want a faster response? Send us the details on WhatsApp.
            </p>

            <button
              onClick={goToWhatsApp}
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#22c35e] text-black font-bold text-sm py-3.5 rounded-sm transition-colors"
            >
              <WhatsApp className="w-5 h-5" /> Continue on WhatsApp
            </button>
            <button
              onClick={handleClose}
              className="mt-3 text-sm text-zinc-500 hover:text-white transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* ---------- Booking form ---------- */
          <>
            <p className="section-tag">Start Your Journey</p>
            <h2 className="font-heading text-3xl text-white mb-6">BOOK YOUR FREE TRIAL</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot: bots fill it → silently rejected server-side */}
              <input
                type="text" name="company" value={form.company} onChange={handleChange}
                tabIndex={-1} autoComplete="off" aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 opacity-0" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5 block">Name *</label>
                  <input
                    type="text" name="name" value={form.name} onChange={handleChange} required
                    placeholder="Your full name"
                    className="w-full bg-[#1A1A1A] border border-white/10 focus:border-[#2EC4B6] text-white px-4 py-3 text-sm outline-none placeholder-zinc-600 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5 block">Phone *</label>
                  <input
                    type="tel" name="phone" value={form.phone} onChange={handleChange} required
                    placeholder="Your mobile number"
                    className="w-full bg-[#1A1A1A] border border-white/10 focus:border-[#2EC4B6] text-white px-4 py-3 text-sm outline-none placeholder-zinc-600 transition-colors duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5 block">Age</label>
                <input
                  type="text" name="age" value={form.age} onChange={handleChange}
                  placeholder="Your age"
                  className="w-full bg-[#1A1A1A] border border-white/10 focus:border-[#2EC4B6] text-white px-4 py-3 text-sm outline-none placeholder-zinc-600 transition-colors duration-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5 block">Interested Program</label>
                <select
                  name="program" value={form.program} onChange={handleChange}
                  className="w-full bg-[#1A1A1A] border border-white/10 focus:border-[#2EC4B6] text-white px-4 py-3 text-sm outline-none transition-colors duration-200"
                >
                  <option value="">Select a program</option>
                  {PROGRAMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5 block">Fitness Goal</label>
                <input
                  type="text" name="goal" value={form.goal} onChange={handleChange}
                  placeholder="e.g. Lose weight, build strength, first pull-up..."
                  className="w-full bg-[#1A1A1A] border border-white/10 focus:border-[#2EC4B6] text-white px-4 py-3 text-sm outline-none placeholder-zinc-600 transition-colors duration-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5 block">Preferred Time</label>
                <select
                  name="preferred_time" value={form.preferred_time} onChange={handleChange}
                  className="w-full bg-[#1A1A1A] border border-white/10 focus:border-[#2EC4B6] text-white px-4 py-3 text-sm outline-none transition-colors duration-200"
                >
                  <option value="">Select preferred time</option>
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary text-sm w-full justify-center"
              >
                {submitting ? "Booking..." : "Book Free Trial"}
                {!submitting && <ChevronRight className="w-4 h-4" />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
