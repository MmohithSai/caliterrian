// Shared object types
import { seo } from "./objects/seo.js";
import { socialLink } from "./objects/socialLink.js";
import { stat } from "./objects/stat.js";
import { whyUsItem } from "./objects/whyUsItem.js";
import { journeyStep } from "./objects/journeyStep.js";
import { planTier } from "./objects/planTier.js";
import { valueItem } from "./objects/valueItem.js";

// Singletons
import { siteSettings } from "./singletons/siteSettings.js";
import { homePage } from "./singletons/homePage.js";
import { aboutPage } from "./singletons/aboutPage.js";
import { scheduleSettings } from "./singletons/scheduleSettings.js";

// Document collections
import { trainer } from "./documents/trainer.js";
import { membershipPlan } from "./documents/membershipPlan.js";
import { program } from "./documents/program.js";
import { testimonial } from "./documents/testimonial.js";
import { successStory } from "./documents/successStory.js";
import { blogPost } from "./documents/blogPost.js";
import { faq } from "./documents/faq.js";
import { galleryImage } from "./documents/galleryImage.js";

export const schemaTypes = [
  // objects
  seo,
  socialLink,
  stat,
  whyUsItem,
  journeyStep,
  planTier,
  valueItem,
  // singletons
  siteSettings,
  homePage,
  aboutPage,
  scheduleSettings,
  // documents
  trainer,
  membershipPlan,
  program,
  testimonial,
  successStory,
  blogPost,
  faq,
  galleryImage,
];
