import { defineType, defineField } from "sanity";
import { Cog } from "lucide-react";

// Global brand + contact info. De-duplicates phone/address/socials that are
// currently scattered across ChatBot.jsx, Footer.jsx, Contact.jsx.
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: Cog,
  groups: [
    { name: "brand", title: "Brand", default: true },
    { name: "contact", title: "Contact" },
    { name: "social", title: "Social" },
  ],
  fields: [
    defineField({
      name: "gymName",
      title: "Gym name",
      type: "string",
      group: "brand",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      group: "brand",
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      group: "brand",
      options: { hotspot: true },
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "whatsapp",
      title: "WhatsApp number",
      type: "string",
      description: "Digits only, with country code (e.g. 919876543210).",
      group: "contact",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      group: "contact",
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: "address",
      title: "Address",
      type: "text",
      rows: 3,
      group: "contact",
    }),
    defineField({
      name: "googleMapsUrl",
      title: "Google Maps URL",
      type: "url",
      group: "contact",
    }),
    defineField({
      name: "googleRating",
      title: "Google rating",
      type: "number",
      group: "contact",
      validation: (Rule) => Rule.min(0).max(5),
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      group: "social",
      of: [{ type: "socialLink" }],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});
