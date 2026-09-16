import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import SEO from "@/components/SEO";
import FuzzyText from "@/components/reactbits/FuzzyText";
import Particles from "@/components/reactbits/Particles";

export default function NotFound() {
  return (
    <div className="relative pt-24 min-h-screen bg-obsidian flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      <SEO title="Page Not Found" noindex />
      {/* React Bits Particles: dim blue field behind the 404 */}
      <div className="absolute inset-0 pointer-events-none opacity-50" aria-hidden="true">
        <Particles particleCount={180} particleSpread={12} speed={0.07} particleBaseSize={80} alphaParticles disableRotation />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <p className="section-tag">Error 404</p>
        {/* React Bits FuzzyText: the 404 vibrates like a lost video signal */}
        <div className="flex justify-center my-2" aria-hidden="true">
          <FuzzyText
            fontFamily="'Bebas Neue', sans-serif"
            fontWeight={400}
            fontSize="clamp(7rem, 24vw, 15rem)"
            color="#2E8DFF"
            baseIntensity={0.14}
            hoverIntensity={0.42}
          >
            404
          </FuzzyText>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl text-white leading-none mb-4">
          LOST YOUR <span className="text-[#2E8DFF]">GRIP?</span>
        </h1>
        <p className="text-[#9AA7B6] text-base max-w-md mx-auto mb-8">
          This page doesn't exist or may have moved. Let's get you back to solid ground.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn-primary text-sm">
            Back to Home <ChevronRight className="w-4 h-4" />
          </Link>
          <Link to="/programs" className="btn-secondary text-sm">
            Explore Programs
          </Link>
        </div>
      </div>
    </div>
  );
}
