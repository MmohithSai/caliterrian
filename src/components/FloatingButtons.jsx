import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InstagramIcon as Instagram, WhatsAppIcon as WhatsApp } from "@/components/icons";
import { Phone } from "lucide-react";

const WA_LINK = "https://wa.me/918688458907?text=Hi%2C%20I%20would%20like%20to%20know%20more%20about%20Cali%20Terrain%20and%20book%20a%20free%20trial.";
const CALL_LINK = "tel:+918688458907";
const IG_LINK = "https://instagram.com/caliterrain";

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.5, y: 20 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: 1.5 + i * 0.12,
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  }),
};

export default function FloatingButtons({ onBookTrial }) {
  const [visible, setVisible] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const buttons = [
    {
      id: "whatsapp",
      href: WA_LINK,
      external: true,
      label: "Chat on WhatsApp",
      icon: <WhatsApp className="h-[22px] w-[22px] text-white" />,
      bg: "bg-[#25D366]",
      hoverBg: "#20b958",
      shadow: "shadow-[0_4px_20px_rgba(37,211,102,0.35)]",
      pulse: true,
      testId: "floating-whatsapp-btn",
    },
    {
      id: "call",
      href: CALL_LINK,
      external: false,
      label: "Call Us",
      icon: <Phone className="h-5 w-5 text-white" />,
      bg: "bg-[#1A1A1A]",
      hoverBg: "#252525",
      border: "border border-white/15",
      shadow: "shadow-[0_4px_20px_rgba(0,0,0,0.4)]",
      testId: "floating-call-btn",
    },
    {
      id: "instagram",
      href: IG_LINK,
      external: true,
      label: "Follow on Instagram",
      icon: <Instagram className="h-5 w-5 text-white" />,
      gradient: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
      shadow: "shadow-[0_4px_20px_rgba(225,48,108,0.3)]",
      testId: "floating-instagram-btn",
    },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
          {/* Book Free Trial CTA */}
          <motion.button
            data-testid="floating-book-trial-btn"
            onClick={onBookTrial}
            custom={0}
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(46, 196, 182, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 border border-[#2EC4B6]/40 bg-[#2EC4B6] px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#001814] transition-colors duration-200 hover:bg-[#25A599]"
          >
            Book Free Trial
          </motion.button>

          {/* Social buttons */}
          <div className="flex flex-col gap-2">
            {buttons.map((btn, i) => (
              <div key={btn.id} className="relative flex items-center justify-end">
                {/* Tooltip label */}
                <AnimatePresence>
                  {hoveredBtn === btn.id && (
                    <motion.span
                      initial={{ opacity: 0, x: 8, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 8, scale: 0.9 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-14 whitespace-nowrap rounded bg-[#1A1A1A] px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg border border-white/10"
                    >
                      {btn.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                <motion.a
                  href={btn.href}
                  target={btn.external ? "_blank" : undefined}
                  rel={btn.external ? "noopener noreferrer" : undefined}
                  data-testid={btn.testId}
                  title={btn.label}
                  custom={i + 1}
                  variants={buttonVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ scale: 1.12, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onMouseEnter={() => setHoveredBtn(btn.id)}
                  onMouseLeave={() => setHoveredBtn(null)}
                  className={`floating-social-btn relative flex h-12 w-12 items-center justify-center rounded-full ${btn.bg || ""} ${btn.border || ""} ${btn.shadow || ""} transition-all duration-200`}
                  style={btn.gradient ? { background: btn.gradient } : undefined}
                >
                  {/* Pulse ring for WhatsApp */}
                  {btn.pulse && (
                    <span className="floating-pulse absolute inset-0 rounded-full bg-[#25D366]/40" />
                  )}
                  <span className="relative z-10">{btn.icon}</span>
                </motion.a>
              </div>
            ))}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
