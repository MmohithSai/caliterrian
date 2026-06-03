import { defineType, defineField } from "sanity";
import { CalendarClock } from "lucide-react";

// Batch timings. Maps to Pricing.jsx GM/GE/PM/PE arrays.
export const scheduleSettings = defineType({
  name: "scheduleSettings",
  title: "Schedule / Timings",
  type: "document",
  icon: CalendarClock,
  fields: [
    defineField({
      name: "groupMorning",
      title: "Group — morning batches",
      type: "array",
      of: [{ type: "string" }],
      description: 'e.g. "6:00 AM – 7:00 AM"',
    }),
    defineField({
      name: "groupEvening",
      title: "Group — evening batches",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "personalMorning",
      title: "Personal — morning batches",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "personalEvening",
      title: "Personal — evening batches",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Schedule / Timings" }),
  },
});
