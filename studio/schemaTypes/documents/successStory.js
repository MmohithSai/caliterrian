import { defineType, defineField } from "sanity";
import { Trophy } from "lucide-react";

// Maps to src/data/mockData.js TRANSFORMATIONS.
export const successStory = defineType({
  name: "successStory",
  title: "Success Story",
  type: "document",
  icon: Trophy,
  orderings: [
    {
      title: "Featured, then newest",
      name: "featuredDateDesc",
      by: [
        { field: "featured", direction: "desc" },
        { field: "date", direction: "desc" },
      ],
    },
  ],
  fields: [
    defineField({
      name: "memberName",
      title: "Member name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "achievementType",
      title: "Achievement type",
      type: "string",
      description: 'e.g. "Weight loss", "Muscle gain", "First muscle-up"',
    }),
    defineField({ name: "summary", title: "Summary", type: "string" }),
    defineField({
      name: "testimonial",
      title: "Testimonial",
      type: "text",
      rows: 4,
    }),
    defineField({ name: "date", title: "Date", type: "date" }),
    defineField({
      name: "featured",
      title: "Featured?",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "beforeImage",
      title: "Before image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "afterImage",
      title: "After image",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: "memberName", subtitle: "achievementType", media: "afterImage" },
  },
});
