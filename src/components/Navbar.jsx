import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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
  const reduce = useReducedMotion();

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
          {NAV_LINKS.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
                className={`relative text-xs font-bold uppercase tracking-widest px-3 py-2 transition-colors duration-200 ${
                  active ? "text-[#2E8DFF]" : "text-zinc-400 hover:text-white"
                }`}
              >
                {link.label}
                {/* Shared layoutId → the underline glides to the active link */}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-0.5 left-3 right-3 h-0.5 rounded-full bg-[#2E8DFF]"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* CTA + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <motion.button
            data-testid="navbar-book-trial-btn"
            onClick={onBookTrial}
            whileHover={reduce ? undefined : { scale: 1.04 }}
            whileTap={reduce ? undefined : { scale: 0.96 }}
            className="hidden sm:flex items-center gap-2 bg-[#2E8DFF] hover:bg-[#1F6FE0] text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 transition-colors duration-200"
          >
            Book Free Trial <ChevronRight className="w-3 h-3" />
          </motion.button>
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
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            data-testid="navbar-mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden bg-obsidian/98 backdrop-blur-lg border-t border-white/5"
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }}
              className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-1"
            >
              {NAV_LINKS.map((link) => (
                <motion.div key={link.to} variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}>
                  <Link
                    to={link.to}
                    className={`block text-sm font-bold uppercase tracking-widest py-3 border-b border-white/5 transition-colors duration-200 ${
                      location.pathname === link.to
                        ? "text-[#2E8DFF]"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.button
                variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}
                onClick={onBookTrial}
                className="mt-4 btn-primary text-xs w-full justify-center"
              >
                Book Free Trial <ChevronRight className="w-3 h-3" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
