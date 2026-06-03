import { defineType, defineField } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { Dumbbell } from "lucide-react";

// Maps to src/pages/Programs.jsx PROGRAMS.
export const program = defineType({
  name: "program",
  title: "Program",
  type: "document",
  icon: Dumbbell,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "program" }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Emoji / icon",
      type: "string",
      description: "An emoji or lucide icon name shown on the card.",
    }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({
      name: "benefits",
      title: "Benefits",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({ name: "level", title: "Level", type: "string" }),
    defineField({ name: "ageGroup", title: "Age group", type: "string" }),
    defineField({ name: "outcome", title: "Outcome", type: "string" }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "level", media: "image" },
  },
});
