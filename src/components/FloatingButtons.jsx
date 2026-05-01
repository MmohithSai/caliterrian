import { useEffect, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { InstagramIcon as Instagram } from "@/components/icons";

const WA_LINK = "https://wa.me/918688458907?text=Hi%2C%20I%20would%20like%20to%20know%20more%20about%20Cali%20Terrain%20and%20book%20a%20free%20trial.";
const CALL_LINK = "tel:+918688458907";
const IG_LINK = "https://instagram.com/caliterrain";

export default function FloatingButtons({ onBookTrial }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
      <button
        data-testid="floating-book-trial-btn"
        onClick={onBookTrial}
        className="flex items-center gap-2 border border-[#2EC4B6]/40 bg-[#2EC4B6] px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#001814] shadow-md shadow-black/25 transition-colors duration-200 hover:bg-[#25A599]"
      >
        Book Free Trial
      </button>

      <div className="flex flex-col gap-2">
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="floating-whatsapp-btn"
          title="Chat on WhatsApp"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] shadow-md shadow-black/25 transition-colors duration-200 hover:bg-[#20b958]"
        >
          <MessageCircle className="h-5 w-5 text-white" />
        </a>

        <a
          href={CALL_LINK}
          data-testid="floating-call-btn"
          title="Call Us"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#1A1A1A] shadow-md shadow-black/25 transition-colors duration-200 hover:border-white"
        >
          <Phone className="h-5 w-5 text-white" />
        </a>

        <a
          href={IG_LINK}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="floating-instagram-btn"
          title="Instagram"
          className="flex h-12 w-12 items-center justify-center rounded-full shadow-md shadow-black/25 transition-opacity duration-200 hover:opacity-90"
          style={{
            background:
              "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
          }}
        >
          <Instagram className="h-5 w-5 text-white" />
        </a>
      </div>
    </div>
  );
}
