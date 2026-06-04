import { Helmet } from "react-helmet-async";
import { NAP, HOURS, RATING, PRICE_RANGE, SOCIAL } from "@/data/site";

const SITE_NAME = "Cali Terrain";
const BASE_DESC = "Premium Calisthenics & Bodyweight Training Gym in Secunderabad, Hyderabad";
// Canonical origin. Update to the production domain at launch.
const SITE_URL = "https://caliterrain.com";
// Social share image. Uses the logo until a real 1200×630 /og-image.jpg is
// exported and dropped into public/ at launch — then point this at it.
const DEFAULT_OG_IMAGE = "/logo.png";

const abs = (p) =>
  /^https?:\/\//.test(p) ? p : `${SITE_URL}${p.startsWith("/") ? p : `/${p}`}`;

// LocalBusiness / Gym structured data — the single biggest local-SEO win for
// a gym. Built once from the shared site.js so NAP/hours/rating never drift
// from what the pages render.
function buildJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ExerciseGym",
    name: NAP.name,
    description: BASE_DESC,
    url: SITE_URL,
    telephone: NAP.phoneTel,
    image: abs(DEFAULT_OG_IMAGE),
    logo: abs("/logo.png"),
    priceRange: PRICE_RANGE,
    address: {
      "@type": "PostalAddress",
      streetAddress: NAP.street,
      addressLocality: NAP.locality,
      addressRegion: NAP.region,
      postalCode: NAP.postalCode,
      addressCountry: NAP.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: NAP.geo.lat,
      longitude: NAP.geo.lng,
    },
    openingHours: HOURS.schema,
    sameAs: [SOCIAL.instagram],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: RATING.value,
      reviewCount: RATING.count,
    },
  };
}

export default function SEO({ title, description, path = "", image, noindex = false }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Calisthenics Gym in Secunderabad, Hyderabad`;
  const desc = description || `${BASE_DESC}. Build real strength, mobility and athleticism with expert coaching. Kids & Adults programs. Book a FREE trial today!`;
  const canonical = `${SITE_URL}${path.startsWith("/") ? path : path ? `/${path}` : ""}`;
  const ogImage = abs(image || DEFAULT_OG_IMAGE);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonical} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />
      <script type="application/ld+json">{JSON.stringify(buildJsonLd())}</script>
    </Helmet>
  );
}
