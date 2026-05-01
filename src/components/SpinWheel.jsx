import { useState, useRef } from "react";
import { X } from "lucide-react";

const SEGMENTS = [
  { num: 1, label: "10% OFF Membership", color: "#2EC4B6", text: "white" },
  { num: 2, label: "Do 10 Push-ups for 15% OFF", color: "#1A1A1A", text: "#2EC4B6" },
  { num: 3, label: "Free Trial Week", color: "#25A599", text: "white" },
  { num: 4, label: "5% OFF", color: "#1A1A1A", text: "#2EC4B6" },
  { num: 5, label: "Do 5 Pull-ups for 20% OFF", color: "#2EC4B6", text: "white" },
  { num: 6, label: "Free Cali Terrain T-shirt", color: "#1A1A1A", text: "#2EC4B6" },
  { num: 7, label: "3-Day Free Pass", color: "#25A599", text: "white" },
  { num: 8, label: "30s Handstand for 25% OFF", color: "#1A1A1A", text: "#2EC4B6" },
];

export default function SpinWheel({ open, onClose }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    const segAngle = 360 / SEGMENTS.length;
    const randomIdx = Math.floor(Math.random() * SEGMENTS.length);
    const jitter = (Math.random() - 0.5) * 28;
    const targetAngleMod = ((247.5 + jitter - randomIdx * segAngle) % 360 + 360) % 360;
    const currentMod = rotation % 360;
    const totalRotation = rotation + 1800 + ((targetAngleMod - currentMod + 360) % 360);

    setRotation(totalRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(SEGMENTS[randomIdx]);
    }, 4200);
  };

  const shareOnWhatsApp = () => {
    if (!result) return;
    const msg = `Hi Cali Terrain! I spun the wheel and got Number ${result.num}: "${result.label}". I'd like to claim this offer!`;
    window.open(`https://wa.me/918688458907?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0D0D0D] border border-white/10 p-6 sm:p-8 max-w-md w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} data-testid="spin-wheel-close" className="absolute top-4 right-4 text-zinc-500 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#2EC4B6] mb-2">New Member Offer</p>
        <h2 className="font-heading text-3xl text-white mb-6">SPIN THE WHEEL</h2>

        {/* Wheel */}
        <div className="relative mx-auto w-72 h-72 sm:w-80 sm:h-80 mb-6">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-[#2EC4B6]" />

          {/* Wheel SVG */}
          <svg
            ref={wheelRef}
            viewBox="0 0 300 300"
            className="w-full h-full"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
            }}
          >
            {SEGMENTS.map((seg, i) => {
              const angle = (360 / SEGMENTS.length) * i;
              const startRad = (angle * Math.PI) / 180;
              const endRad = ((angle + 360 / SEGMENTS.length) * Math.PI) / 180;
              const x1 = 150 + 140 * Math.cos(startRad);
              const y1 = 150 + 140 * Math.sin(startRad);
              const x2 = 150 + 140 * Math.cos(endRad);
              const y2 = 150 + 140 * Math.sin(endRad);
              const midRad = ((angle + 360 / SEGMENTS.length / 2) * Math.PI) / 180;
              const tx = 150 + 90 * Math.cos(midRad);
              const ty = 150 + 90 * Math.sin(midRad);
              const textAngle = angle + 360 / SEGMENTS.length / 2;

              return (
                <g key={i}>
                  <path
                    d={`M150,150 L${x1},${y1} A140,140 0 0,1 ${x2},${y2} Z`}
                    fill={seg.color}
                    stroke="#0A0A0A"
                    strokeWidth="2"
                  />
                  <text
                    x={tx}
                    y={ty}
                    fill={seg.text}
                    fontSize="28"
                    fontWeight="900"
                    fontFamily="Bebas Neue, sans-serif"
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${textAngle}, ${tx}, ${ty})`}
                  >
                    {seg.num}
                  </text>
                </g>
              );
            })}
            <circle cx="150" cy="150" r="22" fill="#0A0A0A" stroke="#2EC4B6" strokeWidth="3" />
            <text x="150" y="150" fill="#2EC4B6" fontSize="10" fontWeight="bold" textAnchor="middle" dominantBaseline="central">CT</text>
          </svg>
        </div>

        {!result ? (
          <button
            data-testid="spin-wheel-spin-btn"
            onClick={spin}
            disabled={spinning}
            className={`btn-primary text-sm w-full justify-center ${spinning ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {spinning ? "Spinning..." : "SPIN NOW!"}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#2EC4B6]/10 border border-[#2EC4B6]/40 p-4">
              <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">You got number {result.num}!</p>
              <p data-testid="spin-wheel-result" className="font-heading text-2xl text-[#2EC4B6]">{result.label}</p>
            </div>
            <button
              data-testid="spin-wheel-whatsapp-share"
              onClick={shareOnWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-sm uppercase tracking-wider py-3 px-6 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              Claim on WhatsApp
            </button>
            <button
              onClick={() => setResult(null)}
              className="text-zinc-500 text-xs hover:text-white transition-colors"
            >
              Spin again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
