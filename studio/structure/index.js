import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import {
  Cog,
  Home,
  Info,
  CalendarClock,
  Users,
  CreditCard,
  Dumbbell,
  Star,
  Trophy,
  Newspaper,
  HelpCircle,
  Image as ImageIcon,
} from "lucide-react";

// A singleton list item: opens the one-and-only document of `type` directly,
// instead of a "create new" collection list.
const singleton = (S, type, title, icon) =>
  S.listItem()
    .title(title)
    .id(type)
    .icon(icon)
    .child(S.document().schemaType(type).documentId(type).title(title));

export const structure = (S, context) =>
  S.list()
    .title("Content")
    .items([
      // ---- Singletons (site-wide / page content) ----
      singleton(S, "siteSettings", "Site Settings", Cog),
      singleton(S, "homePage", "Home Page", Home),
      singleton(S, "aboutPage", "About Page", Info),
      singleton(S, "scheduleSettings", "Schedule / Timings", CalendarClock),

      S.divider(),

      // ---- Orderable collections (drag to reorder in the owner's UI) ----
      orderableDocumentListDeskItem({
        type: "trainer",
        title: "Trainers",
        icon: Users,
        S,
        context,
      }),
      orderableDocumentListDeskItem({
        type: "membershipPlan",
        title: "Membership Plans",
        icon: CreditCard,
        S,
        context,
      }),
      orderableDocumentListDeskItem({
        type: "program",
        title: "Programs",
        icon: Dumbbell,
        S,
        context,
      }),
      orderableDocumentListDeskItem({
        type: "testimonial",
        title: "Testimonials",
        icon: Star,
        S,
        context,
      }),
      orderableDocumentListDeskItem({
        type: "faq",
        title: "FAQs",
        icon: HelpCircle,
        S,
        context,
      }),
      orderableDocumentListDeskItem({
        type: "galleryImage",
        title: "Gallery",
        icon: ImageIcon,
        S,
        context,
      }),

      S.divider(),

      // ---- Non-orderable collections (sorted by date / featured) ----
      S.documentTypeListItem("successStory").title("Success Stories").icon(Trophy),
      S.documentTypeListItem("blogPost").title("Blog Posts").icon(Newspaper),
    ]);
