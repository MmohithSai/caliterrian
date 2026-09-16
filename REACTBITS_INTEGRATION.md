# React Bits Animation Integration

**Date:** 2026-06-12
**Branch:** `website-redesign`
**Source:** [React Bits](https://reactbits.dev) component library, browsed and fetched via the `reactbits` MCP server (99 components surveyed across Animations / Backgrounds / Components / TextAnimations).

This documents what was chosen, what was rejected, how each component was adapted, and exactly where everything is wired in.

---

## 1. TL;DR

Seven React Bits components were adapted into `src/components/reactbits/` and wired into the homepage + app shell. **Zero new npm dependencies** — everything runs on the already-installed `gsap@3.15` (SplitText/ScrollTrigger are free since GSAP 3.13) and `framer-motion@12`. Build, lint, and a Playwright visual pass are all green.

| React Bits component | Used in | Effect |
|---|---|---|
| **SplitText** (GSAP) | Hero + Final CTA headlines | Word-by-word kinetic rise, line 2 cascades after line 1 |
| **CountUp** | Hero trust bar | 500+ / 9+ / 12 / 4.9 spring-count up on scroll into view |
| **SpotlightCard** | Membership tiers + Results reason cards | Cursor-tracking blue radial glow (Linear-style) |
| **Magnet** | Hero + Final CTA primary buttons | Subtle magnetic pull toward the cursor |
| **GlareHover** | Hall of Firsts feed + Results story media | Diagonal light sweep across imagery on hover |
| **ClickSpark** | Global (public shell only) | Blue spark burst at every click point |

---

## 2. Selection rationale

The locked design target is **Nike + Linear + Apple** on the Caliterrain Blue system (`#2E8DFF` on `#0B1016`). Selection criteria:

1. **No new dependencies.** Anything requiring `ogl` (Particles, LightRays, Aurora, Iridescence…) or new three.js post-processing was rejected outright.
2. **Don't fight the existing motion language.** The homepage already has a coherent framer-motion `reveal`/`stagger` system (`src/components/home/anim.js`), `StatRing` count-up rings, scroll parallax in `MediaSlot`, and the Three.js facility gallery. React Bits additions are layered *on top* (hover/cursor micro-interactions, headline typography) rather than replacing the scroll-reveal spine.
3. **Premium, not playful.** Rejected as off-brand: BlobCursor, SplashCursor, MetaBalls, Ballpit, FuzzyText, GlitchText, LetterGlitch, Balatro, FaultyTerminal, StickerPeel, etc. The site sells coaching, not a crypto landing page.
4. **Performance.** Everything chosen is canvas-2D, CSS, or transform-only. Nothing WebGL was added (the facility gallery already owns that budget).

---

## 3. The components (`src/components/reactbits/`)

Each file is the React Bits source fetched via MCP, then adapted. Adaptations are noted in a header comment in each file and detailed here.

### 3.1 `SplitText.jsx` (TextAnimations → GSAP)
- **Deps:** `gsap`, `gsap/ScrollTrigger`, `gsap/SplitText` (all in the existing `gsap` package).
- **Adaptations vs. stock:**
  - Renders a configurable `tag` (default `<span>`) instead of a hardcoded `<p>`, so it can sit inside the existing `ct-display` `<h1>`/`<h2>` two-line headings.
  - Added `startDelay` (seconds) so the accent second line cascades after the first.
  - **Replay bug fixed:** stock keys its effect on the `from`/`to` object props, which get new identities every parent render — opening the booking modal would have re-split and replayed the hero. Effect deps now use `JSON.stringify(from/to)`.
  - Respects `prefers-reduced-motion` (renders static text, no split).
  - Removed `overflow: hidden` + forced `textAlign` from the stock wrapper (would clip Bebas Neue at `line-height: 0.92` and fight the layout); animation uses `y: 0.55em` + opacity, so no clip container is needed.
- **Defaults tuned:** `splitType="words"`, 60 ms stagger, `power3.out`.

### 3.2 `CountUp.jsx` (TextAnimations → framer-motion)
- Near-verbatim React Bits source (spring-driven `useMotionValue` + `useInView once`).
- Handles decimals automatically (4.9 renders as 4.9, not 5).
- Suffix handling ("+" in "500+") is done at the call site (`TrustValue` in `intro.jsx`), not in the component.

### 3.3 `SpotlightCard.jsx` + `SpotlightCard.css`
- **Adaptations:** stock ships its own surface (dark bg, border, radius, padding). All of that was stripped so `.ct-card` / the featured-tier styles keep driving the look — only `position:relative; overflow:hidden` + the glow layer remain.
- Glow moved from `::before` to `::after` with `pointer-events:none` so it sits above card content backgrounds without stacking-context fights; also activates on `:focus-within` for keyboard users.
- Default spotlight color is Caliterrain Blue at 14% (`rgba(46,141,255,0.14)`).

### 3.4 `Magnet.jsx`
- Stock logic, with defaults softened for CTAs: `magnetStrength 4` (stock 2 = twice the pull), `padding 80`.
- Respects `prefers-reduced-motion`.
- **Lint fix:** stock called `setPosition` synchronously inside the effect when disabled (`react-hooks/set-state-in-effect`); the disabled case is now handled at render time instead.

### 3.5 `GlareHover.jsx` + `GlareHover.css`
- **Rewritten as a "fill" variant:** stock imposes fixed `width/height/background/border` (it's designed as a standalone card). This version has no surface of its own — it overlays the diagonal light sweep on whatever it wraps (our media cards keep their own chrome).
- Glare band disabled entirely under `prefers-reduced-motion` (CSS media query).
- Defaults: white glare at 18% opacity, −30°, 750 ms sweep.

### 3.6 `ClickSpark.jsx`
- **Rewritten for global use:** stock sizes its canvas to its parent element — wrapping a long page would allocate a page-height bitmap (tens of millions of pixels). This version renders one `position:fixed`, viewport-sized canvas (`z-[9999]`, `pointer-events:none`, `aria-hidden`) and listens for clicks on `window`.
- Skips entirely (no canvas work, no listeners) under `prefers-reduced-motion`.
- Defaults: 8 sparks, Caliterrain Blue, 450 ms, ease-out.

---

## 4. Integration map (what changed where)

### `src/components/home/intro.jsx` (Hero)
- `<motion.h1>` headline → plain `<h1>` containing two `SplitText` lines (`words` split, 70 ms stagger; line 2 `startDelay 0.3`). The h1 was removed from the framer `reveal` variant so the two systems don't double-animate.
- New `TrustValue` helper: parses `"500+"` → `<CountUp to={500} />` + literal `"+"` suffix; non-numeric values pass through untouched.
- Hero primary CTA wrapped in `<Magnet>` (secondary CTA intentionally left static — one magnetic element per cluster).

### `src/components/home/skills.jsx` (Hall of Firsts)
- Each achievement feed card's `MediaSlot` is wrapped in `<GlareHover className="h-full">`. The "You're next" ghost card is left untouched.

### `src/components/home/proof.jsx` (Results · Memberships · Final CTA)
- Results "reasons" cards: `ct-card` classes moved onto `<SpotlightCard>` inside the `motion.div` (which keeps the scroll reveal).
- Member story media wrapped in `<GlareHover>`.
- Membership tiers: card surface moved onto `<SpotlightCard>`; featured tier gets a stronger spotlight (22% vs 12%). **The "Most Popular" badge stays outside the SpotlightCard** on the relative `motion.div` — SpotlightCard is `overflow:hidden` and would clip the `-top-3` offset.
- Final CTA: headline → two `SplitText` lines mirroring the hero; button wrapped in `<Magnet>` (centered by the parent's `text-center`, so `mx-auto` was dropped from the button).

### `src/App.jsx`
- `<ClickSpark />` mounted once at the end of the public shell. **Not** mounted on `/admin/*` (that branch returns earlier).

### `src/components/home/ui.jsx` (drive-by lint fix)
- `StatRing`'s reduced-motion branch called `setDisplay` synchronously in its effect (pre-existing `react-hooks/set-state-in-effect` error, surfaced by the current eslint-plugin-react-hooks). Now uses `animate(..., { duration: 0 })` so the jump happens through the async `onUpdate` callback. Behavior unchanged.

---

## 5. Hard constraints — verified untouched

- `onBookTrial` modal spine: every wrapped CTA still calls the same handler (Magnet/SplitText wrap presentation only).
- Form `name` attributes, Edge Functions, Supabase, `/admin/*`, analytics event names, SEO/JSON-LD: untouched.
- Real prices/copy: untouched (all changes are presentational wrappers around existing data from `src/data/home.js`).

## 6. Accessibility & performance notes

- All four motion-heavy components honor `prefers-reduced-motion` (SplitText → static text, Magnet → no pull, GlareHover → no sweep, ClickSpark → fully inert). CountUp still settles on the correct final value.
- No layout shift: SplitText animates transform/opacity only; CountUp reserves the same text node.
- Bundle impact: `gsap` chunk grew ~28 kB min (SplitText + ScrollTrigger plugins now bundled); Home chunk +~5 kB. No new network requests, no new packages.

## 7. Verification

- `npm run build` → ✅ (2243 modules; the >500 kB warning is the pre-existing `FacilityGallery3D` three.js chunk).
- `npx eslint src/components/reactbits src/components/home src/App.jsx` → ✅ clean.
- Playwright visual pass (`_shootrb.mjs`, throwaway like the other `_shoot*.mjs` scripts) → `review-screenshots/rb-*.png`: hero SplitText + CountUp mid-flight, memberships with un-clipped badge + hover spotlight, Hall of Firsts, Final CTA all render correctly at 1440×900.

## 8. How to extend / remove

- **Add another React Bits piece:** fetch source via the `reactbits` MCP server (`get_component` / `get_component_demo`), drop it in `src/components/reactbits/`, strip its built-in surface styles, add a reduced-motion guard, and tint to `#2E8DFF`.
- **Remove an effect:** each integration is a thin wrapper — delete the wrapper element (and its import) and the original markup remains intact. ClickSpark is a single line in `App.jsx`.
- **Tuning knobs:** SplitText `delay`/`startDelay`, Magnet `magnetStrength` (higher = subtler), SpotlightCard `spotlightColor`, GlareHover `glareOpacity`/`transitionDuration`, ClickSpark `sparkCount`/`duration`.
