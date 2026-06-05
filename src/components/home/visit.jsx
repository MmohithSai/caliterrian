// Section 15.5 · Visit Us — decision strip (map · hours · price-from · 1-tap
// contact). Addresses the audit's #1 conversion finding: surface decision
// info before the final ask. All facts sourced from site.js; CTAs fire the
// existing analytics events (no new event names).
import { motion } from "framer-motion";
import { ArrowRight, Clock, MapPin, MessageCircle, Phone, Tag } from "lucide-react";
import { Eyebrow, Heading, Section } from "./ui";
import { reveal, stagger, vpOnce } from "./anim";
import { NAP, HOURS, telLink, waLink } from "@/data/site";
import { trackWhatsApp, trackCall } from "@/lib/analytics";

export function VisitSection({ onBookTrial }) {
  return (
    <Section id="visit">
      <motion.div initial="hidden" whileInView="visible" viewport={vpOnce} variants={stagger} className="mb-10">
        <Eyebrow>Visit Us</Eyebrow>
        <Heading lines={["Come See The Space.", "Your First Session Is Free."]} className="mt-4" />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Map */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={vpOnce}
          variants={reveal}
          className="overflow-hidden border border-[#1E2A38] lg:col-span-3"
        >
          <iframe
            src={NAP.mapEmbed}
            title={`Map to ${NAP.name}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-72 w-full border-0 lg:h-full"
            style={{ minHeight: "20rem" }}
          />
        </motion.div>

        {/* Decision card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={vpOnce}
          variants={stagger}
          className="ct-card flex flex-col gap-5 p-6 lg:col-span-2"
        >
          <motion.div variants={reveal} className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#2E8DFF]" />
            <div className="text-sm leading-relaxed text-[#9AA7B6]">
              {NAP.addressLines.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={reveal} className="flex items-start gap-3 border-t border-[#1E2A38] pt-5">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#2E8DFF]" />
            <div className="text-sm">
              <div className="font-semibold text-white">Open {HOURS.days}</div>
              <div className="text-[#9AA7B6]">Morning {HOURS.morning}</div>
              <div className="text-[#9AA7B6]">Evening {HOURS.evening}</div>
            </div>
          </motion.div>

          <motion.div variants={reveal} className="flex items-start gap-3 border-t border-[#1E2A38] pt-5">
            <Tag className="mt-0.5 h-5 w-5 shrink-0 text-[#2E8DFF]" />
            <div className="text-sm">
              <div className="font-semibold text-white">Memberships from ₹3,000/mo</div>
              <div className="text-[#9AA7B6]">Drop-in ₹400 · Free trial assessment included</div>
            </div>
          </motion.div>

          <motion.div variants={reveal} className="mt-auto grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
            <button onClick={onBookTrial} className="btn-primary col-span-full justify-center text-xs">
              Book Trial Session <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href={waLink("Hi, I'd like to visit Cali Terrain and book a free trial.")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsApp("home_visit_strip")}
              className="btn-secondary justify-center text-xs"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a
              href={telLink()}
              onClick={() => trackCall("home_visit_strip")}
              className="btn-secondary justify-center text-xs"
            >
              <Phone className="h-4 w-4" /> Call
            </a>
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}
