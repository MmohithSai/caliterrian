import SEO from "@/components/SEO";
import { HeroSection, ProblemSection, PathSection } from "@/components/home/intro";
import { SkillTreeSection, HallOfFirstsSection } from "@/components/home/skills";
import { FirstSessionSection, DisciplinesSection, CoachesSection } from "@/components/home/training";
import { FacilitySection } from "@/components/home/facility";
import { ResultsSection, MembershipsSection, FaqSection, FinalCtaSection } from "@/components/home/proof";
import { VisitSection } from "@/components/home/visit";
import { useScrollReveal } from "@/lib/useScrollReveal";

// 2026 facility-first homepage — Caliterrain Blue system, athlete-ecosystem IA.
// P5 consolidation: Community is folded into Hall of Firsts; Member Journeys +
// Testimonials are merged into a single Results section (rings + video stories).
// The CTA spine (`onBookTrial`) is prop-drilled from App.jsx into every section
// that opens the shared TrialBookingModal.
export default function Home({ onBookTrial }) {
  useScrollReveal({ threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  return (
    <div className="min-h-screen bg-[#0B1016]">
      <SEO path="/" />

      <HeroSection onBookTrial={onBookTrial} />            {/* 1  Hero */}
      <ProblemSection />                                   {/* 2  The Problem */}
      <PathSection />                                      {/* 3  The Caliterrain Path */}
      <SkillTreeSection onBookTrial={onBookTrial} />       {/* 4  Skill Tree */}
      <HallOfFirstsSection onBookTrial={onBookTrial} />    {/* 5  Hall of Firsts (+ Community) */}
      <FirstSessionSection onBookTrial={onBookTrial} />    {/* 6  First Session */}
      <DisciplinesSection />                               {/* 7  Training Disciplines */}
      <CoachesSection />                                   {/* 8  Coaches */}
      <FacilitySection />                                  {/* 9  Facility Experience */}
      <ResultsSection />                                   {/* 10 Results (rings + stories) */}
      <MembershipsSection onBookTrial={onBookTrial} />     {/* 11 Memberships */}
      <FaqSection onBookTrial={onBookTrial} />             {/* 12 FAQ */}
      <VisitSection onBookTrial={onBookTrial} />           {/* 13 Visit Us (decision strip) */}
      <FinalCtaSection onBookTrial={onBookTrial} />        {/* 14 Final CTA */}
    </div>
  );
}
