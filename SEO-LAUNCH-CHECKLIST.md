# Cali Terrain — SEO launch checklist

The site work is done. These are the things that **cannot** be done in code and
that now carry most of the remaining ranking weight. Local-pack studies put
Google Business Profile at roughly a third of local ranking, reviews and links
at another third combined — on-page (done) is about a fifth.

Do them roughly in this order.

## 1. Before you deploy

- [ ] Point the domain **caliterrain.in** at the Vercel project. Every canonical,
      the sitemap and all OG tags are already hardcoded to `https://caliterrain.in`.
      If the live domain ends up different, set `VITE_SITE_URL` in Vercel's
      environment variables — nothing else needs editing.
- [ ] Create a GA4 property and set `VITE_GA_ID=G-XXXXXXXXXX` in Vercel's
      environment variables. Analytics stays completely off until you do; there
      is no placeholder request going out.
- [ ] Confirm `https://caliterrain.in/sitemap.xml` and `/robots.txt` load.

## 2. Google Business Profile (biggest single lever)

- [ ] Claim / complete the profile.
- [ ] Primary category **Gym**; secondary **Physical fitness program** and
      **Personal trainer**.
- [ ] Name, address and phone must match `src/data/site.js` **character for
      character**: `SS Complex, 156/2, Sikh Rd, near DPS School, Diamond Point,
      Radha Swamy Colony, Bowenpally, Secunderabad, Telangana 500009` ·
      `+91 86884 58907`.
- [ ] Hours: Mon–Fri 05:00–11:00 and 17:00–22:00. Closed Sat/Sun.
- [ ] Website: `https://caliterrain.in`
- [ ] Upload 20+ photos (facility zones, coaches, kids batch, members training).
- [ ] Post weekly — a transformation, a batch update, an offer.
- [ ] Seed the Q&A section with the FAQ from the homepage and the fees FAQ from
      `/pricing`.

## 3. Fix the name/address inconsistencies off-site

Google cross-checks these. A conflicting address actively suppresses ranking.

- [ ] **FITPASS** lists Cali Terrain at "Gunrock Enclave" — get it corrected to
      the Bowenpally address.
- [ ] **Justdial** — verify the listing, correct NAP, add the website URL.
- [ ] **Fitternity** — same.
- [ ] Add/verify on Bing Places and Apple Business Connect.

## 4. Reviews

- [ ] Ask every trial attendee and every member for a Google review — send the
      review link over WhatsApp the same day as their session.
- [ ] Reply to every review, positive and negative.
- [ ] Target: 250+ reviews. (Review markup was deliberately removed from the
      site's structured data — Google treats self-reported ratings on a business
      you own as ineligible and can flag the whole schema block. The real star
      rating comes from the Business Profile.)

## 5. Search Console

- [ ] Verify `caliterrain.in` in Google Search Console and Bing Webmaster Tools.
- [ ] Submit `https://caliterrain.in/sitemap.xml`.
- [ ] Request indexing for `/`, `/programs`, `/pricing`, `/contact` and each of
      the 8 blog posts.
- [ ] Check the Core Web Vitals report after ~28 days of field data.

## 6. Links

- [ ] Get listed on allaboutcalisthenics.com's "Best Calisthenics Gyms in India".
- [ ] LBB Hyderabad, Whatshot Hyderabad, local news / community roundups.
- [ ] Instagram bio link → `https://caliterrain.in`.
- [ ] YouTube channel description and every video description → same link.
- [ ] Any coach's personal profile that lists where they coach.

---

## Two things on the site that need your decision

**1. Unverified percentages.** These read as hard data but are marked as
placeholders in the code:

- `src/data/home.js` → `RESULTS.outcomes`: "83% achieved their first pull-up",
  "67% unlocked a new skill within 6 months", "92% would recommend Caliterrain".
- `src/pages/Transformations.jsx` → the blue stat band: "90% Achieve First
  Pull-Up", "15kg Avg Weight Lost".

I left them exactly as they were because changing published claims is your call.
Invented statistics are the kind of thing that damages E-E-A-T if anyone checks,
and they're the first thing a competitor would screenshot. Either replace them
with numbers you can actually stand behind (a quick member survey would do it)
or drop those blocks — say which and it's a five-minute change.

**2. Weekend hours.** The site says closed Saturday and Sunday everywhere,
including in the schema and in a blog post that explains the reasoning. If that
is wrong, `src/data/site.js` → `HOURS` is the one place to fix it.
