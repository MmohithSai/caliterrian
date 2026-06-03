import { defineType, defineField } from "sanity";
import { Home } from "lucide-react";

// Home page content. Maps to the consts currently in src/pages/Home.jsx
// (STATS, WHY_US, JOURNEY_STEPS) plus the hero + featured programs.
export const homePage = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  icon: Home,
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "sections", title: "Sections" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "heroHeadline",
      title: "Hero headline",
      type: "string",
      group: "hero",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroSubtext",
      title: "Hero subtext",
      type: "text",
      rows: 3,
      group: "hero",
    }),
    defineField({
      name: "heroImages",
      title: "Hero images",
      type: "array",
      group: "hero",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      group: "sections",
      of: [{ type: "stat" }],
    }),
    defineField({
      name: "whyUs",
      title: "Why us",
      type: "array",
      group: "sections",
      of: [{ type: "whyUsItem" }],
    }),
    defineField({
      name: "journeySteps",
      title: "Journey steps",
      type: "array",
      group: "sections",
      of: [{ type: "journeyStep" }],
    }),
    defineField({
      name: "featuredPrograms",
      title: "Featured programs",
      type: "array",
      group: "sections",
      description: "Programs to highlight on the home page.",
      of: [{ type: "reference", to: [{ type: "program" }] }],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Home Page" }),
  },
});
