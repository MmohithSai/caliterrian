# Design

Captured from the shipping code (`src/index.css`, homepage components) and the locked 2026 redesign decisions in `REDESIGN_STATUS.md`. This system is **locked identity**: refine it, never replace it.

## Theme

Dark, cinematic, facility-first. Near-black blue-tinted base; photography under scrims is the surface. Scene: a prospective member on a phone at night, deciding whether this gym is serious. The dark theme is the gym at golden hour on video, not "dark mode."

## Color

Strategy: **Committed, logo-derived** — every color comes from the Cali Terrain badge (navy ink, powder blue, ice, white). Neutrals are shades of the badge navy; the powder blue carries the identity across glows, ticks, connectors, and states.

Logo source colors: navy ink `#041C38` · slate `#324E6C` · powder `#8DB6D7` · ice `#C9DCEC` · white.

- `--color-obsidian: #051220` — page background (deepened badge navy)
- `--color-surface: #0A1D31` — cards/surfaces (elevated: `#0E2740`)
- Border: `#16324E`
- **Cali Terrain Powder** `#8DB6D7` (hover `#A9C9E3`, ink `#041C38`, bright tint `#C9DCEC`)
- On powder backgrounds text is always navy ink `#041C38` (mirrors the logo's navy-on-lightblue banner)
- Secondary text: `#92ABC4`; hint text `#5A7896`
- Deep-band background: `#02080F` (hero, journey)
- Ice `#C9DCEC` — reserved for mastery/final-stage moments only (replaces the old gold)
- Success `#34D399`, danger `#F87171` (semantic only; not brand)

Rules: powder glow is an accent (shadows, 1px ticks, node rings), never a wash. Ice appears only at journey summits and highlight tints.

## Typography

- Display: **Bebas Neue** — uppercase, line-height 0.85–0.92, tracking 0.01–0.06em, `clamp()` fluid scale up to 11rem in the hero. Two-tone convention: white headline + one blue accent word (`.ct-display .accent`).
- Body/UI: **Manrope** 300–800. Uppercase micro-labels at 600–700 weight with 0.22–0.34em tracking.
- Eyebrow grammar: `.ct-eyebrow` — blue uppercase Manrope with a leading 2px glowing tick.
- Stats and counters use tabular figures.

## Components

- `.ct-media` — cinematic media slot: parallax layer, scrim, CSS color grade, hover zoom; placeholder variant with blueprint grid + moving sheen.
- `.ct-card` — surface card, blue edge-glow lift on hover.
- `.ct-node` / `.ct-skill` — skill-tree nodes with mastered/in-progress/available/locked states.
- `.ct-connector` — gradient hairlines joining stages (connectors, not grids).
- `.ct-ring` — conic-gradient progress rings.
- Buttons: sharp corners (`--radius: 2px` globally), primary blue with glow shadow, `.kinetic-button` sheen sweep.

## Motion

- Lenis smooth scroll + GSAP (hero scroll choreography) + framer-motion + React Bits (SplitText, CountUp, SpotlightCard, Magnet, GlareHover, ClickSpark, Particles, DotGrid, ElectricBorder, ShinyText, FuzzyText).
- Atmosphere layers: Particles (cursor-parallax blue specks) behind every PageHero band; interactive DotGrid (proximity glow + inertia scatter + click ripple) behind plain sections (Contact, Blog grid, Coaches/Transformations/Pricing closing bands, Programs blue banner). ElectricBorder is reserved for offer/reward moments only.
- House easing: `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quint family). Durations 220–800ms.
- Scroll reveals: `.scroll-fade` rise-and-fade with staggered delays.
- Every animation has a `prefers-reduced-motion: reduce` fallback. This is non-negotiable.

## Layout

- Sharp geometry: 2px radius, 1px hairline borders, thin blue scrollbar.
- Sections vary density deliberately; one dominant element per section.
- Film grain / noise overlays at 0.03–0.04 opacity for texture.
