import { Helmet } from "react-helmet-async";
import { NAP, HOURS, PRICE_RANGE, SITE_URL, SOCIAL } from "@/data/site";

const SITE_NAME = "Cali Terrain";
const BASE_DESC =
  "Coached calisthenics and bodyweight training gym in Bowenpally, Secunderabad";
const DEFAULT_OG_IMAGE = "/og-image.jpg";

// Stable @id anchors so every page's graph can reference the one business node
// instead of repeating (and risking contradicting) it.
const GYM_ID = `${SITE_URL}/#gym`;
const SITE_ID = `${SITE_URL}/#website`;

const abs = (p) =>
  /^https?:\/\//.test(p) ? p : `${SITE_URL}${p.startsWith("/") ? p : `/${p}`}`;

// JSON-LD goes into the document as a text child, so escape the three
// characters that would otherwise be HTML-escaped (and break JSON.parse) or
// close the <script> early. \u-escapes survive both parsers unchanged.
const ldJson = (obj) =>
  JSON.stringify(obj).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");

// Localities we actually draw members from — the areas people type after
// "calisthenics gym near".
const AREAS = [
  "Bowenpally",
  "Secunderabad",
  "Hyderabad",
  "Diamond Point",
  "Trimulgherry",
  "Marredpally",
  "Alwal",
  "Kompally",
  "Begumpet",
  "Paradise",
  "Karkhana",
  "Sainikpuri",
];

const offer = (name, price, unit) => ({
  "@type": "Offer",
  name,
  price,
  priceCurrency: "INR",
  availability: "https://schema.org/InStock",
  ...(unit && {
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price,
      priceCurrency: "INR",
      unitText: unit,
    },
  }),
});

// LocalBusiness / Gym node — the single biggest local-SEO asset on the site.
// Built from data/site.js so NAP, hours and prices can never drift from what
// the pages render. Deliberately carries no aggregateRating: Google treats
// self-serving review markup on LocalBusiness as ineligible for rich results.
function buildGym() {
  const [openMorning, closeMorning] = ["05:00", "11:00"];
  const [openEvening, closeEvening] = ["17:00", "22:00"];
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  return {
    "@type": "ExerciseGym",
    "@id": GYM_ID,
    name: NAP.name,
    description: `${BASE_DESC}. Kids and adult batches, skill coaching and personal training.`,
    url: SITE_URL,
    telephone: NAP.phoneTel,
    image: abs(DEFAULT_OG_IMAGE),
    logo: abs("/logo.png"),
    priceRange: PRICE_RANGE,
    currenciesAccepted: "INR",
    foundingDate: "2021",
    address: {
      "@type": "PostalAddress",
      streetAddress: NAP.street,
      addressLocality: NAP.locality,
      addressRegion: NAP.region,
      postalCode: NAP.postalCode,
      addressCountry: NAP.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: NAP.geo.lat, longitude: NAP.geo.lng },
    hasMap: NAP.mapUrl,
    areaServed: AREAS.map((name) => ({ "@type": "Place", name })),
    openingHours: HOURS.schema,
    openingHoursSpecification: [
      { open: openMorning, close: closeMorning },
      { open: openEvening, close: closeEvening },
    ].map(({ open, close }) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: weekdays,
      opens: open,
      closes: close,
    })),
    makesOffer: [
      offer("Group Training Membership", "3000", "MON"),
      offer("Personal Training Membership", "10000", "MON"),
      offer("Drop-In Session", "400", "session"),
    ],
    knowsAbout: [
      "Calisthenics",
      "Bodyweight training",
      "Pull-up progression",
      "Handstand training",
      "Muscle-up progression",
      "Kids fitness",
      "Mobility training",
      "HYROX preparation",
    ],
    sameAs: [SOCIAL.instagram],
  };
}

const buildWebSite = () => ({
  "@type": "WebSite",
  "@id": SITE_ID,
  url: SITE_URL,
  name: SITE_NAME,
  inLanguage: "en-IN",
  publisher: { "@id": GYM_ID },
});

// "Home › Blog › <post>" from the canonical path.
function buildBreadcrumbs(path) {
  const parts = path.split("/").filter(Boolean);
  if (!parts.length) return null;
  const label = (s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", url: SITE_URL }, ...parts.map((p, i) => ({
      name: label(p),
      url: `${SITE_URL}/${parts.slice(0, i + 1).join("/")}`,
    }))].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Per-route head tags + structured data.
 *
 * @param type    "gym" puts the full ExerciseGym node on the page (home and
 *                contact only — one authoritative copy, referenced elsewhere).
 * @param schema  extra JSON-LD nodes for this page (FAQPage, BlogPosting…).
 *                They're merged into a single @graph with the site nodes.
 */
export default function SEO({
  title,
  description,
  path = "",
  image,
  noindex = false,
  type = "page",
  schema = [],
}) {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `Calisthenics Gym in Hyderabad & Secunderabad | ${SITE_NAME}`;
  const desc =
    description ||
    `${BASE_DESC}. Kids & adult batches 5 AM–10 PM, from ₹3,000/month. Book a free trial and movement assessment.`;
  const clean = path.startsWith("/") ? path : path ? `/${path}` : "";
  const canonical = `${SITE_URL}${clean}` || SITE_URL;
  const ogImage = abs(image || DEFAULT_OG_IMAGE);

  // The full business node lives on / and /contact. Every other page carries a
  // minimal stub at the same @id so its `about`/`publisher` references resolve
  // within the page's own graph instead of dangling.
  const graph = [
    buildWebSite(),
    type === "gym"
      ? buildGym()
      : { "@type": "ExerciseGym", "@id": GYM_ID, name: NAP.name, url: SITE_URL },
    type !== "gym" && {
      "@type": "WebPage",
      url: canonical,
      name: fullTitle,
      description: desc,
      isPartOf: { "@id": SITE_ID },
      about: { "@id": GYM_ID },
    },
    buildBreadcrumbs(clean),
    ...schema,
  ].filter(Boolean);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index,follow,max-image-preview:large"}
      />
      <link rel="canonical" href={canonical} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type === "article" ? "article" : "website"} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />
      <script type="application/ld+json">
        {ldJson({ "@context": "https://schema.org", "@graph": graph })}
      </script>
    </Helmet>
  );
}

// Shared builders for pages that pass their own nodes through `schema`.
export const faqSchema = (items) => ({
  "@type": "FAQPage",
  mainEntity: items.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});

export const articleSchema = (post) => ({
  "@type": "BlogPosting",
  headline: post.title,
  description: post.excerpt,
  image: abs(post.cover_image),
  datePublished: post.created_at,
  dateModified: post.updated_at || post.created_at,
  author: { "@type": "Organization", name: post.author || SITE_NAME, url: SITE_URL },
  publisher: { "@id": GYM_ID },
  keywords: post.keywords?.join(", "),
  mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  inLanguage: "en-IN",
});
