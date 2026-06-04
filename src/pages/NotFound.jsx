import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import SEO from "@/components/SEO";

export default function NotFound() {
  return (
    <div className="pt-24 min-h-screen bg-obsidian flex flex-col items-center justify-center px-6 text-center">
      <SEO title="Page Not Found" noindex />
      <p className="section-tag">Error 404</p>
      <h1 className="font-heading text-7xl sm:text-8xl text-white leading-none mb-4">
        LOST YOUR <span className="text-[#2EC4B6]">GRIP?</span>
      </h1>
      <p className="text-zinc-400 text-base max-w-md mx-auto mb-8">
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
  );
}
