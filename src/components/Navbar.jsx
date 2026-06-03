import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronRight } from "lucide-react";
import logo from "@/assets/logo.png";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/programs", label: "Programs" },
  { to: "/coaches", label: "Coaches" },
  { to: "/transformations", label: "Transformations" },
  { to: "/blog", label: "Blog" },
  { to: "/gallery", label: "Gallery" },
  { to: "/pricing", label: "Pricing" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar({ onBookTrial }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Reset transient nav UI on navigation. Intentional state sync to an
    // external change (the URL), not a render-derived value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-obsidian/95 backdrop-blur-md border-b border-white/5 py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" data-testid="navbar-logo" className="flex items-center gap-3">
          <img src={logo} alt="Cali Terrain" className="h-10 w-auto" />
          <span className="font-heading text-2xl text-white tracking-wider hidden sm:block">
            CALI TERRAIN
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-testid={`nav-link-${link.label.toLowerCase()}`}
              className={`text-xs font-bold uppercase tracking-widest px-3 py-2 transition-colors duration-200 ${
                location.pathname === link.to
                  ? "text-[#2EC4B6]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            data-testid="navbar-book-trial-btn"
            onClick={onBookTrial}
            className="hidden sm:flex items-center gap-2 bg-[#2EC4B6] hover:bg-[#25A599] text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 transition-all duration-200"
          >
            Book Free Trial <ChevronRight className="w-3 h-3" />
          </button>
          <button
            data-testid="navbar-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white p-2"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          data-testid="navbar-mobile-menu"
          className="lg:hidden bg-obsidian/98 backdrop-blur-lg border-t border-white/5"
        >
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-bold uppercase tracking-widest py-3 border-b border-white/5 transition-colors duration-200 ${
                  location.pathname === link.to
                    ? "text-[#2EC4B6]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={onBookTrial}
              className="mt-4 btn-primary text-xs w-full justify-center"
            >
              Book Free Trial <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
