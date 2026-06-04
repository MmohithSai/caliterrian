// Single source of truth for business identity, contact (NAP), hours,
// headline stats and social links. Every page, the Footer, the Contact
// section and the SEO JSON-LD read from here so these facts can never
// drift apart across the site.

// ── Name · Address · Phone (NAP) ────────────────────────────────────────────
export const NAP = {
  name: "Cali Terrain",
  // Phone in the three shapes the site needs:
  phoneDisplay: "+91 86884 58907", // human-readable
  phoneTel: "+918688458907",       // tel: links / schema telephone
  phoneRaw: "918688458907",        // wa.me links

  // Structured address (schema.org PostalAddress).
  street: "SS Complex, 156/2, Sikh Rd, near DPS School, Diamond Point, Radha Swamy Colony, Bowenpally",
  locality: "Secunderabad",
  region: "Telangana",
  postalCode: "500009",
  country: "IN",

  // Pre-split lines for multi-line display (Footer / Contact card).
  addressLines: [
    "SS Complex, 156/2, Sikh Rd, near DPS School,",
    "Diamond Point, Radha Swamy Colony, Bowenpally,",
    "Secunderabad, Telangana 500009",
  ],

  geo: { lat: 17.46405843617763, lng: 78.48165189088192 },

  // Google Maps embed (shared by Contact + any "Visit Us" strip).
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15223.636890171589!2d78.48165189088192!3d17.46405843617763!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9ba4c0920139%3A0x802664c3d60b7e12!2sCali%20Terrain!5e0!3m2!1sen!2sin!4v1772995355729!5m2!1sen!2sin",
};

// ── Opening hours ───────────────────────────────────────────────────────────
// Two batches per day, all seven days.
export const HOURS = {
  morning: "5:00 AM – 11:00 AM",
  evening: "5:00 PM – 10:00 PM",
  days: "Mon – Sun",
  // schema.org openingHours strings.
  schema: ["Mo-Su 05:00-11:00", "Mo-Su 17:00-22:00"],
};

// ── Headline stats (consistent across Home / Transformations / About) ────────
export const STATS = [
  { value: "500+", label: "Members Trained" },
  { value: "9+", label: "Years Experience" },
  { value: "12", label: "Training Programs" },
  { value: "4.9", label: "Google Rating" },
];

// The single members-trained figure, reused wherever "500+" appears so the
// headline number stays identical across pages.
export const MEMBERS_TRAINED = STATS[0].value;

export const RATING = { value: "4.9", count: 137 };
export const PRICE_RANGE = "₹₹";

// ── Social / contact links ──────────────────────────────────────────────────
export const SOCIAL = {
  instagram: "https://instagram.com/caliterrain",
  instagramHandle: "@caliterrain",
};

// Helper builders so the phone number lives in exactly one place.
export const telLink = () => `tel:${NAP.phoneTel}`;
export const waLink = (text = "Hi, I want to know more about Cali Terrain.") =>
  `https://wa.me/${NAP.phoneRaw}?text=${encodeURIComponent(text)}`;
