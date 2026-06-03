import { defineType, defineField } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { Users } from "lucide-react";

// Maps to src/pages/Coaches.jsx COACHES.
export const trainer = defineType({
  name: "trainer",
  title: "Trainer",
  type: "document",
  icon: Users,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "trainer" }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "role", title: "Role", type: "string" }),
    defineField({ name: "bio", title: "Bio", type: "text", rows: 4 }),
    defineField({
      name: "philosophy",
      title: "Training philosophy",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "specialties",
      title: "Specialties",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "certifications",
      title: "Certifications",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "experience",
      title: "Experience",
      type: "string",
      description: 'e.g. "8 years"',
    }),
    defineField({
      name: "membersTrained",
      title: "Members trained",
      type: "string",
      description: 'e.g. "300+"',
    }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "image" },
  },
});
