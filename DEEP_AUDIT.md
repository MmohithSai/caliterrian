# Cali Terrain — Deep Audit (Agency / Awwwards Review)

**Reviewed by (composite lens):** Senior Frontend Architect · Senior UX Designer · Creative Director · Awwwards Judge · GSAP/Framer Motion Motion Designer · Accessibility Specialist · Performance Engineer · CRO Specialist · Senior Code Reviewer
**Date:** 2026-06-04
**Stack:** React 19.2 · Vite 8 · Tailwind v4 (`@theme`) · Framer Motion 12 · React Router 7 · react-helmet-async · Supabase (Edge Functions) · Sanity Studio (separate, deferred)
**Build:** Compiles. **19 ESLint errors / 1 warning in `src/`.** No route code-splitting (single bundle). ~34 MB `public/`.

> This supersedes/extends `FRONTEND_AUDIT.md` (2026-06-03). Since that doc: the `app/` duplicate is **deleted ✅**, `TrialBookingModal` and `Contact` now **persist to Supabase Edge Functions ✅** (the "silent data loss" C4 is largely resolved). Still open from that audit: **C1/C2 (SPA fallback + 404 route), H1 (useScrollReveal deps), H2 (eager frame loads), H4 (no code-split), H5 (modal a11y), M1 (SEO schema), M3 (contrast)**. New deeper findings below.

---

# PHASE 1 — Project Architecture

**Two apps in one tree:** the public marketing SPA (`src/`) and a lazy-loaded admin (`src/admin/*`, code-split via `App.jsx:22`). A Sanity Studio (`studio/`) and Supabase backend (`supabase/`) exist but the public site reads from **local `mockData.js`**, not the CMS (Phase 3 frontend-reads deferred per project memory).

**Routing** (`src/App.jsx`): `BrowserRouter`. Public routes: `/`, `/programs`, `/coaches`, `/transformations`, `/blog`, `/blog/:id`, `/gallery`, `/pricing`, `/contact`. Admin: `/admin/*`. **No `path="*"` catch-all.** `/admin` branch renders without public chrome — clean separation.

**Animation systems (3 distinct):**
1. **Scroll-driven `<canvas>` image-sequence engine** — `src/lib/imageSequence.js` (`useImageSequenceCanvas`). Drives the hero (66 frames, `hero-cinematic-pre`) + Training Programs (90 frames) + Why-Us (240 frames). Each instance = its own `useScroll` + `useSpring` + RAF + full frameset preload.
2. **Framer Motion** — variants in `src/lib/animations.js` (`fadeUp`, `staggerContainer`, `scaleIn`, `useSectionScroll`, …) + per-component `whileHover`/`whileInView`/scroll transforms.
3. **CSS** — `index.css` keyframes (`stat-sheen`, `float-pulse`, `hero-scroll-pulse`) + hover transitions on `.interactive-card`, `.premium-program-card`, `.kinetic-button`, `.transform-card`, `.step-card`.

**Design system:** `@theme` tokens in `index.css` (`--color-obsidian #0A0A0A`, `--color-volt #2EC4B6`, fonts Bebas Neue / Manrope) + component classes in `App.css` (`.btn-primary/.btn-secondary/.section-tag`). In practice the brand teal is written as the **hardcoded literal `#2EC4B6` hundreds of times** rather than via tokens.

**External libs:** framer-motion, lucide-react, react-router-dom, react-helmet-async, sonner, @supabase/supabase-js. **Installed but unused in `src/`:** `@radix-ui/react-{accordion,dialog,select}`, `axios`, `clsx`, `tailwind-merge` (the latter two only via `lib/utils.js` `cn`, check usage).

**Perf-sensitive areas:** the 3 canvas sections (396 total JPG frames eager-loaded on `/`), the 400vh hero + 2×240vh sticky sections (~9 viewport-heights of scroll on the homepage), multiple always-on infinite animations.

---

# PHASE 2 — Component Inventory

Scores: **Maint** = maintainability, **Reuse** = reusability, **Debt** = technical debt (1 low … 5 high).

| Component | Purpose | Used In | Key Deps | Animation | Problems | Maint | Reuse | Debt |
|---|---|---|---|---|---|---|---|---|
| `App` / `AppContent` | Router + global chrome | root | router, helmet | — | no `*` route; bookingOpen lifted ok | 4 | — | 2 |
| `HeroScrollAnimation` | 400vh cinematic hero | Home | imageSequence, FM | canvas seq + ~30 scroll transforms + per-letter reveal | **no reduced-motion fallback (all 4 phases + intro + brand overlap)**; two CTA stacks; invisible `h1`; magic-number phase sync | 2 | 1 | 5 |
| `useImageSequenceCanvas` | scroll→canvas frames | hero + 2 sections | FM useSpring | RAF blit + crossfade | 3 render modes (1 dead); `getBoundingClientRect` per frame; eager preload; `set-state-in-effect` | 2 | 3 | 4 |
| `Home` + sections | landing | `/` | FM, imageSequence | every section animated | very long file (918 lines); local `useScrollReveal`; 880vh+ scroll | 3 | 2 | 3 |
| `Navbar` | top nav | all public | router | scroll bg swap | toggle has no `aria-label`/`aria-expanded`; no scroll-lock; `scrollTo` in effect | 4 | 3 | 2 |
| `Footer` | footer | all public | router, icons | hover slides | inline `onMouseEnter` style mutation (IG); `zinc-600` contrast | 4 | 3 | 2 |
| `FloatingButtons` | WA/Call/IG FABs | all public | FM | spring entrance, pulse | overlaps ChatBot zone on mobile; always-on pulse | 4 | 3 | 2 |
| `ChatBot` | fake assistant | all public | lucide | typing dots | **hardcoded "AI Assistant," no backend**; `Date.now()` ids; `set-state-in-effect` | 3 | 2 | 3 |
| `TrialBookingModal` | lead capture | App | supabase, sonner | — | **no dialog a11y** (role/esc/trap/scroll-lock); good honeypot + persist ✅ | 4 | 4 | 2 |
| `SpinWheel` | discount gimmick | Pricing | icons | CSS rotate | **no dialog a11y**; `wheelRef` unused; infinite spins | 3 | 2 | 3 |
| `SEO` | meta tags | every page | helmet | — | accepts `path` but **never emits canonical** (lint error); og:image=logo; no JSON-LD | 4 | 4 | 2 |
| `icons.jsx` | brand SVGs | footer/FABs | — | — | fine | 5 | 5 | 1 |
| `ui/sonner` | toast wrapper | App | sonner | — | fine | 5 | 5 | 1 |
| Pages (`Programs/Coaches/Transformations/Blog/BlogPost/Gallery/Contact/Pricing`) | content | routes | router, FM | scroll-fade + FM | **each redefines `useScrollReveal` (6× with deps-array bug)**; stock imagery; `zinc-500/600` | 3 | 2 | 3 |

---

# PHASE 3 — Design Audit (section by section)

### Hero (`HeroScrollAnimation`, 400vh)
- **Purpose:** cinematic brand moment — a muscle-up rep mapped to scroll with a broadcast HUD (HOLD → DRIVE → BREAK THROUGH → ABOVE) resolving into the CALITERRAIN wordmark + CTAs.
- **Strengths:** the pre-graded-frame canvas approach is technically smart (blit + single crossfade = silky); the phase HUD letter-cascade is genuinely premium; intro EVOLUTION mark fills the cold-start.
- **Weaknesses:** **400vh is enormous** — four full screen-heights of scroll deliver zero information (the HUD is pure mood). The real value prop (free trial, price, location) is buried below it plus two more 240vh canvas sections. **Visual hierarchy:** at `scroll=0` the only `<h1>` (CALITERRAIN) is `opacity:0`; the visible "headline" is an `<img>` alt. **Two stacked CTA layers** both live in the DOM/tab order.
- **Typography:** Bebas Neue condensed all-caps — cohesive but the single most generic gym typeface. **Mobile:** `.hero-phase-headline` is `white-space:nowrap` at `14vw`; "BREAK THROUGH." can overflow on ≤360px. `h-screen` (not `dvh`) jumps with mobile browser chrome.
- **Accessibility:** **reduced-motion has no static fallback** (see Phase 8/13) — all four phases + intro + brand render simultaneously, opacity-uncontrolled.

### Stats bar (teal, `Home.jsx:874`)
- Good contrast (white on teal), `stat-sheen` sweep. But values (`500+`, `9+`, `12`, `4.9`) are unverified and **conflict with other pages** (Coaches lists 500+ and 300+ trained = 800; Transformations claims "90% achieve first pull-up", "15kg avg lost"). Inconsistent proof erodes trust.

### Training Programs (240vh sticky canvas, push-up frames)
- Strong concept (cards reveal as the rep peaks). But 6 cards + heading + CTA crammed into a sticky `h-screen` over a cropped landscape canvas — on mobile the athlete is cropped to noise and the choreography is lost. `zinc-400` body is borderline.

### Why Train With Us (240vh sticky canvas, 240 running frames)
- **240 frames (4.1 MB) for a background runner is excessive.** 6 cards in a `lg:grid-cols-6` row become unreadable 2-col on mobile. Same sticky-cramping issue.

### Member Transformations
- **The single weakest section for a conversion site:** a "transformations" block with **no before/after photos** — just initials avatars + an `aspect-[16/9]` Trophy icon placeholder (`Transformations.jsx:62`). Social proof with no images is the least persuasive form of proof.

### Journey / Testimonials / Pricing teaser / FAQ / Final CTA
- Clean, consistent, well-animated. **Testimonials** float infinitely (6 cards, always animating). **Pricing featured card** animates `box-shadow` on an infinite loop (paint cost, see Phase 7). **FAQ** answer is capped at `max-height:180px` (`index.css:229`) — longer answers clip. Final CTA (teal, `Book Free Trial` + `WhatsApp`) is the strongest, clearest moment on the page.

### Color & spacing (global)
- **Monochromatic teal-on-obsidian.** Cohesive but one-note — no secondary/warm accent for human/emotional beats. Teal is used for accents, CTAs, borders, glows, prices, progress bars, scrollbar — everything, which flattens hierarchy (when everything glows, nothing leads). Spacing/rhythm (`py-24`, `max-w-7xl`, `section-divider`) is consistent and professional. `--radius:2px` sharp corners are a deliberate, consistent choice.

---

# PHASE 4 — Motion Audit

| # | Location | Purpose | Trigger | Duration / Easing | Perf cost | UX impact | Premium | Improve |
|---|---|---|---|---|---|---|---|---|
| 1 | `HeroScrollAnimation` canvas seq | rep→scroll | scroll | spring(70/26/.45) | **High** (RAF blit, 66 frames, gBCR/frame) | High wow / high scroll-tax | 9/10 | shorten to ~250vh; cache rect |
| 2 | Hero per-letter cascade (`HeroLetter`) | headline build | scroll window | transform | Low-mid (many motion vals) | premium | 9/10 | keep; gate offscreen |
| 3 | Programs canvas (90f) | reveal cards | scroll, 240vh | spring | Mid-high | medium | 7/10 | lazy-mount near viewport |
| 4 | Why-Us canvas (240f) | runner bg | scroll, 240vh | spring | **High** (240 JPG) | low payoff | 6/10 | downsample to ~60–90 |
| 5 | `interactive-card` / `premium-program-card` hover | depth | hover | 220–300ms | Low (transform) | good | 8/10 | keep |
| 6 | Testimonials float | life | mount | 3s ∞ ×6 | Low (transform) but **always on** | filler | 5/10 | pause when offscreen |
| 7 | Pricing featured `boxShadow` pulse | emphasis | mount | 3.6s ∞ | **Mid (paint, box-shadow ∞)** | filler | 4/10 | use opacity glow layer |
| 8 | `stat-sheen` sweep | shine | mount | 5.5s ∞ | Low-mid (transform on gradient) | nice | 6/10 | keep, pause offscreen |
| 9 | `FloatingButtons` pulse + spring in | attention | mount | spring + 2s ∞ | Low | good | 7/10 | keep |
| 10 | `kinetic-button` sheen | hover shine | hover | 500ms | Low | good | 8/10 | keep |
| 11 | Gift `animate-bounce` (Pricing) | draw eye | mount | ∞ | Low | gimmicky | 4/10 | subtle pulse instead |
| 12 | Section scroll parallax (`useSectionScroll`) | depth | scroll | spring | Low-mid | subtle | 7/10 | keep |

**Theme:** strong signature motion (1,2,10) drowned by always-on filler loops (6,7,8,11). Several infinite animations run even when the section is off-screen → constant idle repaint.

---

# PHASE 5 — User Journey Audit

`Landing → Hero (400vh mood) → Stats → Programs (240vh) → Why-Us (240vh) → Transformations (no photos) → Journey → Testimonials → Pricing teaser → FAQ → Final CTA`

- **Landing:** EVOLUTION mark + tagline + 2 CTAs is a clean first frame. ✅
- **Friction #1 — scroll tax:** ~880vh before any concrete benefit. A local gym's visitors (mostly mobile, checking *price / timing / location / legitimacy*) must scroll through 9 screen-heights of cinematic mood first. **Highest drop-off risk.**
- **Friction #2 — trust gap:** coach photos are stock models (not the real coaches), transformations have no photos, gallery is stock of other gyms. The proof layer reads as a template.
- **Confusion:** ChatBot says "AI Assistant • Usually replies instantly" but is hardcoded keyword matching → answers can feel evasive; sets a false expectation.
- **Missed opportunity:** location/timings/price (the actual decision factors) only surface on `/pricing` and the footer — never elevated on the home journey.

---

# PHASE 6 — Conversion Audit

**CTA placement:** `Book Free Trial` is everywhere (hero ×2, navbar, floating FAB, every page, footer) — good ubiquity, but **no single-field fast path** (just name+phone+WhatsApp would convert higher than the multi-field modal).
**Copy:** strong and benefit-led ("Master your body," "No commitment. Just come, train…"). ✅
**Forms:** `TrialBookingModal` + `Contact` are now well-built — honeypot, Supabase persist, WhatsApp continuation, success state. ✅ Biggest remaining gap is **no analytics/event tracking** on any CTA → you cannot measure or A/B anything.

**Biggest conversion killers**
1. **Decision info buried** (price/timing/location below 880vh). *Fix:* a compact "Visit us" strip (map mini + hours + price-from + 1-tap WhatsApp) high on `/`. *Impact: High.*
2. **Fake/stock proof** (coaches, transformations, gallery). *Fix:* real photos + at least 3 real before/after. *Impact: Very High* — this is the trust hinge.
3. **No analytics** (GA4/Meta pixel + CTA events). *Fix:* add tracking. *Impact: High (enables all other CRO).* 
4. **Inconsistent stats** across pages. *Fix:* one source of truth. *Impact: Medium.*
5. **ChatBot over-promises.** *Fix:* label "Quick Help" not "AI Assistant," or wire to WhatsApp. *Impact: Medium.*

---

# PHASE 7 — Performance Audit

| File | Problem | Impact | Fix | Est. gain |
|---|---|---|---|---|
| `App.jsx` | All 9 pages imported eagerly; only admin lazy. No `manualChunks` in `vite.config.js` | Whole site (FM + canvas engine + all pages) in one initial chunk | `React.lazy` per route + `Suspense` | −40–55% initial JS |
| `imageSequence.js:480` | All 3 sections preload **396 JPG frames** on `/` mount regardless of viewport | ~19 MB / 396 requests at first paint | Lazy-mount sections / gate loader behind `IntersectionObserver` | Massive on mobile/3G |
| `Home.jsx:311` | Why-Us = **240 frames** for a bg runner | 4.1 MB for low payoff | Downsample to 60–90; WebP/AVIF | −60–75% that section |
| `imageSequence.js:295` | `getBoundingClientRect()` every scroll frame (hero-cinematic-pre) | Layout read in RAF (thrash risk) | Cache rect on resize | Smoother scroll |
| `Home.jsx` testimonials/pricing | Infinite `y`/`box-shadow` loops run **off-screen** | Idle CPU/paint | Pause via `whileInView`/`useInView` | Lower idle CPU |
| `public/hero/*.mp4` | `muscle-up-hero.mp4` (5.4MB) + `pullup-hero.mp4` (7MB) **unreferenced** | 12 MB dead weight in deploy | Delete | −12 MB |
| `public/pullup/` | 30 frames (~1.4MB) **unreferenced** (the `pullup` grep hit is a program *id*, not the folder) | dead weight | Delete | −1.4 MB |
| Pages ×6 | `useScrollReveal` with **no deps array** → new `IntersectionObserver` every render | Wasted work on every filter click / keystroke | Add `[]` / shared hook | Cheap, real |
| `imageSequence.js` | Dead `drawCinematicFrame` + `hero-cinematic` mode (~150 lines) + `driftLoop` | Bundle + maintenance | Delete | −few KB, big clarity |
| Global | `scroll-behavior:smooth` + `scrollTo(0,0)` in effects | Animated scroll-to-top jank on nav | Scope smooth to anchors; instant on route change | UX |
| Hero | `ready` gate shows "Loading Experience" bar on the homepage | Perceived-perf / LCP hit if frames slow | Render first frame as poster `<img>` for instant LCP | LCP |

No memory leaks of note — RAF and listeners are cleaned up. `React.StrictMode` is on (good). DPR capped at 2 (good).

---

# PHASE 8 — Accessibility Audit

- 🔴 **Reduced-motion hero is broken.** `HeroScrollAnimation` only nulls inline motion styles when `reduceMotion`; it has **no static branch** (unlike `Home`'s sections, which correctly swap to `*Static`). Result for reduced-motion users: `phaseOpacity`/`brandOpacity`/`introOpacity` are all `undefined` → CSS default visible → **all four phase headlines + the intro + the brand reveal stack on top of each other** at full opacity, and the 400vh section still must be scrolled. This is the most serious a11y bug.
- 🔴 **No visible focus indicators.** Inputs use `outline-none` and signal focus only via border *color* (`contact-input`, modal inputs); buttons/links have no focus ring. Keyboard-only and low-vision users get almost no focus feedback.
- 🟠 **Modals aren't dialogs.** `TrialBookingModal`, `SpinWheel`, Gallery lightbox: no `role="dialog"`/`aria-modal`, no Escape, no focus trap, no focus return, no body-scroll-lock. `@radix-ui/react-dialog` is already installed and unused — adopt it.
- 🟠 **Hero `<h1>` is opacity-0 at load** and the visible heading is an `<img>` alt; phase headlines are `aria-hidden` `<h2>`. Document outline is weak.
- 🟡 **Navbar mobile toggle** has `data-testid` but no `aria-label`/`aria-expanded`/`aria-controls`; mobile menu doesn't trap focus or lock scroll.
- 🟡 **Contrast:** `text-zinc-500` (#71717a ≈ 4.0:1) and `text-zinc-600` (#52525b ≈ 3.6:1) on #0A0A0A **fail WCAG AA** for body copy (footer copyright, dates, captions, many descriptions). Bump content text to `zinc-400`/`zinc-300`.
- 🟡 **Forms:** labels present ✅ but required fields lack `aria-required` and error-text association (errors are toast-only).
- 🟢 **Done well:** `useReducedMotion` is used in most sections; the `@media (prefers-reduced-motion)` block is thorough; `rel="noopener noreferrer"` everywhere; canvas is `aria-hidden`; icon FABs have `title`/`aria-label`.

---

# PHASE 9 — Code Quality Audit

| Severity | Issue | Recommendation |
|---|---|---|
| 🔴 | 19 ESLint errors in `src/` (`npm run lint` fails) | Mostly deletions: `SEO path`, `BlogPost useState`, `Contact useEffect`, `Home imageReveal`/`_ignored`, `Programs Link`, `imageSequence foregroundScale/X/Y` + `driftLoop`, `set-state-in-effect` ×3 |
| 🟠 | `useScrollReveal` copy-pasted in **7 files**, 6 with the missing-deps bug | Extract one `src/lib/useScrollReveal.js` with `[]` |
| 🟠 | `fadeUp`/`stagger` redefined in `Contact.jsx` despite `lib/animations.js` | Import shared variants |
| 🟠 | `imageSequence.js` carries 3 render modes; `hero-cinematic` + `drawCinematicFrame` (~150 lines) dead | Delete unused mode |
| 🟠 | `set-state-in-effect` in `imageSequence.js:513`, `ChatBot.jsx:49`, `Navbar.jsx:29` | Derive state / move out of effect |
| 🟡 | Brand color is hardcoded `#2EC4B6` literal hundreds of times; `text-volt/bg-volt/border-volt` utilities defined but unused | Use tokens so rebrand = one change |
| 🟡 | `Home.jsx` is 918 lines (10 section components in one file) | Split sections into `src/sections/` |
| 🟡 | Unused deps: `@radix-ui/*` (×3), `axios`; `VIDEOS=[]`; `wheelRef` | Adopt Radix for modals or drop; remove vestigials |
| 🟢 | `mockData.js` mixes 4 content types; will be replaced by Sanity | Plan the swap when CMS goes live |

**Folder structure** is otherwise sensible (`components/`, `pages/`, `lib/`, `data/`, `admin/`). State is local-only (no global store needed yet) — appropriate.

---

# PHASE 10 — Creative Director Review

- **What feels premium:** the pre-graded canvas hero + per-letter HUD cascade; the disciplined obsidian/teal restraint; the kinetic-button sheen; the overall editorial calm.
- **What feels generic:** **Bebas Neue + teal-on-black is the default fitness template** — you could swap this onto 1,000 gym sites. The 6 lucide icons in 6 identical bordered tiles ("Why Us") is the most templated layout in the deck.
- **What feels outdated/trend-chasing:** the **spin-the-wheel discount** gimmick; the fake "AI Assistant"; the omnipresent teal glow reads slightly "energy-drink/gamer," not premium-athletic.
- **What hurts:** stock models presented as named coaches; a transformations page with no transformation photos. For a brand built on *real* bodies and *real* results, fake imagery is the antithesis of the message.
- **What could become signature:** the **muscle-up-as-scroll-narrative**. Lean all the way in — one signature scroll story (the rep), shorter, then *real* gym footage. Pair the condensed display face with a distinctive secondary (e.g., a grotesk or a mono for stats/labels) to escape the template. Give human moments one warm accent.

---

# PHASE 11 — Missed Opportunities

- **Real proof reel:** replace stock with phone-shot real members/coaches; even 6 authentic clips beat polished stock.
- **Before/After component** with a draggable slider on `/transformations`.
- **"Visit us" conversion strip** on `/` — embedded map + today's hours (you have `scheduleSettings` in Sanity) + price-from + 1-tap WhatsApp/call.
- **Skill progression visual** (dead-hang → pull-up → muscle-up) as an interactive ladder — on-brand and genuinely useful.
- **Live class timetable** from `scheduleSettings` instead of a static `/pricing` table.
- **Wire the CMS** you already built (Sanity schemas for program/trainer/successStory/blogPost exist) so content stops being hardcoded.

---

# PHASE 12 — Next-Level Ideas

**Quick wins (1–3h each)** — *Impact/Effort*
- Clear 19 lint errors + delete dead `hero-cinematic`/`driftLoop`. *(Med / Low)* — `imageSequence.js`, pages, `SEO.jsx`.
- Add SPA fallback (`vercel.json` rewrite or `public/_redirects`) + `<Route path="*">` NotFound. *(High / Low)* — deploy config, `App.jsx`.
- Delete `public/hero/*.mp4` + `public/pullup/` (−13 MB). *(Med / Low)*.
- Add `LocalBusiness/Gym` JSON-LD + canonical + `robots.txt` + `sitemap.xml`. *(High for local SEO / Low)* — `SEO.jsx`, `index.html`.
- Add GA4 + CTA click events. *(High / Low)*.
- Fix `useScrollReveal` deps in 6 pages. *(Med / Low)*.

**Medium (1–2 days)**
- Route-level `React.lazy` + split the canvas engine out of the initial chunk. *(High / Med)* — `App.jsx`, `vite.config.js`.
- Lazy-mount the 2 home canvas sections + downsample running frames to ~75 WebP. *(High / Med)*.
- Replace all 3 modals with Radix Dialog (a11y for free). *(High a11y / Med)*.
- Add a **static reduced-motion hero** branch. *(High a11y / Med)* — `HeroScrollAnimation.jsx`.
- Global focus-visible ring + contrast pass to `zinc-400`. *(High a11y / Med)*.

**Major (3–7 days)**
- "Visit us" CRO strip + before/after slider + real-photo swap. *(Very High / Med-High)*.
- Wire Sanity reads (programs, trainers, stories, blog, schedule) → kill `mockData.js`. *(High / High)*.

**Signature (1–3 weeks)**
- Re-author the hero as **one tightened signature scroll story** (~250vh) ending on a real-footage payoff, plus a distinctive type pairing and a warm human accent. *(Brand-defining / High)*.

---

# PHASE 13 — Brutal Honesty

This is a **well-engineered shell wrapped around placeholder substance.** The canvas hero is genuinely impressive and the forms are now solid. But the site spends its entire first impression — **~9 screen-heights of scroll** — on mood, then asks visitors to trust **stock photos of other people's gyms and coaches**, on a page whose own headline `<h1>` is invisible until you reach the bottom of a 400vh section. The motion craft is real; the content honesty is not. For a *local* gym, the cinematic ambition is actively fighting the job-to-be-done (price, hours, location, "is this real").

**Top 20 Problems**
1. No static reduced-motion hero → 4 headlines + intro + brand overlap (a11y bug).
2. Stock models presented as the real named coaches (trust + ethics).
3. Transformations page has **no transformation photos**.
4. ~880vh of scroll before any concrete benefit on `/`.
5. No SPA fallback → deep links 404 on refresh.
6. No `*` route → unknown paths render blank body.
7. No route code-splitting → one heavy initial bundle.
8. 396 frames (~19 MB) eager-loaded on `/`.
9. 240 frames for a background runner.
10. No visible focus indicators anywhere.
11. Modals are not accessible dialogs (no esc/trap/scroll-lock).
12. 12 MB of unreferenced hero `.mp4`s + unused `pullup/` frames shipped.
13. 19 ESLint errors; `npm run lint` fails.
14. `useScrollReveal` re-creates an `IntersectionObserver` every render in 6 pages.
15. Low-contrast `zinc-500/600` body text (fails AA).
16. ChatBot fakes an "AI Assistant" with no backend.
17. Inconsistent stats across pages (trust).
18. No analytics → CRO is unmeasurable.
19. SEO: no canonical, no JSON-LD, no robots/sitemap, og:image=logo.
20. Dead code (`hero-cinematic` mode, `driftLoop`, `VIDEOS`, unused Radix/axios) + 918-line `Home.jsx`.

**Top 20 Improvements** = the inverse of the above, sequenced in Phase 14.
**Top 10 Creative Opportunities:** real proof reel; before/after slider; tighten hero to one signature story; distinctive type pairing; one warm accent; interactive skill ladder; live timetable; signature scroll payoff on real footage; kill spin-wheel for a real first-session offer; replace generic 6-icon grid with photographic "why us."
**Top 10 Conversion Improvements:** "Visit us" strip; real photos; analytics+events; single-field fast trial CTA; surface price-from early; consistent stats; honest chat label; before/after proof; sticky mobile call/WA bar that doesn't collide with chat FAB; trial-offer clarity (what exactly is free).

---

# PHASE 14 — Implementation Roadmap

| Phase | Item | Priority | Impact | Difficulty | Est. | Files |
|---|---|---|---|---|---|---|
| **1 Critical** | SPA fallback + `*` 404 route | P0 | High | Low | 0.5d | deploy cfg, `App.jsx` |
| | Static reduced-motion hero branch | P0 | High (a11y) | Med | 0.5d | `HeroScrollAnimation.jsx` |
| | Clear 19 lint errors + delete dead code | P0 | Med | Low | 0.5d | pages, `imageSequence.js`, `SEO.jsx` |
| | Delete unused `.mp4`/`pullup` assets | P0 | Med | Low | 0.25d | `public/` |
| **2 UX/Trust** | Replace stock coach/gallery + add real before/after | P0 | Very High | Med-High | 2–4d | `Coaches/Gallery/Transformations`, assets |
| | "Visit us" CRO strip on `/` | P1 | High | Med | 1d | `Home.jsx` |
| | Consistent stats source; honest chat label | P1 | Med | Low | 0.5d | data, `ChatBot.jsx` |
| | GA4 + CTA events | P1 | High | Low | 0.5d | `index.html`, CTAs |
| **3 Perf** | Route `React.lazy` + `manualChunks` | P1 | High | Med | 1d | `App.jsx`, `vite.config.js` |
| | Lazy-mount canvas sections + downsample/WebP frames | P1 | High | Med | 1–2d | `Home.jsx`, `imageSequence.js`, assets |
| | Cache rect; pause off-screen infinite loops | P2 | Med | Low | 0.5d | `imageSequence.js`, `Home.jsx` |
| **4 Premium Motion** | Tighten hero to ~250vh; single signature story | P2 | High | Med | 1–2d | `HeroScrollAnimation.jsx`, `imageSequence.js` |
| | Radix Dialog for all 3 modals (a11y) | P1 | High | Med | 1d | modals |
| | Focus-visible ring + contrast pass | P1 | High (a11y) | Med | 0.5–1d | `index.css`, inputs |
| **5 Awwwards** | Real-footage payoff + distinctive type pairing + warm accent | P3 | Brand | High | 1–3wk | hero, `index.css`, assets |
| | Wire Sanity reads (kill `mockData.js`) | P2 | High | High | 3–5d | pages, new `lib/sanity.js` |
| | SEO: JSON-LD + canonical + robots/sitemap | P1 | High (local) | Low | 0.5d | `SEO.jsx`, `index.html`, `public/` |

**Suggested order:** Phase 1 (correct launch) → Phase 2 trust/CRO (the real ROI) → Phase 3 perf → Phase 4 a11y+motion polish → Phase 5 signature.
