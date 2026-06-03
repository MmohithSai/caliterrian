import { defineType, defineField } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { CreditCard } from "lucide-react";

// Maps to Pricing.jsx G3/G5/P3/P5 plans.
export const membershipPlan = defineType({
  name: "membershipPlan",
  title: "Membership Plan",
  type: "document",
  icon: CreditCard,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "membershipPlan" }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: 'e.g. "Group 3-Day"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Group", value: "group" },
          { title: "Personal", value: "personal" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "subtitle", title: "Subtitle", type: "string" }),
    defineField({
      name: "highlight",
      title: "Highlight this plan?",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "tiers",
      title: "Price tiers",
      type: "array",
      of: [{ type: "planTier" }],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "features",
      title: "Features",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "category", highlight: "highlight" },
    prepare({ title, subtitle, highlight }) {
      return {
        title: highlight ? `★ ${title}` : title,
        subtitle: subtitle ? subtitle[0].toUpperCase() + subtitle.slice(1) : "",
      };
    },
  },
});
