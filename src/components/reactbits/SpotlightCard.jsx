// React Bits "SpotlightCard" — stripped of its default surface (bg/border/
// padding) so the site's .ct-card / tier styles keep driving the look; only
// the cursor-tracking glow remains, tinted Caliterrain Blue by default.
import { useRef } from "react";
import "./SpotlightCard.css";

export default function SpotlightCard({ children, className = "", spotlightColor = "rgba(46, 141, 255, 0.14)" }) {
  const divRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = divRef.current.getBoundingClientRect();
    divRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    divRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    divRef.current.style.setProperty("--spotlight-color", spotlightColor);
  };

  return (
    <div ref={divRef} onMouseMove={handleMouseMove} className={`card-spotlight ${className}`}>
      {children}
    </div>
  );
}
