import SEO, { faqSchema } from "@/components/SEO";
import { FAQ } from "@/data/home";
import { HeroSection } from "@/components/home/hero";
import { JourneySection } from "@/components/home/journey";
import { SkillTreeSection, HallOfFirstsSection } from "@/components/home/skills";
import { DisciplinesSection, CoachesSection } from "@/components/home/training";
import { FacilitySection, FacilityGallerySection } from "@/components/home/facility";
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
      <SEO type="gym" path="/" schema={[faqSchema(FAQ.items)]} />

      <HeroSection onBookTrial={onBookTrial} />            {/* 1  Hero */}
      <JourneySection />                                   {/* 2  A Journey That Builds You */}
      <SkillTreeSection onBookTrial={onBookTrial} />       {/* 4  Skill Tree */}
      <HallOfFirstsSection onBookTrial={onBookTrial} />    {/* 5  Hall of Firsts (+ Community) */}
      <DisciplinesSection />                               {/* 6  Training Disciplines */}
      <CoachesSection />                                   {/* 7  Coaches */}
      <FacilitySection />                                  {/* 8  Facility Experience */}
      <FacilityGallerySection onBookTrial={onBookTrial} /> {/* 8b Zone Gallery (3D) */}
      <ResultsSection />                                   {/* 9  Results (rings + stories) */}
      <MembershipsSection onBookTrial={onBookTrial} />     {/* 10 Memberships */}
      <FaqSection onBookTrial={onBookTrial} />             {/* 11 FAQ */}
      <VisitSection onBookTrial={onBookTrial} />           {/* 12 Visit Us (decision strip) */}
      <FinalCtaSection onBookTrial={onBookTrial} />        {/* 13 Final CTA */}
    </div>
  );
}
