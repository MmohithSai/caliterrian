import { defineType, defineField } from "sanity";

// Reusable SEO/social-share object for pages and posts.
export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "title",
      title: "Meta title",
      type: "string",
      description: "Overrides the page <title>. ~60 chars.",
      validation: (Rule) => Rule.max(70).warning("Shorter titles display better."),
    }),
    defineField({
      name: "description",
      title: "Meta description",
      type: "text",
      rows: 3,
      validation: (Rule) =>
        Rule.max(160).warning("Search engines truncate past ~160 chars."),
    }),
    defineField({
      name: "ogImage",
      title: "Social share image",
      type: "image",
      description: "Used when the page is shared (1200×630 recommended).",
      options: { hotspot: true },
    }),
  ],
});
