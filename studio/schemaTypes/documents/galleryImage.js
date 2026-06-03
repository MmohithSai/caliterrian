import { defineType, defineField } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { Image as ImageIcon } from "lucide-react";

// Maps to src/data/mockData.js GALLERY.
export const galleryImage = defineType({
  name: "galleryImage",
  title: "Gallery Image",
  type: "document",
  icon: ImageIcon,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "galleryImage" }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      description: "Optional — filter the gallery by category.",
    }),
  ],
  preview: {
    select: { title: "caption", subtitle: "category", media: "image" },
    prepare({ title, subtitle, media }) {
      return { title: title || "(no caption)", subtitle, media };
    },
  },
});
