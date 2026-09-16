# Cali Terrain — Redesign Status & Session Handoff

**Last updated:** 2026-06-06
**Branch:** `website-redesign`
**Purpose:** Single source of truth for the 2026 homepage redesign. Load this first
in a fresh session to recover full context. Companion docs:
- `REDESIGN_PLAN.md` — engineering/backend audit (architecture constraints).
- `POSITIONING_REDESIGN_PLAN.md` — positioning strategy (the emotional/sales spine).
- `CLEANUP_REPORT.md` — inventory of legacy code/assets orphaned by the redesign (for a later, approved cleanup pass).
- `REACTBITS_INTEGRATION.md` — React Bits animation layer (2026-06-12): SplitText/CountUp/SpotlightCard/Magnet/GlareHover/ClickSpark in `src/components/reactbits/`, wired into hero, Hall of Firsts, Results, Memberships, Final CTA and the app shell.

---

## 1. TL;DR — where things stand

The public **homepage has been fully rebuilt** into a 16-section, facility-first
design (+ a 17th "Visit Us" decision strip), styled in a new "Caliterrain Blue"
system. **Build, lint, and dev-server boot are all green.** Backend, lead capture,
admin, SEO, and analytics are untouched. No legacy code has been deleted yet
(deferred to an approved cleanup pass).

**What is NOT done yet:**
- Real photography — every facility/coach/member/video image is a labeled
  placeholder slot awaiting drop-in (by design).
- Other pages (`/programs`, `/coaches`, `/pricing`, `/contact`, `/gallery`,
  `/blog`, `/transformations`) were **not** redesigned — they only inherited the
  new color palette via a global token cascade.
- Legacy/dead code removal (see `CLEANUP_REPORT.md`) — parked pending homepage approval.
- Sanity CMS wiring — still deferred (content lives in local `src/data/home.js`).

---

## 2. Locked decisions

| Topic | Decision |
|---|---|
| **Target look** | Nike + Linear + Apple + premium sports-performance brand. `DesignReferences/*.png` are the **primary** visual reference. |
| **Accent ("Caliterrain Blue")** | `#2E8DFF` (hover `#1F6FE0`, ink `#04101F`) — replaced the old teal `#2EC4B6` everywhere. |
| **Palette** | bg `#0B1016`, surface `#131B25`, border `#1E2A38`, secondary text `#9AA7B6`, text white. Band variant `#0E141C`. |
| **Scope** | Rebuild homepage + cascade palette tokens globally (shell + all pages adopt the blue). Only the **homepage layout** was redesigned. |
| **Imagery** | Facility-first, **NO stock photography**. Final production layouts with labeled `.ct-media` slots (correct aspect ratios) so real photos drop in later. Existing exercise frames used ONLY to illustrate movements (Problem progression, Skill Tree popup) — never as facility/coach/member stand-ins. |
| **Content** | Reshape real data (`mockData`, `site.js`, real prices/coaches) into new sections. No invented prices, no invented hard percentages. |
| **Nav / sitemap** | Kept the **reference-image nav** (Home · The Path · Skill Tree · Programs · Coaches · Facility · Community · Pricing). Rejected the positioning doc's 5-item relabel + standalone `/the-system` page (conflicted with the references). |
| **Data shape** | Single `src/data/home.js` for now; split into Sanity-schema-shaped modules only when CMS wiring actually happens. |
| **Positioning doc reconciliation** | Its #1 conversion fix (Visit Us strip) was **added**. Everything else it asks for was already covered by the 16-section build. |

---

## 3. Homepage section order (`src/pages/Home.jsx`)

All sections route their CTAs through the global `onBookTrial` modal spine.

| # | Section | Component (file) | Notes |
|---|---|---|---|
| 1 | Hero | `HeroSection` (`home/intro.jsx`) | Facility panorama placeholder (no frames), headline "From Your First Pull-Up…", real trust stats from `site.js`. |
| 2 | The Problem | `ProblemSection` (`home/intro.jsx`) | Can't Hang→Push-Up→Pull-Up→Muscle-Up; uses pushup/muscleup stills. |
| 3 | The Caliterrain Path | `PathSection` (`home/intro.jsx`) | 6 stages Assessment→Mastery + 4 pillars. |
| 4 | Skill Tree | `SkillTreeSection` (`home/skills.jsx`) | **Interactive** node board + detail panel. |
| 5 | Hall of Firsts | `HallOfFirstsSection` (`home/skills.jsx`) | Reshaped from `TRANSFORMATIONS`. |
| 6 | Member Journeys | `MemberJourneysSection` (`home/skills.jsx`) | Timeline cards. |
| 7 | First Session | `FirstSessionSection` (`home/training.jsx`) | 5 steps + reassurance. |
| 8 | Training Disciplines | `DisciplinesSection` (`home/training.jsx`) | 9 disciplines → `/programs`. |
| 9 | Coaches | `CoachesSection` (`home/training.jsx`) | Outcome-first (Vidya Sagar, Lakpa). |
| 10 | Facility Experience | `FacilitySection` (`home/facility.jsx`) | Hotspot panorama + 10 zone cards (all placeholder slots). |
| 11 | Community | `CommunitySection` (`home/facility.jsx`) | Events/Workshops/Challenges/Meetups. |
| 12 | Why Members Stay | `WhyStaySection` (`home/facility.jsx`) | Real stats only (no fake %). |
| 13 | Testimonials | `TestimonialsSection` (`home/proof.jsx`) | Video-first; thumbnail slots; copy from `TESTIMONIALS`. |
| 14 | Memberships | `MembershipsSection` (`home/proof.jsx`) | Real prices verbatim; assessment highlighted. |
| 15 | FAQ | `FaqSection` (`home/proof.jsx`) | Accordion. |
| 15.5 | **Visit Us** | `VisitSection` (`home/visit.jsx`) | Map + hours + price-from + WhatsApp/Call (fires `whatsapp_click`/`call_click`). Positioning doc's #1 conversion fix. |
| 16 | Final CTA | `FinalCtaSection` (`home/proof.jsx`) | "You're Closer To A Muscle-Up Than You Think." |

---

## 4. File map

### New files (created by the redesign)
```
src/data/home.js                  All homepage content (reshaped real data + labeled placeholders)
src/components/home/anim.js       Shared framer-motion presets (reveal/stagger/vpOnce)
src/components/home/ui.jsx        Primitives: Section, Header, Heading, Eyebrow, MediaSlot
src/components/home/intro.jsx     Sections 1–3  (Hero, Problem, Path)
src/components/home/skills.jsx    Sections 4–6  (Skill Tree, Hall of Firsts, Member Journeys)
src/components/home/training.jsx  Sections 7–9  (First Session, Disciplines, Coaches)
src/components/home/facility.jsx  Sections 10–12 (Facility, Community, Why Stay)
src/components/home/proof.jsx     Sections 13–16 (Testimonials, Memberships, FAQ, Final CTA)
src/components/home/visit.jsx     Section 15.5  (Visit Us decision strip)
REDESIGN_STATUS.md                This handoff doc
CLEANUP_REPORT.md                 Legacy-asset inventory
```

### Modified files
```
src/pages/Home.jsx        Rewritten — composes the 17 section components (was an 895-line inline file)
src/components/Navbar.jsx Reference nav (anchors + routes); extra routes kept in mobile menu
src/index.css             @theme tokens + HSL vars retoned to blue; new "2026 REDESIGN" utility block (.ct-*)
src/App.css               Palette cascade (btn-primary/secondary, section-tag now blue)
+ every src/**/*.{jsx,js,css} touched by the global color sed-cascade (teal→blue, dark-hex swap)
```

### Key CSS utilities added (in `src/index.css`, "2026 REDESIGN" block)
`.ct-eyebrow` · `.ct-display` (two-tone heading) · `.ct-media` (+ `__label`, the labeled
photo placeholder) · `.ct-card` · `.ct-node` (skill tree) · `.ct-connector` · `.ct-ring`.

### Orphaned by the redesign (still present — see `CLEANUP_REPORT.md`)
`src/components/HeroScrollAnimation.jsx`, `src/lib/imageSequence.js`,
`src/lib/animations.js`, `public/running/`, `src/assets/hero*.png`,
`hero-composition-preview.png`, `public/transform-bg.webp`, + a block of dead CSS.
**Kept intentionally this phase.**

---

## 5. Hard constraints preserved (do NOT break)

- **`onBookTrial` global modal spine** — every CTA opens the one `TrialBookingModal`.
- **Form `name` attributes frozen** — Edge Functions read aliased keys
  (`program`→`preferred_program`, `goal`→`fitness_goal`, `preferred_time`→`preferred_slot`).
  Verified present/unchanged in `TrialBookingModal.jsx` and `Contact.jsx`.
- **Untouched:** `/admin/*`, Supabase RLS/migrations, Edge Functions, analytics event
  names (`book_trial_click`/`whatsapp_click`/`call_click`/`form_submit`), SEO `path` props + JSON-LD source.
- **Real prices only** — from `Pricing.jsx` (`G3/G5/P3/P5`, drop-in ₹400/₹900). No invented numbers.

---

## 6. Verification status

- `npm run build` → ✅ passes (2224 modules; Home chunk ~51 kB / 14 kB gzip).
- `npx eslint src/components/home src/pages/Home.jsx src/components/Navbar.jsx src/data/home.js` → ✅ clean.
- `npm run dev` → ✅ boots clean (Vite ready, no transform/runtime errors).
- No stray `#2EC4B6` / old dark hexes remain in `src`.
- No test/config file references any orphaned item.

**Not yet done:** visual QA in a real browser (screenshots), Lighthouse, mobile pass.

---

## 7. Pending / next steps

1. **Review the redesigned homepage** (browser, desktop + mobile).
2. **Drop in real assets** into the labeled `.ct-media` slots: hero panorama,
   10 facility-zone photos + wide panorama, 2 coach portraits, 6 Hall-of-Firsts
   photos, 2 journey photos, 3 testimonial video thumbnails, community photos.
3. **Approve → run the cleanup pass** per `CLEANUP_REPORT.md` (its own PR).
4. *(Optional, later)* redesign the remaining pages to match; wire Sanity CMS
   (split `home.js` into schema-shaped modules at that point).

---

## 8. Task status (as of this doc)

```
[x] #1  Color/palette token cascade
[x] #2  Home content data modules (src/data/home.js)
[x] #3  16 homepage section components
[x] #4  Home.jsx rewrite + Navbar anchors
[x] #5  Build + lead-capture verified
[x] #6  Visit Us decision strip
[x] #7  Legacy cleanup report (CLEANUP_REPORT.md)
[ ] #8  Deferred: legacy cleanup pass  (blocked on homepage approval)
[x] #9  This handoff doc
```

---

## 9. How to resume in a fresh session

1. Read this file, then `CLEANUP_REPORT.md`.
2. `git status` / `git log` on branch `website-redesign` to see uncommitted work.
3. Homepage entry: `src/pages/Home.jsx` → sections in `src/components/home/*`.
4. All homepage copy/data: `src/data/home.js`.
5. Design tokens: `@theme` + "2026 REDESIGN" block in `src/index.css`; buttons in `src/App.css`.
6. Run `npm run dev` to view; `npm run build && npx eslint src` to validate.
