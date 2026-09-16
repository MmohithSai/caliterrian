# Cali Terrain — Execution Plan (Audit → Production)

**Mode:** Implementation strategy only. Findings from `DEEP_AUDIT.md` are treated as verified — referenced by tag (e.g. **[RM-hero]**, **[SPA]**), not re-argued.
**Owner roles:** Principal FE · Staff Perf · Staff A11y · Tech Lead · Product Eng.
**Single open decision:** deploy host (Vercel vs Netlify vs other) — affects one artifact only (SPA-fallback file). Plan ships **both** `vercel.json` and `public/_redirects` so it's host-agnostic; no blocker.

---

## ▣ Progress Log

**Sprint 1 — "Correct & Safe Launch" (P0) — ✅ COMPLETE (2026-06-04)**
All tasks done, `npm run lint` **green (0 errors)**, `vite build` passes.
- ✅ **T1 [SPA]** — added `vercel.json` (rewrite) + `public/_redirects` (host-agnostic).
- ✅ **T4 [ASSETS]** — `git rm` of `public/hero/*.mp4` (12 MB) + `public/pullup/` (30 frames). **−13 MB.**
- ✅ **T2 [404]+ErrorBoundary** — new `src/pages/NotFound.jsx` + `src/components/ErrorBoundary.jsx`; `<Route path="*">` added; `ErrorBoundary` wraps `AppContent` in `App.jsx`.
- ✅ **T3 [LINT]** — 19 errors → **0**. Removed unused imports/params (`BlogPost`/`Contact`/`Programs`/`Home`/`imageSequence` foreground params); `SEO.jsx` now emits `<link rel="canonical">`+`og:url` (consumes `path`); `ChatBot` seeds welcome on open + id-counter ref (no `Date.now()`); deleted dead drift effect in `imageSequence.js`; intentional framework-pattern flags suppressed with rationale (`Navbar`, `imageSequence` cached-frame, admin `DetailDrawer`/`RecordsPage`/`AuthContext`).
- ✅ **T5 [RM-hero]** — `HeroScrollAnimation` now branches: `HeroStatic` (single poster frame, one visible `<h1>`, one CTA pair, no 400vh, canvas engine never mounts) for reduced motion; `HeroAnimated` otherwise. **Overlapping-headlines bug fixed.**

> Note: T3 fully resolved the `SEO path` line by implementing the canonical now (instead of deferring) — forward-compatible with T9, which still owns JSON-LD + robots + sitemap + OG image.
> Carryover: bundle still single 756 KB (→ T10), `scrollTo` still smooth (→ later), real OG image pending (→ T9).

**Sprints 2–4:** not started.

Finding tags used below:
`[SPA]` SPA fallback · `[404]` catch-all route · `[RM-hero]` reduced-motion hero · `[LINT]` lint/dead-code · `[ASSETS]` dead asset delete · `[SEO]` JSON-LD/canonical/robots · `[GA]` analytics · `[REVEAL]` useScrollReveal deps · `[SPLIT]` route code-split · `[FRAMES]` frame lazy-load/downsample · `[RECT]` rect cache + pause off-screen loops · `[DIALOG]` Radix dialogs · `[FOCUS]` focus-visible · `[CONTRAST]` zinc contrast · `[HERO250]` hero re-author · `[PROOF]` real photos/before-after · `[STRIP]` "Visit us" strip · `[STATS]` stat consistency · `[CHAT]` honest chat label · `[CMS]` Sanity wiring.

---

# PHASE 1 — Dependency Analysis & Regression Map

| Tag | Files / functions touched | Shared systems | Regression risk | Hidden side effects | Depends on / conflicts |
|---|---|---|---|---|---|
| **[SPA]** | new `vercel.json`, `public/_redirects` | deploy only | **None** | None (build-output passthrough) | host decision (cosmetic) |
| **[404]** | `App.jsx` `<Routes>`; new `src/pages/NotFound.jsx` | router | **Low** | adds a route; verify it renders *inside* public chrome, not admin branch | edit alongside **[SPLIT]** (same `<Routes>`) |
| **[RM-hero]** | `HeroScrollAnimation.jsx` — add `HeroStatic` branch gated by `useReducedMotion()` | hero only | **Low** (additive path; animated path untouched) | must still render canvas frame 0 as a poster so RM users see the athlete; ensure single `<h1>` visible | **must precede [HERO250]**; shares file with nothing else |
| **[LINT]** | `SEO.jsx`(path), `BlogPost.jsx`(useState), `Contact.jsx`(useEffect), `Home.jsx`(imageReveal,_ignored), `Programs.jsx`(Link), `imageSequence.js`(foregroundScale/X/Y, driftLoop, set-state-in-effect ×) | none | **Low** | `SEO.jsx` `path` removal **conflicts with [SEO]** (which *uses* path) → don't delete; implement canonical instead | `SEO.jsx` line deferred to **[SEO]** |
| **[ASSETS]** | delete `public/hero/*.mp4`, `public/pullup/` | deploy weight | **Low** | grep-confirm zero refs first (the `pullup` hit is a program *id*, not the folder) | independent |
| **[SEO]** | `SEO.jsx` (emit canonical from `path`, inject JSON-LD), `index.html`, new `public/robots.txt`, `public/sitemap.xml`; pass `path`/`type` per page | helmet, every page | **Low** | each page must pass `path`; JSON-LD needs one source of truth for NAP/hours | **supersedes [LINT] SEO line**; pairs with **[STATS]** (shared data) |
| **[GA]** | `index.html` (loader) + new `src/lib/analytics.js`; call at CTA `onClick` (`Navbar`, `FloatingButtons`, hero, `Home` CTAs, modals) | all CTAs | **Low** | consent/PII: never send phone/name; events only | independent; do before CRO so impact is measurable |
| **[REVEAL]** | extract `src/lib/useScrollReveal.js`; replace local copies in `Pricing/Coaches/Programs/Transformations/Blog/Gallery` (+ `Home` already correct) | scroll-reveal | **Low** | behavior identical once `[]` added; verify `.scroll-fade` still observed after filter re-render | batch with page edits **[CONTRAST]** |
| **[SPLIT]** | `App.jsx` (`lazy()` the 9 pages + `Suspense`), `vite.config.js` (`build.rollupOptions.manualChunks` for framer-motion / canvas engine) | router, bundle | **Medium** | Suspense fallback flash; ensure `HelmetProvider`/`Toaster` stay eager; admin already lazy | edit `<Routes>` **with [404]** |
| **[FRAMES]** | `Home.jsx` (lazy-mount `TrainingProgramsSectionScroll`/`WhyUsSectionScroll` via `IntersectionObserver`/`useInView`), `imageSequence.js` (gate preload until mounted), asset re-encode to WebP + downsample running 240→~75 | canvas engine | **Medium** | path/count constants (`RUNNING_FRAME_COUNT`, `*_FRAME_PATH`) must match new files; reduced-motion already uses `*Static` (safe) | after **[RECT]** (same file) |
| **[RECT]** | `imageSequence.js` `drawAt` (cache `getBoundingClientRect` on resize), delete dead `hero-cinematic` mode + `drawCinematicFrame` + `driftLoop`; `Home.jsx` pause infinite loops off-screen | canvas engine | **Low-Med** | confirm `hero-cinematic` referenced nowhere (hero uses `-pre`); deleting trims ~150 lines | **do before [FRAMES]** to avoid double-churn of `imageSequence.js` |
| **[DIALOG]** | rewrite `TrialBookingModal.jsx`, `SpinWheel.jsx`, Gallery lightbox (`Gallery.jsx`) on `@radix-ui/react-dialog` | modal pattern, FloatingButtons/Pricing triggers | **Medium-High** | focus return to trigger, scroll-lock, esc — Radix gives free; verify form state reset + WhatsApp redirect still inside user gesture (`TrialBookingModal.goToWhatsApp`) | independent; removes unused-dep finding |
| **[FOCUS]** | `index.css` global `:focus-visible` ring; inputs in `Contact.jsx`/modals keep border but add ring | design system | **Low** | don't reintroduce default outline on mouse; use `:focus-visible` only | independent |
| **[CONTRAST]** | `index.css` + JSX `text-zinc-500/600`→`zinc-400/300` for *content* (keep for decoration) | tokens | **Low** | audit each instance: content vs decorative; footer copyright, dates, captions | batch with **[REVEAL]** page pass |
| **[HERO250]** | `HeroScrollAnimation.jsx` (`height:400vh`→~250vh + re-tune `HERO_PHASES` windows), `imageSequence.js` (`DEAD_HANG_*` curve + `peakAtScroll`) | hero↔engine coupling | **High** (tightest coupling in repo) | every phase boundary + brand/CTA reveal window is hand-tuned to the curve; changing length desyncs HUD text | **after [RM-hero] + [RECT]**; needs manual scroll QA |
| **[PROOF]** | `Coaches.jsx`, `Gallery.jsx`, `mockData.js` GALLERY, `Transformations.jsx` (before/after slider), new assets | content | **Low (code)** / **External blocker** | needs real photos from business; legal/consent for member before/after | parallel product track; no code dependency |
| **[STRIP]** | new `src/sections/VisitUs.jsx` in `Home.jsx`; data from schedule | home | **Low** | reuse map iframe from `Contact.jsx`; single NAP/hours source | pairs with **[STATS]** |
| **[STATS]** | new `src/data/site.js` (NAP, hours, stats); refactor `Home`/`Transformations`/`Coaches`/`Footer`/`Contact` to read it | content | **Low** | one source kills cross-page contradictions; SEO JSON-LD reads same | enables **[SEO]**, **[STRIP]** |
| **[CHAT]** | `ChatBot.jsx` header copy + optional WA deep-link | chat | **Low** | relabel "AI Assistant"→"Quick Help"; keep keyword replies | independent |
| **[CMS]** | new `src/lib/sanity.js`, refactor all content pages off `mockData.js` | data layer | **High** | deferred until design/content freeze (per project memory); big surface | last; depends on **[STATS]**/**[PROOF]** shapes |

**Dependency clusters (edit together to avoid re-churn):**
- **`App.jsx <Routes>`:** [404] + [SPLIT].
- **`imageSequence.js`:** [RECT] (delete dead code + cache rect) → then [FRAMES] (preload gating) → then [HERO250] (curve).
- **`HeroScrollAnimation.jsx`:** [RM-hero] first (additive) → [HERO250] last (re-tune).
- **Content source:** [STATS] is a prerequisite enabler for [SEO], [STRIP], and clean [CMS].
- **Page sweep (6 files):** [REVEAL] + [CONTRAST] + per-page `loading="lazy"`/dimensions in one editing pass.

---

# PHASE 2 — Implementation Order (P0–P3)

**Must happen first (foundation):** [STATS] (unblocks SEO/STRIP), [RECT] before [FRAMES] before [HERO250].
**Must happen together:** [404]+[SPLIT] (same `<Routes>`); page sweep [REVEAL]+[CONTRAST]+lazy-img.
**Can happen later:** [HERO250], [DIALOG], [CMS].
**Fully independent (any time):** [SPA], [ASSETS], [GA], [FOCUS], [CHAT].

| Priority | Items | Rationale |
|---|---|---|
| **P0 — blocks a correct launch** | [SPA], [404], [RM-hero], [LINT], [ASSETS] | Broken deep links, blank unknown routes, broken RM experience, failing CI lint, dead-weight deploy. All low-risk. |
| **P1 — launch quality (trust/perf/measurability)** | [STATS], [SEO], [GA], [SPLIT], [RECT], [FRAMES], [FOCUS], [CONTRAST], [REVEAL], [CHAT] | Makes the launch fast, discoverable, accessible-baseline, measurable, and internally consistent. |
| **P2 — polish & ROI deepening** | [DIALOG], [STRIP], [HERO250], [PROOF] (code side) | Higher-risk or asset-dependent; do after the site is stable and measurable. |
| **P3 — scalability** | [CMS], full real-content swap, Lighthouse-CI gate | Structural; depends on content freeze. |

---

# PHASE 3 — Task Breakdown

> G=Goal, R=Reason, Diff, Risk, Est.

**T1 [SPA]** ✅ **DONE** — Added `vercel.json` `{rewrites:[{source:"/(.*)",destination:"/index.html"}]}` **and** `public/_redirects` `/* /index.html 200`.
G: deep links survive refresh · R: BrowserRouter on static host · Diff: trivial · Risk: none · Est: 15m

**T2 [404]** ✅ **DONE** — `src/pages/NotFound.jsx` (brand-styled) + `<Route path="*">` in public `<Routes>`; also added `src/components/ErrorBoundary.jsx` wrapping `AppContent`.
G: no blank body on unknown path · R: missing catch-all · Diff: low · Risk: low · Est: 30m

**T3 [LINT]** ✅ **DONE** — 19→0 errors. Removed unused imports/params; fixed `set-state-in-effect`/`purity` (ChatBot seed-on-open + id counter; imageSequence dead drift deleted); intentional patterns suppressed with rationale. **`SEO path` resolved now via canonical** (not deferred).
G: green `npm run lint` · R: CI gate, dead code · Diff: low · Risk: low · Est: 45m

**T4 [ASSETS]** ✅ **DONE** — Grep-confirmed (the `pullup` ref is a program *id*), `git rm`'d `public/hero/*.mp4` + `public/pullup/`. −13 MB.
G: −13 MB deploy · R: unreferenced · Diff: trivial · Risk: low (grep first) · Est: 15m

**T5 [RM-hero]** ✅ **DONE** — `HeroScrollAnimation` branches to `HeroStatic` (poster frame00001, single visible `<h1>`, one CTA pair, no 400vh, canvas engine unmounted) under `useReducedMotion()`; `HeroAnimated` otherwise.
G: correct RM experience · R: overlapping headlines bug · Diff: med · Risk: low (additive) · Est: 3h

**T6 [STATS]** — `src/data/site.js` exports `NAP`, `HOURS`, `STATS`, `SOCIAL`. Refactor `Home` stats, `Transformations` band, `Coaches` numbers, `Footer`, `Contact` to import it.
G: one source of truth · R: cross-page contradictions · Diff: low · Risk: low · Est: 1.5h

**T7 [GA]** — `src/lib/analytics.js` (`track(event, props)`), GA4 snippet in `index.html`, fire `book_trial_click` / `whatsapp_click` / `call_click` / `form_submit` at each CTA + form success.
G: measurable CRO · R: currently blind · Diff: low · Risk: low (no PII) · Est: 1.5h

**T8 [REVEAL]** — `src/lib/useScrollReveal.js` (with `[]`); replace 6 local copies.
G: stop per-render observer churn · R: perf + dup · Diff: low · Risk: low · Est: 45m

**T9 [SEO]** — `SEO.jsx`: emit `<link rel="canonical">` from `path` (resolves T3's deferred line) + inject `Gym`/`LocalBusiness` JSON-LD (reads `site.js`). Pass `path` per page. Add `robots.txt` + `sitemap.xml`. Real 1200×630 `og:image`.
G: local-SEO + canonical · R: discovery miss · Diff: low-med · Risk: low · Est: 2h

**T10 [SPLIT]** — `App.jsx`: `lazy()` the 9 pages, wrap public `<Routes>` in `<Suspense>` (brand skeleton). `vite.config.js`: `manualChunks` splitting `framer-motion` + the canvas engine.
G: −40–55% initial JS · R: one heavy bundle · Diff: med · Risk: med (Suspense flashes) · Est: 3h

**T11 [RECT]** — `imageSequence.js`: delete `hero-cinematic` mode + `drawCinematicFrame` + `driftLoop`; cache rect on resize; `Home.jsx`: pause testimonials/pricing infinite loops via `useInView`.
G: smoother scroll, −150 lines, less idle paint · R: thrash + dead code · Diff: med · Risk: low-med · Est: 2.5h

**T12 [FRAMES]** — Lazy-mount the two home canvas sections (mount on `IntersectionObserver` near-viewport); gate `imageSequence` preload to mounted; re-encode frames to WebP, running 240→~75.
G: stop 396-frame/19MB first-paint load · R: mobile data · Diff: med · Risk: med (path/count match) · Est: 4h (+asset encode)

**T13 [FOCUS]** — `index.css` global `:focus-visible` ring (teal); verify inputs/buttons/links.
G: keyboard visibility · R: none today · Diff: low · Risk: low · Est: 1h

**T14 [CONTRAST]** — Sweep `text-zinc-500/600` content→`zinc-400/300` (footer copyright, dates, captions, descriptions); keep decorative.
G: WCAG AA body text · R: AA fail · Diff: low · Risk: low · Est: 1.5h

**T15 [CHAT]** — `ChatBot.jsx`: header "Quick Help • we reply on WhatsApp"; keep keyword replies, add WA deep-link button.
G: honest expectation · R: over-promise · Diff: low · Risk: low · Est: 45m

**T16 [DIALOG]** — Rewrite `TrialBookingModal`, `SpinWheel`, Gallery lightbox on `@radix-ui/react-dialog`. Preserve booking form-reset + gesture-bound WhatsApp redirect.
G: real dialog a11y · R: trap/esc/scroll-lock/return missing · Diff: med-high · Risk: med-high · Est: 5h

**T17 [STRIP]** — `src/sections/VisitUs.jsx` (mini map + today's hours + price-from + 1-tap WA/call), placed high in `Home.jsx`; reads `site.js`.
G: surface decision info · R: buried below 880vh · Diff: med · Risk: low · Est: 2.5h

**T18 [HERO250]** — Shorten hero to ~250vh, re-tune `HERO_PHASES` + `imageSequence` `DEAD_HANG_*`/`peakAtScroll`. Manual scroll QA on desktop+mobile.
G: cut scroll tax, keep signature · R: 880vh tax · Diff: high · Risk: high (HUD desync) · Est: 1–2d

**T19 [PROOF]** (code) — Before/after slider component; wire real coach/gallery images once provided.
G: real proof · R: fake imagery · Diff: med · Risk: low (code) · Est: 1d + assets

**T20 [CMS]** — `src/lib/sanity.js`; refactor content pages off `mockData.js`.
G: scalable content · R: hardcoded · Diff: high · Risk: high · Est: 3–5d

---

# PHASE 4 — Production Readiness Checklist

- **Routing:** ☐ T1 SPA fallback (both files) ☐ T2 `*` 404 ☐ deep-link refresh test on `/programs`, `/blog/benefits-of-pull-ups`, `/admin` ☐ `scrollTo(0,0)` instant (not smooth) on nav.
- **Performance:** ☐ T10 split (initial JS < ~180 KB gz) ☐ T11 rect cache ☐ T12 lazy frames + WebP ☐ Lighthouse mobile ≥ 85 perf ☐ LCP poster frame ☐ no off-screen infinite paint.
- **Accessibility:** ☐ T5 RM hero ☐ T13 focus-visible ☐ T16 dialogs ☐ T14 contrast AA ☐ keyboard pass (tab through hero→nav→modal→close→return) ☐ axe DevTools 0 criticals.
- **SEO:** ☐ T9 canonical + JSON-LD + robots + sitemap + real OG ☐ per-page `<title>`/desc ☐ single visible `<h1>` per route.
- **Analytics:** ☐ T7 GA4 + CTA/form events firing (verify in realtime) ☐ no PII in payloads.
- **Error handling:** ☐ `ErrorBoundary` around public `<Routes>` (add as T2.5) ☐ form failure toasts (already ✅) ☐ image `onError` fallbacks (already ✅).
- **Forms:** ☐ booking + contact persist (✅) ☐ honeypot (✅) ☐ `aria-required` + error-text assoc ☐ success states (✅).
- **Mobile:** ☐ hero `dvh` not `vh` ☐ `BREAK THROUGH.` no overflow ≤360px ☐ canvas sticky sections legible ☐ FAB vs ChatBot FAB don't collide ☐ tap targets ≥44px.
- **Browser compat:** ☐ Safari `backdrop-filter`/`-webkit-` (present ✅) ☐ canvas DPR cap (✅) ☐ iOS 100vh/dvh ☐ reduced-motion honored in Safari.

---

# PHASE 5 — Performance Execution Plan

| Optimization | Expected gain | Risk | Files |
|---|---|---|---|
| Route `lazy()` + Suspense **[T10]** | −40–55% initial JS; faster TTI on `/` | Med (Suspense flash → brand skeleton) | `App.jsx` |
| `manualChunks` (framer-motion, canvas engine) **[T10]** | better caching, smaller entry | Low | `vite.config.js` |
| Lazy-mount + preload-gate the 2 home canvas sections **[T12]** | removes ~330 non-hero frames from first paint | Med (count/path constants) | `Home.jsx`, `imageSequence.js` |
| Running 240→~75 + WebP/AVIF **[T12]** | −60–75% that section's bytes | Low | assets, `Home.jsx` const |
| Hero poster frame for LCP **[T5/T12]** | faster LCP, removes blocking "Loading Experience" feel | Low | `HeroScrollAnimation.jsx` |
| Cache `getBoundingClientRect` per resize **[T11]** | removes per-frame layout read → smoother scroll | Low | `imageSequence.js` `drawAt` |
| Delete `hero-cinematic`/`drawCinematicFrame`/`driftLoop` **[T11]** | −~150 lines, smaller bundle, clarity | Low | `imageSequence.js` |
| Pause off-screen infinite loops **[T11]** | lower idle CPU/paint (esp. pricing `box-shadow` ∞) | Low | `Home.jsx` |
| Delete dead `.mp4`/`pullup` **[T4]** | −13 MB deploy | Low | `public/` |
| `loading="lazy"` + dimensions on `<img>` (Gallery/Programs/Coaches/Blog) | lower CLS, fewer eager requests | Low | page files |

**Sequence within `imageSequence.js`:** T11 (clean + rect) → T12 (gating) → T18 (curve). One file, three escalating-risk passes, never interleaved.

---

# PHASE 6 — Accessibility Execution Plan (by severity)

1. 🔴 **[T5] Reduced-motion hero** — static branch; verify single visible `<h1>`, no overlapping phases, no forced 400vh. *Most severe; ship in P0.*
2. 🔴 **[T13] Focus management** — global `:focus-visible` ring; never rely on border-color alone; mouse users unaffected.
3. 🟠 **[T16] Dialog a11y** — Radix Dialog for all 3 overlays: `role/aria-modal`, focus trap, Esc, focus return, body-scroll-lock.
4. 🟠 **Semantic structure** — one visible `<h1>` per route; hero phase `<h2>`s stay `aria-hidden`; Navbar toggle gets `aria-label`/`aria-expanded`/`aria-controls`; mobile menu traps focus + locks scroll.
5. 🟡 **[T14] Contrast** — content text to AA; keep decorative greys.
6. 🟡 **Forms** — `aria-required` on name/phone, associate error text (not toast-only).

Gate: **axe-core 0 criticals** + manual keyboard pass before P1 sign-off.

---

# PHASE 7 — Conversion Execution Plan (ranked by expected impact)

| Rank | Improvement | Impact | Notes |
|---|---|---|---|
| 1 | **[PROOF] Real photos + before/after** (coaches, transformations, gallery) | **High** | The trust hinge; biggest single ROI. External asset dependency — start collection now. |
| 2 | **[STRIP] "Visit us" strip high on `/`** (map + today's hours + price-from + 1-tap WA/call) | **High** | Surfaces the actual decision info for local mobile users. |
| 3 | **[GA] Analytics + CTA events** | **High (enabler)** | Without it, every other CRO change is unmeasurable. Do first so 1–2 can be proven. |
| 4 | **Single-field fast trial path** (name+phone → WA) alongside the full modal | **Medium-High** | Lower friction for high-intent users. |
| 5 | **[STATS] Consistent, credible numbers** | **Medium** | Contradictions read as untrustworthy. |
| 6 | **[HERO250] Cut scroll tax to the offer** | **Medium** | Gets users to proof/price faster. |
| 7 | **[CHAT] Honest chat label** + WA handoff | **Medium** | Removes false "instant AI" expectation. |
| 8 | **Trial-offer clarity** (what exactly is free, how to claim) | **Medium** | Reduce hesitation at the CTA. |

---

# PHASE 8 — Quick Wins by ROI

**< 30 min (do first):**
1. T1 [SPA] (15m) — unblocks correct launch. *Highest ROI.*
2. T4 [ASSETS] (15m) — −13 MB.
3. T2 [404] core route (30m).
4. T15 [CHAT] relabel (part of 45m).

**< 1 hour:**
5. T3 [LINT] (45m) — green CI.
6. T8 [REVEAL] shared hook (45m).
7. T13 [FOCUS] ring (1h).

**< 2 hours:**
8. T6 [STATS] source of truth (1.5h) — unblocks SEO/STRIP.
9. T7 [GA] (1.5h) — makes CRO measurable.
10. T14 [CONTRAST] (1.5h).

Half a day of these (T1–T8, T13) clears every P0 except RM-hero and lands the cheapest P1s.

---

# PHASE 9 — Execution Sprints

**Sprint 1 — "Correct & Safe Launch" (P0) — ✅ COMPLETE (2026-06-04)**
- Goals: deep links work, no blank routes, RM users served, CI green, deploy lean.
- Tasks: T1 ✅, T2 (+ErrorBoundary) ✅, T3 ✅, T4 ✅, T5 ✅.
- Dependencies: none external.
- Outcome: ✅ site is *launchable without embarrassment*; lint **green (0 errors)**; build passes; RM hero bug gone; −13 MB deploy.

**Sprint 2 — "Fast, Found & Measured" (P1 core)**
- Goals: small fast bundle, discoverable, measurable, internally consistent.
- Tasks: T6→T9 (stats→SEO), T7 GA, T10 split, T11 rect/dead-code, T8 reveal.
- Dependencies: T6 before T9/T17; T11 before T12.
- Outcome: Lighthouse jumps, GA live, SEO schema in place, one content source.

**Sprint 3 — "Accessible & Light" (P1 finish + a11y)**
- Goals: a11y baseline + asset weight.
- Tasks: T12 frames/WebP, T13 focus, T14 contrast, T16 dialogs.
- Dependencies: T16 independent; T12 after T11.
- Outcome: axe-clean, keyboard-usable, mobile data sane.

**Sprint 4 — "Convert & Scale" (P2/P3)**
- Goals: trust + offer clarity + structure.
- Tasks: T17 strip, T19 before/after + real photos, T18 hero re-author, then T20 CMS.
- Dependencies: T6 → T17; assets → T19; T5+T11 → T18; content freeze → T20.
- Outcome: conversion-optimized, real proof, scalable content.

---

# PHASE 10 — Claude Execution Queue (exact order I'd implement)

Ordered to minimize regressions: foundation/independent first, escalating risk last, same-file passes batched.

1. ✅ **T1 [SPA]** — `vercel.json` + `public/_redirects`.
2. ✅ **T4 [ASSETS]** — grep-confirm, delete `.mp4` + `pullup/`.
3. ✅ **T2 [404] + ErrorBoundary** — `NotFound.jsx`, `ErrorBoundary.jsx`, wired into `App.jsx`.
4. ✅ **T3 [LINT]** — unused removed; `set-state-in-effect`/`purity` fixed/justified; **`SEO.path` resolved via canonical now** (superseded the deferral).
5. ⏳ **T8 [REVEAL]** — extract `lib/useScrollReveal.js`, replace 6 copies. *(Sprint 2 — next)*
6. ✅ **T5 [RM-hero]** — additive `HeroStatic` branch (done before any hero re-author).
7. **T6 [STATS]** — `data/site.js`, refactor consumers (enabler).
8. **T15 [CHAT]** — honest relabel + WA link.
9. **T7 [GA]** — `lib/analytics.js` + `index.html` + CTA/form events.
10. **T13 [FOCUS]** — global `:focus-visible`.
11. **T9 [SEO]** — canonical (consumes `SEO.path`), JSON-LD from `site.js`, robots, sitemap, OG image.
12. **T14 [CONTRAST]** — zinc sweep (batch with page edits from #5).
13. **T10 [SPLIT]** — route `lazy()` + Suspense skeleton + `manualChunks` (second `App.jsx`/`vite.config.js` pass).
14. **T11 [RECT]** — `imageSequence.js`: delete dead mode + cache rect; pause off-screen loops in `Home.jsx`.
15. **T12 [FRAMES]** — lazy-mount canvas sections + preload gating + WebP/downsample (after #14, same file).
16. **T16 [DIALOG]** — Radix-ify 3 modals (removes unused `@radix-ui` finding); drop `axios` + dead `cn`/`clsx`/`tailwind-merge` if still unused.
17. **T17 [STRIP]** — `sections/VisitUs.jsx` into `Home.jsx` (after #7 `site.js`).
18. **T19 [PROOF]** — before/after slider + wire real images as they arrive (parallel asset track).
19. **T18 [HERO250]** — shorten + re-tune hero↔engine curve (after #6 + #14; heaviest QA).
20. **T20 [CMS]** — `lib/sanity.js`, migrate pages off `mockData.js` (last; after content freeze).

**Checkpoints:** after #6 run lint+build+manual RM/keyboard pass; after #13 run Lighthouse; after #15 re-run Lighthouse + mobile data check; after #19 full scroll QA desktop+mobile; after #20 full regression.
