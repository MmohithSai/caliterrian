import { defineType, defineField } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { HelpCircle } from "lucide-react";

// Maps to the FAQ block in src/pages/Home.jsx.
export const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  icon: HelpCircle,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "faq" }),
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      description: "Optional — group FAQs on different pages.",
    }),
  ],
  preview: {
    select: { title: "question", subtitle: "category" },
  },
});
