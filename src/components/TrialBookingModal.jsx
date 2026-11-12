import { useState } from "react";
import { X, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { submitAndOpenWhatsApp } from "@/lib/leads";
import { trackFormSubmit, trackWhatsApp } from "@/lib/analytics";

const PROGRAMS = [
  "Adult Calisthenics", "Kids Calisthenics", "Weight Loss", "Bodyweight Strength",
  "Functional Fitness", "Mobility & Flexibility", "Beginner Program",
  "Handstand & Skill Training", "Personal Coaching", "Group Training", "Other",
];

const TIME_SLOTS = ["Morning (5AM - 11AM)", "Evening (5PM - 10PM)", "Flexible"];

const emptyForm = { name: "", phone: "", age: "", program: "", goal: "", preferred_time: "", company: "" };

const waMessage = (form) =>
  `Hi Cali Terrain! I'd like to book a free trial.

Name: ${form.name}
Phone: ${form.phone}
Age: ${form.age || "Not specified"}
Program: ${form.program || "Not specified"}
Goal: ${form.goal || "Not specified"}
Preferred Time: ${form.preferred_time || "Flexible"}`;

export default function TrialBookingModal({ open, onClose }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleClose = () => {
    setForm(emptyForm);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Please fill your name and phone number");
      return;
    }
    setSubmitting(true);
    trackFormSubmit("trial_booking");
    trackWhatsApp("trial_booking");
    const { company, ...fields } = form;
    if (company) return; // honeypot: bots fill the hidden field
    await submitAndOpenWhatsApp("Trial", fields, waMessage(form));
    setSubmitting(false); // back button may restore this page from bfcache
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="relative bg-[#0E141C] border border-white/10 p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} aria-label="Close" className="absolute top-4 right-4 text-[#8A99AB] hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <>
            <p className="section-tag">Start Your Journey</p>
            <h2 className="font-heading text-3xl text-white mb-6">BOOK YOUR FREE TRIAL</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot: bots fill it → dropped before submit */}
              <input
                type="text" name="company" value={form.company} onChange={handleChange}
                tabIndex={-1} autoComplete="off" aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 opacity-0" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[#8A99AB] mb-1.5 block">Name *</label>
                  <input
                    type="text" name="name" value={form.name} onChange={handleChange} required
                    placeholder="Your full name"
                    className="w-full bg-[#1A2230] border border-white/10 focus:border-[#2E8DFF] text-white px-4 py-3 text-sm outline-none placeholder-[#5C6B7C] transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[#8A99AB] mb-1.5 block">Phone *</label>
                  <input
                    type="tel" name="phone" value={form.phone} onChange={handleChange} required
                    placeholder="Your mobile number"
                    className="w-full bg-[#1A2230] border border-white/10 focus:border-[#2E8DFF] text-white px-4 py-3 text-sm outline-none placeholder-[#5C6B7C] transition-colors duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#8A99AB] mb-1.5 block">Age</label>
                <input
                  type="text" name="age" value={form.age} onChange={handleChange}
                  placeholder="Your age"
                  className="w-full bg-[#1A2230] border border-white/10 focus:border-[#2E8DFF] text-white px-4 py-3 text-sm outline-none placeholder-[#5C6B7C] transition-colors duration-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#8A99AB] mb-1.5 block">Interested Program</label>
                <select
                  name="program" value={form.program} onChange={handleChange}
                  className="w-full bg-[#1A2230] border border-white/10 focus:border-[#2E8DFF] text-white px-4 py-3 text-sm outline-none transition-colors duration-200"
                >
                  <option value="">Select a program</option>
                  {PROGRAMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#8A99AB] mb-1.5 block">Fitness Goal</label>
                <input
                  type="text" name="goal" value={form.goal} onChange={handleChange}
                  placeholder="e.g. Lose weight, build strength, first pull-up..."
                  className="w-full bg-[#1A2230] border border-white/10 focus:border-[#2E8DFF] text-white px-4 py-3 text-sm outline-none placeholder-[#5C6B7C] transition-colors duration-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#8A99AB] mb-1.5 block">Preferred Time</label>
                <select
                  name="preferred_time" value={form.preferred_time} onChange={handleChange}
                  className="w-full bg-[#1A2230] border border-white/10 focus:border-[#2E8DFF] text-white px-4 py-3 text-sm outline-none transition-colors duration-200"
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
                {submitting ? "Opening WhatsApp..." : "Book Free Trial"}
                {!submitting && <ChevronRight className="w-4 h-4" />}
              </button>
            </form>
        </>
      </div>
    </div>
  );
}
