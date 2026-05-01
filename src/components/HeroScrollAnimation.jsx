import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const HERO_VIDEO = "/hero/pullup-hero.mp4";
const PLAYBACK_RATE = 0.82;

export default function HeroScrollAnimation({ onBookTrial }) {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = PLAYBACK_RATE;
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-obsidian">
      <video
        ref={videoRef}
        className={`hero-cinematic-media absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
        src={HERO_VIDEO}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onCanPlay={() => setReady(true)}
        aria-hidden="true"
      />

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-obsidian">
          <div className="flex flex-col items-center gap-3">
            <div className="h-px w-40 overflow-hidden bg-white/10">
              <div className="h-full w-2/3 bg-[#2EC4B6] transition-[width] duration-300" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">
              Loading
            </p>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.95)_0%,rgba(10,10,10,0.78)_35%,rgba(10,10,10,0.28)_72%,rgba(10,10,10,0.58)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_52%,rgba(46,196,182,0.14),transparent_34%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_bottom,rgba(10,10,10,0),#0A0A0A)]" />

      <div className="relative z-10 flex min-h-screen items-center px-6 pt-24 pb-20">
        <div className="hero-cinematic-copy mx-auto w-full max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-[#2EC4B6]">
              Secunderabad's Premier Calisthenics Gym
            </p>
            <h1 className="font-heading text-7xl leading-none text-white sm:text-8xl md:text-9xl lg:text-[10rem]">
              CALI
              <br />
              <span className="text-[#2EC4B6]">TERRAIN</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
              Build real strength, master bodyweight skills, and transform your
              body with expert calisthenics coaching in Bowenpally,
              Secunderabad.
            </p>
            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row">
              <button
                onClick={onBookTrial}
                className="kinetic-button inline-flex items-center gap-2 bg-[#2EC4B6] px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#001814] transition-colors duration-200 hover:bg-[#25A599]"
              >
                Book Free Trial <ChevronRight className="h-4 w-4" />
              </button>
              <Link
                to="/programs"
                className="inline-flex items-center gap-2 border border-white/70 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-colors duration-200 hover:bg-white/10"
              >
                Explore Programs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
