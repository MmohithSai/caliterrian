// React Bits "GlareHover" — fill variant: the original imposes a fixed
// width/height/background card; this one just overlays the diagonal light
// sweep on whatever it wraps (media cards keep their own chrome).
import "./GlareHover.css";

export default function GlareHover({
  children,
  glareColor = "#ffffff",
  glareOpacity = 0.18,
  glareAngle = -30,
  glareSize = 300,
  transitionDuration = 750,
  playOnce = false,
  className = "",
  style = {},
}) {
  const hex = glareColor.replace("#", "");
  let rgba = glareColor;
  if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  } else if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }

  const vars = {
    "--gh-angle": `${glareAngle}deg`,
    "--gh-duration": `${transitionDuration}ms`,
    "--gh-size": `${glareSize}%`,
    "--gh-rgba": rgba,
  };

  return (
    <div className={`glare-hover ${playOnce ? "glare-hover--play-once" : ""} ${className}`} style={{ ...vars, ...style }}>
      {children}
    </div>
  );
}
