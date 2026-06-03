import { defineType, defineField } from "sanity";

// Maps to Home.jsx WHY_US — title + description + an icon name.
export const whyUsItem = defineType({
  name: "whyUsItem",
  title: "Why-us item",
  type: "object",
  fields: [
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
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      description:
        'lucide-react icon name (e.g. "Dumbbell", "HeartPulse", "Trophy"). Must match an icon used in the frontend icon map.',
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "icon" },
  },
});
