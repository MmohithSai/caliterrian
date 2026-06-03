import { defineType, defineField } from "sanity";
import { Info } from "lucide-react";

// About page — NEW page that does not exist in code yet.
export const aboutPage = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  icon: Info,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "media", title: "Media" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "story",
      title: "Story",
      type: "array",
      group: "content",
      description: "Rich text — the gym's story.",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "mission",
      title: "Mission",
      type: "text",
      rows: 3,
      group: "content",
    }),
    defineField({
      name: "vision",
      title: "Vision",
      type: "text",
      rows: 3,
      group: "content",
    }),
    defineField({
      name: "values",
      title: "Core values",
      type: "array",
      group: "content",
      of: [{ type: "valueItem" }],
    }),
    defineField({
      name: "foundedYear",
      title: "Founded year",
      type: "number",
      group: "content",
      validation: (Rule) => Rule.min(1900).max(new Date().getFullYear()),
    }),
    defineField({
      name: "facilityImages",
      title: "Facility images",
      type: "array",
      group: "media",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    prepare: () => ({ title: "About Page" }),
  },
});
