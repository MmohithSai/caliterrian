import { defineType, defineField } from "sanity";

// A core-value entry on the About page (maps to aboutPage.values).
export const valueItem = defineType({
  name: "valueItem",
  title: "Value",
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
  ],
  preview: {
    select: { title: "title", subtitle: "description" },
  },
});
