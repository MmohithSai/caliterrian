import { Helmet } from "react-helmet-async";

const SITE_NAME = "Cali Terrain";
const BASE_DESC = "Premium Calisthenics & Bodyweight Training Gym in Secunderabad, Hyderabad";
const LOGO_URL = "/logo.png";
// Canonical origin. Update to the production domain at launch.
const SITE_URL = "https://caliterrain.com";

export default function SEO({ title, description, path = "" }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Calisthenics Gym in Secunderabad, Hyderabad`;
  const desc = description || `${BASE_DESC}. Build real strength, mobility and athleticism with expert coaching. Kids & Adults programs. Book a FREE trial today!`;
  const canonical = `${SITE_URL}${path.startsWith("/") ? path : path ? `/${path}` : ""}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={LOGO_URL} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={LOGO_URL} />
    </Helmet>
  );
}
