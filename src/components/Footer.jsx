import { Link } from "react-router-dom";
import { MapPin, Phone, ChevronRight } from "lucide-react";
import { InstagramIcon as Instagram, WhatsAppIcon as WhatsApp } from "@/components/icons";

export default function Footer() {
  return (
    <footer className="bg-[#0D0D0D] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <h2 className="font-heading text-3xl text-white tracking-wider mb-4">CALI TERRAIN</h2>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-md mb-6">
              Premium Calisthenics & Bodyweight Training Gym in Bowenpally, Secunderabad. 
              Build real strength, mobility and athleticism with expert coaching.
            </p>
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="w-4 h-4 text-[#2EC4B6] mt-0.5 flex-shrink-0" />
              <p className="text-zinc-400 text-sm leading-relaxed">
                SS Complex, 156/2, Sikh Rd, near DPS School,<br />
                Diamond Point, Radha Swamy Colony, Bowenpally,<br />
                Secunderabad, Telangana 500009
              </p>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <Phone className="w-4 h-4 text-[#2EC4B6] flex-shrink-0" />
              <a href="tel:+918688458907" className="text-zinc-400 text-sm hover:text-white transition-colors">
                +91 86884 58907
              </a>
            </div>

            {/* Social Icons Row */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://wa.me/918688458907?text=Hi%2C%20I%20want%20to%20know%20more%20about%20Cali%20Terrain."
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]/15 border border-[#25D366]/25 text-[#25D366] transition-all duration-250 hover:bg-[#25D366] hover:text-white hover:scale-110 hover:shadow-[0_0_18px_rgba(37,211,102,0.35)]"
                title="WhatsApp"
              >
                <WhatsApp className="w-[18px] h-[18px]" />
              </a>
              <a
                href="https://instagram.com/caliterrain"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-[#e6683c] transition-all duration-250 hover:scale-110 hover:shadow-[0_0_18px_rgba(225,48,108,0.3)]"
                style={{ background: "rgba(225,48,108,0.1)" }}
                title="Instagram"
                onMouseEnter={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)"; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "transparent"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(225,48,108,0.1)"; e.currentTarget.style.color = "#e6683c"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
              >
                <Instagram className="w-[18px] h-[18px]" />
              </a>
              <a
                href="tel:+918688458907"
                className="footer-social-btn flex h-10 w-10 items-center justify-center rounded-full bg-[#2EC4B6]/10 border border-[#2EC4B6]/25 text-[#2EC4B6] transition-all duration-250 hover:bg-[#2EC4B6] hover:text-white hover:scale-110 hover:shadow-[0_0_18px_rgba(46,196,182,0.35)]"
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
              {["Adult Calisthenics", "Kids Calisthenics", "Weight Loss", "Personal Coaching", "Functional Fitness"].map((p) => (
                <li key={p}>
                  <Link to="/programs" className="footer-link text-zinc-500 text-sm hover:text-[#2EC4B6] transition-all duration-200 hover:translate-x-1 inline-block">
                    {p}
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
                  <Link to={link.to} className="footer-link text-zinc-500 text-sm hover:text-[#2EC4B6] transition-all duration-200 hover:translate-x-1 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-xs">
            © {new Date().getFullYear()} Cali Terrain. All rights reserved.
          </p>
          <a
            href="https://wa.me/918688458907?text=Hi%2C%20I%20want%20to%20book%20a%20free%20trial%20at%20Cali%20Terrain."
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2EC4B6] text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:underline transition-all duration-200 hover:gap-2"
          >
            Book Free Trial <ChevronRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
