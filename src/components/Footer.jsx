import { Link } from "react-router-dom";
import { MapPin, Phone, ChevronRight } from "lucide-react";
import { InstagramIcon as Instagram, WhatsAppIcon as WhatsApp } from "@/components/icons";
import ShinyText from "@/components/reactbits/ShinyText";
import { NAP, SOCIAL, telLink, waLink } from "@/data/site";
import { trackWhatsApp, trackCall } from "@/lib/analytics";

export default function Footer() {
  return (
    // relative z-10: paints above the pages' fixed PageBackdrop dot layer
    <footer className="relative z-10 bg-[#0E141C] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <h2 className="font-heading text-3xl text-white tracking-wider mb-4">CALI TERRAIN</h2>
            <p className="text-[#8A99AB] text-sm leading-relaxed max-w-md mb-4">
              Calisthenics gym in Bowenpally, Secunderabad, Hyderabad — a 10-zone indoor
              facility for coached bodyweight training. Kids and adult batches, skill
              coaching and personal training, Monday to Friday.
            </p>
            <p className="text-[#5C6B7C] text-xs leading-relaxed max-w-md mb-6">
              Serving Bowenpally, Diamond Point, Trimulgherry, Marredpally, Alwal,
              Kompally, Begumpet, Paradise, Karkhana and Sainikpuri.
            </p>
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="w-4 h-4 text-[#2E8DFF] mt-0.5 flex-shrink-0" />
              <p className="text-[#9AA7B6] text-sm leading-relaxed">
                {NAP.addressLines.map((line, i) => (
                  <span key={i}>{line}{i < NAP.addressLines.length - 1 && <br />}</span>
                ))}
              </p>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <Phone className="w-4 h-4 text-[#2E8DFF] flex-shrink-0" />
              <a href={telLink()} onClick={() => trackCall("footer")} className="text-[#9AA7B6] text-sm hover:text-white transition-colors">
                {NAP.phoneDisplay}
              </a>
            </div>

            {/* Social Icons Row */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href={waLink("Hi, I want to know more about Cali Terrain.")}
                onClick={() => trackWhatsApp("footer")}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]/15 border border-[#25D366]/25 text-[#25D366] transition-all duration-250 hover:bg-[#25D366] hover:text-white hover:scale-110 hover:shadow-[0_0_18px_rgba(37,211,102,0.35)]"
                title="WhatsApp"
              >
                <WhatsApp className="w-[18px] h-[18px]" />
              </a>
              {/* Gradient hover lives in CSS (.ig-btn) — a :hover rule is inert
                  on touch, where the JS handlers used to fire on tap. */}
              <a
                href={SOCIAL.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn ig-btn flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-[#e6683c] transition-all duration-250 hover:scale-110 hover:shadow-[0_0_18px_rgba(225,48,108,0.3)]"
                title="Instagram"
              >
                <Instagram className="w-[18px] h-[18px]" />
              </a>
              <a
                href={telLink()}
                onClick={() => trackCall("footer")}
                className="footer-social-btn flex h-10 w-10 items-center justify-center rounded-full bg-[#2E8DFF]/10 border border-[#2E8DFF]/25 text-[#2E8DFF] transition-all duration-250 hover:bg-[#2E8DFF] hover:text-white hover:scale-110 hover:shadow-[0_0_18px_rgba(46,141,255,0.35)]"
                title="Call Us"
              >
                <Phone className="w-[18px] h-[18px]" />
              </a>
            </div>
          </div>

          {/* Programs Links */}
          <div>
            <h3 className="font-heading text-xl text-white tracking-wide mb-4">PROGRAMS</h3>
            <ul className="space-y-2">
              {[
                { label: "Adult Calisthenics", to: "/programs#adult-calisthenics" },
                { label: "Kids Calisthenics (6–16)", to: "/programs#kids-calisthenics" },
                { label: "Beginner Program", to: "/programs#beginner-program" },
                { label: "Weight Loss", to: "/programs#weight-loss" },
                { label: "Handstand & Skills", to: "/programs#handstand-skills" },
                { label: "Personal Coaching", to: "/programs#personal-coaching" },
              ].map((p) => (
                <li key={p.to}>
                  <Link to={p.to} className="footer-link text-[#8A99AB] text-sm hover:text-[#2E8DFF] transition-all duration-200 hover:translate-x-1 inline-block">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-heading text-xl text-white tracking-wide mb-4">COMPANY</h3>
            <ul className="space-y-2">
              {[
                { label: "Programs", to: "/programs" },
                { label: "Our Coaches", to: "/coaches" },
                { label: "Transformations", to: "/transformations" },
                { label: "Pricing", to: "/pricing" },
                { label: "Gallery", to: "/gallery" },
                { label: "Blog", to: "/blog" },
                { label: "Contact", to: "/contact" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer-link text-[#8A99AB] text-sm hover:text-[#2E8DFF] transition-all duration-200 hover:translate-x-1 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      {/* Bottom padding clears the phone action bar (--ct-bar, 0 on sm+) */}
      <div className="border-t border-white/5 pt-6 pb-[calc(1.5rem+var(--ct-bar))]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#5C6B7C] text-xs">
            © {new Date().getFullYear()} Cali Terrain. All rights reserved.
          </p>
          <a
            href={waLink("Hi, I want to book a free trial at Cali Terrain.")}
            onClick={() => trackWhatsApp("footer")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2E8DFF] text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:underline transition-all duration-200 hover:gap-2"
          >
            {/* React Bits ShinyText: periodic light sweep keeps the CTA alive */}
            <ShinyText text="Book Free Trial" speed={2.2} delay={3} /> <ChevronRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
