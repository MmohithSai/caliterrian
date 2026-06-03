# Cali Terrain — Frontend Audit

**Scope:** React 19 + Vite 8 + Tailwind v4 SPA (`src/`), single-page marketing site for a calisthenics gym.
**Date:** 2026-06-03
**Build status:** ✅ Compiles. ⚠️ 15 ESLint errors, single 550 KB JS bundle, ~42 MB of public assets.

Severity legend: 🔴 Critical · 🟠 High · 🟡 Medium · 🟢 Low / polish

---

## 1. Critical Issues (fix before / right after launch)

### 🔴 C1 — No SPA fallback → deep links 404 on refresh
The app uses `BrowserRouter` (`src/App.jsx:51`) but there is **no** `vercel.json`, `netlify.toml`, `public/_redirects`, or `404.html`. On almost any static host, a hard refresh or shared link to `/programs`, `/pricing`, `/blog/calisthenics-for-beginners`, etc. returns a 404. Only `/` works on reload.
**Fix:** Add a catch‑all rewrite to `index.html`. Examples:
- Vercel `vercel.json`: `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
- Netlify `public/_redirects`: `/*  /index.html  200`

### 🔴 C2 — No 404 / catch-all route inside the app
`src/App.jsx:26-36` has no `<Route path="*">`. An unknown path (even client-side navigated) renders Navbar + Footer with a blank body. Add a `NotFound` page and a wildcard route.

### 🔴 C3 — Duplicate full copy of the app in `app/`
`app/` is a second, slightly older copy of the entire project (its own `src/`, `public/`, `node_modules/`, `dist/`, logs). It bloats the repo, doubles asset weight, and pollutes lint (`eslint .` scans both). The root `src/` is the live code (it's what `vite.config.js`/`index.html` build).
**Fix:** Delete `app/` (confirm nothing references it first), or move it out of the repo. Also remove the stray `hero-composition-preview.png` (2.6 MB) and `pullup assets/` from the root if they're not assets the build needs.

### 🔴 C4 — Forms and chatbot are non-functional (silent data loss)
- `Contact.jsx:32-36` shows "Message sent! We'll contact you shortly." but **never sends anything** — pure `setTimeout`. A user who fills the form believes they've reached you; the lead is lost.
- `ChatBot.jsx` is fully hardcoded ("AI Assistant • Usually replies instantly") — no backend.
- `TrialBookingModal.jsx` at least redirects to WhatsApp, which is fine.

This is intentional for "Phase 1" (a `backend plan.md` exists), but the **Contact form is actively misleading**. Until a backend exists, either (a) wire the form to WhatsApp/email like the booking modal does, or (b) change the success copy to reflect what actually happens. Don't claim delivery you can't make.

---

## 2. High Priority

### 🟠 H1 — `useScrollReveal` runs on every render (6 pages)
In `Pricing.jsx:6`, `Coaches.jsx:26`, `Programs.jsx:21`, `Transformations.jsx:8`, `Blog.jsx:9`, `Gallery.jsx:8`, the hook's `useEffect` has **no dependency array**, so it re-queries the DOM, creates a new `IntersectionObserver`, and disconnects it on *every* render. `Home.jsx:77` has the correct version with `[]`.
**Fix:** Add `, []` to every `useScrollReveal` effect (or import one shared hook). Cheap, removes wasted work on each state change (e.g. every filter click / form keystroke re-runs it).

### 🟠 H2 — Eager-loads ~400 animation frames on the homepage
The homepage mounts three scroll-driven canvas sections, each of which preloads its *entire* frame set on mount (`imageSequence.js:480-528`):
- Hero muscle-up: 66 frames (`muscleup-cinematic`, **11 MB**)
- Push-up section: 90 frames (**4.2 MB**)
- Running section: **240 frames** (**4.1 MB**)

That's ~396 image requests / ~19 MB triggered on first paint of `/`, regardless of whether the user ever scrolls to those sections. On mobile / slow connections this is very heavy.
**Fixes (in priority order):**
1. Only start loading a section's frames when it's near the viewport (wrap the loader in an `IntersectionObserver`, or lazy-mount the section).
2. The running section's 240 frames is excessive for a background effect — sample down to ~60–90.
3. Consider WebP/AVIF for the frames; they're currently JPG.

### 🟠 H3 — ~20 MB of unused assets shipped in `public/`
Referenced by code: `/muscleup-cinematic`, `/pushup`, `/running`, `/hero/evolution.png`, `/transform-bg.webp`, `/logo.png`.
**Not referenced anywhere in `src/`:**
- `public/muscleup/` — 135 files, **8.5 MB** (superseded by `muscleup-cinematic`; git already shows many staged for deletion — finish the job)
- `public/pullup/` — 30 files, **1.4 MB**
- `public/hero/muscle-up-hero.mp4` (5.2 MB) + `public/hero/pullup-hero.mp4` (6.8 MB) — **12 MB of unused video**

Deleting these removes ~20 MB of dead weight from the deploy.

### 🟠 H4 — No code splitting → 550 KB JS up front
`dist/assets/index-*.js` is **549 KB (166 KB gzip)** in one chunk (Vite warns). Every route's code (all 9 pages, framer-motion, radix, the whole image-sequence engine) loads before the homepage can render.
**Fix:** `React.lazy()` + `<Suspense>` for the route components in `App.jsx`. The heavy hero/canvas code and framer-motion will split out of the initial bundle. Radix (`@radix-ui/react-*`) and `axios` are dependencies but appear **unused** in `src/` — drop them to shrink further (see Q5).

### 🟠 H5 — Accessibility: modals are not accessible dialogs
`TrialBookingModal.jsx`, `SpinWheel.jsx`, and the `Gallery.jsx` lightbox:
- No `role="dialog"` / `aria-modal="true"` / labelledby.
- No **Escape to close**.
- No **focus trap** and no focus return to the trigger on close — keyboard/screen-reader users can tab "behind" the modal.
- **Body scroll is not locked** while a modal is open (background scrolls under the overlay).
The mobile nav menu (`Navbar.jsx:89`) also doesn't lock body scroll.
**Fix:** Use the Radix Dialog you already depend on (`@radix-ui/react-dialog`) for these — it handles focus trap, Escape, scroll lock, and ARIA for free. Otherwise add the behaviors manually.

---

## 3. Medium Priority

### 🟡 M1 — SEO gaps for a local business
`index.html` + `SEO.jsx` cover title/description/OG/Twitter, but missing:
- **No canonical URLs** (`<link rel="canonical">`).
- **No `LocalBusiness`/`Gym` JSON‑LD** schema — this is the single biggest local-SEO win for a gym (name, address, geo, phone, opening hours, rating, price range all map cleanly to it and you already have the data).
- **No `robots.txt`, no `sitemap.xml`.**
- `og:image` points at `/logo.png` (72 KB transparent logo) — social shares will look poor. Use a 1200×630 branded share image.
- Per-page OG image is always the logo; no real per-page imagery.

### 🟡 M2 — `scroll-behavior: smooth` globally may fight the hero
`index.css:530` sets `html { scroll-behavior: smooth }`. Combined with scroll-driven canvas springs and `window.scrollTo(0,0)` on route change (`Navbar.jsx:30`), this can produce a visible animated "scroll up" on navigation and add latency to the spring-mapped hero. Consider scoping smooth scroll to anchor links only, and using `scrollTo({ top: 0, behavior: 'instant' })` (or `window.scrollTo(0,0)` without smooth) on route change.

### 🟡 M3 — Low-contrast text (WCAG)
Heavy use of `text-zinc-500` (#71717a) and `text-zinc-600` (#52525b) for body copy, dates, captions on `#0A0A0A`. `zinc-600` on near-black is well below the WCAG AA 4.5:1 threshold for normal text (and 3:1 for large). Audit secondary text and bump to `zinc-400`/`zinc-300` where it's actual content rather than decoration.

### 🟡 M4 — External image dependency + layout shift
All gallery/program/coach/blog/testimonial imagery is hot-linked from Unsplash/Pexels (`mockData.js`, `Programs.jsx`, `Coaches.jsx`). Risks: third-party availability, no control over caching, and these are stock photos of a *different* gym — not your actual facility, which undercuts trust on a conversion-focused site.
- `<img>` tags have no `width`/`height` or `aspect-ratio` reservation beyond the wrapper, and most lack `loading="lazy"` (Gallery, Programs, Coaches). Add `loading="lazy"` and explicit dimensions to cut CLS.
- Long-term: replace stock with real photos of Cali Terrain.

### 🟡 M5 — `dangerouslySetInnerHTML` in blog renderer
`BlogPost.jsx:15-16` injects bold HTML via `dangerouslySetInnerHTML`. Content is from a local constant today (safe), but if blog content ever becomes API/CMS-driven this is an XSS vector. Note it now; sanitize (or use a markdown lib like `marked` + `DOMPurify`) when blog goes dynamic.

### 🟡 M6 — No global error boundary
A render error in any page (e.g. a malformed blog entry) white-screens the whole app. Add a React error boundary around `<Routes>` with a friendly fallback.

### 🟡 M7 — Two stacked hero CTA/heading layers
`HeroScrollAnimation.jsx` renders both an "intro" layer (z-8, EVOLUTION wordmark + CTAs) and a separate brand-reveal + phase HUD that animate over 400vh. There are effectively **two "Book Free Trial" buttons and two subtitles** in the hero DOM at once. They're opacity-gated by scroll, but both are in the tab order and accessibility tree simultaneously. Confirm only the active layer is focusable (`pointer-events`/`aria-hidden`/`inert` on the inactive one).

---

## 4. Code Quality / Maintainability

### 🟡 Q1 — 15 ESLint errors in `src/` (mostly dead code)
`npm run lint` fails. Quick wins (unused vars/imports):
| File | Issue |
|---|---|
| `App.jsx:22` | `location` assigned, never used (in `AppContent`) |
| `SEO.jsx:7` | `path` prop accepted but never used (so no canonical is emitted — ties to M1) |
| `BlogPost.jsx:1` | `useState` imported, unused |
| `Contact.jsx:1` | `useEffect` imported, unused |
| `Home.jsx:31` | `imageReveal` imported, unused |
| `Home.jsx:698` | `_ignored` param unused (`PricingSection` ignores `onBookTrial`) |
| `Programs.jsx:3` | `Link` imported, unused |
| `imageSequence.js:254-256` | `foregroundScale/X/Y` params unused |
| `imageSequence.js:549` | `driftLoop` defined, never used (dead drift loop) |

### 🟠 Q2 — React 19 purity/effect lint errors in shared code
The new `react-hooks` rules flag real anti-patterns:
- `imageSequence.js:513` — `setReady(true)` called synchronously inside the load effect (`set-state-in-effect`).
- `ChatBot.jsx:49` — `setMessages([...])` synchronously in an effect; `ChatBot.jsx:62` — `Date.now()` used to build a message id (flagged `purity`; fine in an event handler but worth using a counter/`crypto.randomUUID()`).
- `Navbar.jsx:29` — `setMobileOpen(false)` in a `location` effect (acceptable, but can be derived).
These won't crash, but they're the kind of thing React 19's compiler/strict mode will increasingly punish. Clean up at least the `imageSequence` one.

### 🟡 Q3 — `useImageSequenceCanvas` complexity & leftover render mode
`imageSequence.js` carries three render modes (`source`, `hero-cinematic`, `hero-cinematic-pre`); `hero-cinematic` (the heavy per-frame `drawCinematicFrame` compositor, ~150 lines) appears unused now that the hero uses the pre-graded `hero-cinematic-pre` path. Dead-code it to shrink the bundle and the maintenance surface.

### 🟡 Q4 — Duplicated `useScrollReveal` + duplicated animation constants
The same `useScrollReveal` is copy-pasted into 6 page files (with the dependency-array bug in 6 of them), and `fadeUp`/`stagger` are redefined locally in `Contact.jsx:11-19` despite existing in `lib/animations.js`. Extract one `useScrollReveal` into `lib/` and import the shared variants.

### 🟢 Q5 — Likely-unused dependencies
`@radix-ui/react-accordion`, `@radix-ui/react-dialog`, `@radix-ui/react-select`, and `axios` are in `package.json` but I find no imports in `src/`. Either adopt them (Radix Dialog would fix H5 nicely; a real `axios` call would back C4) or remove them to cut install/bundle size. `wheelRef` in `SpinWheel.jsx:20/73` is assigned but unused.

### 🟢 Q6 — `VIDEOS = []` and other vestigial exports
`mockData.js:42` exports an empty `VIDEOS`. Minor, but remove vestigial exports as you go.

---

## 5. Accessibility (consolidated checklist)
- [ ] Modals/lightbox: `role="dialog"`, `aria-modal`, Escape, focus trap, focus return, body scroll lock (H5).
- [ ] Mobile menu: lock body scroll while open; consider `aria-expanded` on the toggle.
- [ ] Color contrast on `zinc-500/600` body text (M3).
- [ ] Hero: ensure inactive CTA layer is `inert`/`aria-hidden` (M7).
- [ ] Icon-only controls: most have `aria-label`/`title` (good — Navbar toggle, chat toggle, floating buttons). The Navbar mobile toggle has `data-testid` but no `aria-label` — add one ("Open menu").
- [ ] Respect for reduced motion is **well handled** already (`useReducedMotion` + a thorough `@media (prefers-reduced-motion)` block in `index.css:693`). 👍
- [ ] Forms: inputs have `<label>`s (good). Add `aria-required`/error text association for the required name/phone fields.

## 6. Things that are done well 👍
- Consistent design system (CSS variables, `@theme` tokens, reusable `.btn-primary`/`.section-tag`).
- Genuinely strong reduced-motion coverage.
- `rel="noopener noreferrer"` on all external links.
- `data-testid` hooks throughout — ready for E2E tests.
- The pre-graded canvas hero approach (blitting baked frames) is a smart perf choice vs. compositing live.
- Clean component decomposition in `Home.jsx` (each section is its own component with static fallbacks for reduced motion).

---

## 7. Suggested order of attack
1. **C1 + C2** (SPA rewrite + 404 route) — without these, shared links are broken. ~30 min.
2. **C4** (Contact form honesty / wire to WhatsApp). ~30 min.
3. **C3 + H3** (delete `app/` and ~20 MB unused assets). ~15 min.
4. **Q1** (clear the 15 lint errors — mostly deletions). ~20 min.
5. **H1** (one-line dep-array fix × 6). ~10 min.
6. **H4** (route-level `React.lazy`) + **H2** (lazy-load frame sets). Biggest perf win.
7. **H5** (Radix Dialog for modals) + **M3** contrast pass.
8. **M1** (JSON-LD + canonical + robots/sitemap) — local-SEO payoff.

None of these block the build; C1–C4 block a *correct* launch.
