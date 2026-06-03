import { defineType, defineField } from "sanity";

// A single duration/price row inside a membershipPlan (maps to the
// G3/G5/P3/P5 price tiers).
export const planTier = defineType({
  name: "planTier",
  title: "Price tier",
  type: "object",
  fields: [
    defineField({
      name: "duration",
      title: "Duration",
      type: "string",
      description: 'e.g. "1 Month", "3 Months", "Annual"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      initialValue: "₹",
    }),
  ],
  preview: {
    select: { duration: "duration", price: "price", currency: "currency" },
    prepare({ duration, price, currency }) {
      return {
        title: duration,
        subtitle: `${currency || "₹"}${price ?? ""}`,
      };
    },
  },
});
