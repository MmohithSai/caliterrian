import { defineType, defineField } from "sanity";

// Maps to Home.jsx JOURNEY_STEPS — ordered step + title + description.
export const journeyStep = defineType({
  name: "journeyStep",
  title: "Journey step",
  type: "object",
  fields: [
    defineField({
      name: "step",
      title: "Step label",
      type: "string",
      description: 'e.g. "01" or "Step 1"',
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "step" },
  },
});
