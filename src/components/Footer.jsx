import { Link } from "react-router-dom";
import { MapPin, Phone, ChevronRight } from "lucide-react";
import { InstagramIcon as Instagram } from "@/components/icons";

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
            <div className="flex items-center gap-3">
              <Instagram className="w-4 h-4 text-[#2EC4B6] flex-shrink-0" />
              <a href="https://instagram.com/caliterrain" target="_blank" rel="noopener noreferrer" className="text-zinc-400 text-sm hover:text-white transition-colors">
                @caliterrain
              </a>
            </div>
          </div>

          {/* Programs Links */}
          <div>
            <h3 className="font-heading text-xl text-white tracking-wide mb-4">PROGRAMS</h3>
            <ul className="space-y-2">
              {["Adult Calisthenics", "Kids Calisthenics", "Weight Loss", "Personal Coaching", "Functional Fitness"].map((p) => (
                <li key={p}>
                  <Link to="/programs" className="text-zinc-500 text-sm hover:text-[#2EC4B6] transition-colors">
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
                  <Link to={link.to} className="text-zinc-500 text-sm hover:text-[#2EC4B6] transition-colors">
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
            className="text-[#2EC4B6] text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:underline"
          >
            Book Free Trial <ChevronRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
