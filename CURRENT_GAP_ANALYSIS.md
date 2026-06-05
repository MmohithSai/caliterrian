# CURRENT GAP ANALYSIS — Caliterrain build vs references

> Scored from `review-screenshots/` (17 live sections) against `DesignReferences/`,
> cross-checked against the source in `src/components/home/*` and `src/data/home.js`.
> Scoring is deliberately harsh. 8/10 = "a stranger would call it a faithful copy."
> Anything below 8 is a failure that goes to `REBUILD_PLAN.md`.

## Scoring legend
- **Visual Style** — palette, type, scrim, photography treatment
- **Layout Accuracy** — structural match to the reference's architecture
- **Interaction Match** — does the reference's interaction exist?
- **Storytelling** — does it advance the "where am I → where am I going → what unlocks next" spine?
- **Reference Match** — overall "is this the same thing?"

---

## ⚠️ The cross-cutting failure: empty MediaSlot placeholders

Before per-section scores — the single biggest issue is not architecture, it's **assets**.

`src/components/home/ui.jsx` `MediaSlot` renders an animated **placeholder** (grid shimmer +
`ImageIcon` + a text label like "MEMBER PHOTO" / "COACH PORTRAIT") whenever no `img`/`video`
is supplied. In the live screenshots the following sections are **running entirely on
placeholders**: Hall of Firsts, Member Journeys, Disciplines, Coaches, Facility panorama,
Facility zone grid, Community, Testimonials. The Problem and Path tiles are also placeholder-only.

The references are ~70% photography. **An empty Hall of Firsts / Disciplines / Coaches reads as a
wireframe, full stop.** No amount of layout work fixes "this looks unfinished" — roughly half the
gym-vs-ecosystem feeling is just missing imagery. This is called out per-section and is the
**#1 priority** in the rebuild plan.

---

## Per-section scorecard

| # | Section | Visual | Layout | Interaction | Story | Ref Match | Verdict |
|---|---|:--:|:--:|:--:|:--:|:--:|---|
| 1 | Hero | 9 | 9 | 6 | 8 | **8** | ✅ Pass (wire the video) |
| 2 | The Problem | 7 | 6 | 5 | 7 | **6** | ❌ Rebuild layout |
| 3 | The Path | 7 | 3 | 2 | 5 | **4** | ❌❌ Rebuild — it's a grid, not a journey |
| 4 | **Skill Tree** | 7 | 3 | 3 | 4 | **3** | ❌❌❌ Rebuild from scratch |
| 5 | Hall of Firsts | 5 | 6 | 2 | 5 | **4** | ❌❌ Rebuild — no feed, no photos |
| 6 | Member Journeys | 7 | 7 | 5 | 7 | **6** | ⚠️ Fix (or merge into Results) |
| 7 | First Session | 7 | 6 | 4 | 7 | **6** | ❌ Add photos + arrows |
| 8 | Disciplines | 6 | 7 | 5 | 6 | **5** | ❌ Photos only missing, else OK |
| 9 | Coaches | 7 | 6 | 4 | 6 | **5** | ❌ Photos + member quotes + 4 coaches |
| 10 | Facility | 6 | 7 | 7 | 6 | **6** | ⚠️ Panorama built but image empty |
| 11 | Community | 6 | 5 | 3 | 4 | **4** | ❌❌ Generic icon grid |
| 12 | Why Stay | 8 | 7 | 4 | 7 | **7** | ⚠️ Add ring stats |
| 13 | Testimonials | 6 | 7 | 4 | 6 | **5** | ❌ Wire real video posters |
| 14 | Memberships | 9 | 9 | 7 | 8 | **9** | ✅ Pass — best section on the site |
| 15 | FAQ | 8 | 8 | 7 | 7 | **8** | ✅ Pass |
| 16 | Visit | 8 | 8 | 7 | 7 | **8** | ✅ Pass |
| 17 | Final CTA | 9 | 9 | 8 | 8 | **9** | ✅ Pass |

**Passing (≥8):** Hero, Memberships, FAQ, Visit, Final CTA = **5 of 17**.
**Failing (<8):** Problem, Path, Skill Tree, Hall of Firsts, Member Journeys, First Session,
Disciplines, Coaches, Facility, Community, Why Stay, Testimonials = **12 of 17**.

---

## Detailed gap notes (failing sections)

### 2 · The Problem — 6/10
- **Current:** Two-column. Left = myth quote. Right = headline + 4 small `3/4` poster tiles
  (Can't Do Push-Up 🔒 → Push-Up → Pull-Up → +1) + a resolve bar. The progression idea is present.
- **Reference (`2eba9916`/`47b90ff8`):** A deliberate **`VS` pivot** between the myth and the
  reality filmstrip; the ❌→✓ states are large, photographic, and unmistakable.
- **Missing:** The `VS` device; larger photographic tiles; the ❌ on the locked state reads weakly.
  Layout is cramped/asymmetric vs the balanced reference. Tiles are placeholders.
- **Fix tier:** Layout polish, not a rebuild.

### 3 · The Path — 4/10  ❌❌
- **Current:** `grid grid-cols-2 md:3 lg:6` of **6 equal poster cards**. No connection between them.
  It is literally a 6-up card grid (`intro.jsx` `PathSection`).
- **Reference (`22de9684`/`14`):** A **single connecting line threads 6 ring nodes**; each stage
  shows sample skills; stages are grouped into mastery tiers (Foundation→Mastery). It reads as a
  metro map of progression.
- **Missing:** The connecting line/nodes (the entire point), the numbered ring treatment, the
  per-stage skill preview, the grouped-tier bands. Currently zero "journey" affordance.
- **Fix tier:** **Full rebuild** into a connected horizontal journey.

### 4 · Skill Tree — 3/10  ❌❌❌ (worst section, highest stakes)
- **Current (`skills.jsx` `SkillTreeSection`):** A flat `grid-cols-2 sm:3` of **6 plain buttons**
  + a detail card on the right. No edges, no dependencies drawn, no node states, no locked/mastered,
  no progress %. It's a tab group styled as boxes. `SKILLS.nodes[].prereq` data **exists** but is
  only rendered as text chips ("Requirements: Push-Up") — the graph structure is thrown away.
- **Reference (`fe7e0d0b`/`47b90ff8`):** A true **RPG dependency graph** — nodes positioned in a
  tree, **edges drawn between prerequisites**, states colour/icon-coded (Mastered/In-Progress/
  Available/Locked), a **detail rail** (video, requirements, avg time, difficulty, coach insight,
  related skills, "Start working on this skill"), and a **personal "YOUR PROGRESS 37%" widget** +
  "Take Assessment".
- **Missing:** Literally everything that makes it a *tree* and a *game* — edges, states, locks,
  progress, the dependency-path highlight. This is the signature interaction of the whole site and
  it is currently absent.
- **Fix tier:** **Rebuild completely** (SVG/positioned node graph). This is the make-or-break item.

### 5 · Hall of Firsts — 4/10  ❌❌
- **Current:** 6 poster cards, **all placeholders** ("MEMBER PHOTO"), with a milestone badge +
  name + date. Static `whileInView` reveal. No reactions, no motion, no "feed" feeling.
- **Reference (`f18b9d92`):** A **live achievement stream** — real athlete photos, milestone
  badges, dates, **cheer/reaction counts**, a "your milestone starts here" ghost card, horizontal
  flow that feels like a social feed.
- **Missing:** Photos (critical), reaction counts, the marquee/scroll motion, the ghost "you're
  next" card, the alive/community feeling.
- **Fix tier:** Rebuild into a horizontally-scrolling/marquee feed + wire photos + add reactions.

### 6 · Member Journeys — 6/10  ⚠️
- **Current:** 2 timeline cards (Rahul, Arjun) with month-by-month steps + quote. Structurally fine,
  but images are placeholders and the references actually express this as **video stories**
  (`453c6f65`), not month tables.
- **Decision needed:** Either (a) wire photos + keep as written-timeline, or (b) **merge into a
  single Results/Testimonials section** matching `453c6f65` (ring stats + video stories) to avoid
  redundancy with Section 13. Currently 6 + 13 overlap.

### 7 · First Session — 6/10
- **Current:** 5 numbered **icon** cards in a row + reassurance chips + CTA. Clean but flat.
- **Reference (`2fd25b69`):** 5 numbered cards **each over a real coaching photo, joined by →
  arrows**, with "what to expect" captions.
- **Missing:** The photo behind each step; the connecting arrows; the per-step "what to expect" line.
- **Fix tier:** Add photo backgrounds + arrow connectors (moderate).

### 8 · Disciplines — 5/10
- **Current:** 3×3 placeholder grid. Structure matches the reference grid; **only the photography is
  missing** — and that's what makes the reference work. Also headline could shift to the master
  frame's "WE TRAIN FOR EVERYTHING THAT MAKES YOU CAPABLE".
- **Fix tier:** Wire photos (primary) + headline tweak. Low structural effort, high visual payoff.

### 9 · Coaches — 5/10
- **Current:** **2** coaches, placeholder portraits, outcome checklist. No member quotes.
- **Reference (`48c6c57b`):** **4** coaches, real portraits, specialty tags, outcome stats, **and a
  nested member success quote with avatar** per coach.
- **Missing:** 2 more coaches, real portraits, the nested member quote (the trust device).
- **Fix tier:** Add photos + member quote block + expand to 4.

### 10 · Facility — 6/10  ⚠️ (closest near-miss)
- **Current:** The **hotspot panorama interaction is actually built** (`facility.jsx`, `PIN_POS`
  pins with hover tooltips) + a 10-zone grid. But the panorama `img` is empty → pins float on a dark
  void, and the zone grid is placeholders. The interaction exists; the asset doesn't.
- **Reference (`d44d3bfb`/`81615a6c`):** Hotspots sit on a **real wide facility photo**; hovering a
  pin loads a **detail card** (photo+blurb+learn-more); a thumbnail rail navigates.
- **Missing:** The panorama photo (critical — it's the whole effect), the per-pin detail card on
  hover/click (currently just a name tooltip), zone photos.
- **Fix tier:** Wire panorama + upgrade tooltip → detail card. Mostly assets + a small interaction bump.

### 11 · Community — 4/10  ❌❌
- **Current:** 4 placeholder cards (Events / Workshops / Challenges / Meetups) with icons. Generic.
- **Reference:** Community is expressed through the **Hall of Firsts feed** and real event imagery,
  not flat labelled boxes. This section as-is adds little and dilutes the page.
- **Fix tier:** Either re-skin with real event photos + a "this week at Caliterrain" feel, or **cut
  and fold into Hall of Firsts** to keep one strong community moment instead of two weak ones.

### 12 · Why Stay — 7/10  ⚠️
- **Current:** 3 plain stats (500+/9+/4.9★) + 4 reason cards. Solid, on-brand.
- **Reference (`453c6f65`):** The signature is **animated circular-ring stats (83/67/92)** tied to
  outcomes ("Achieved First Pull-Up").
- **Missing:** The ring-stat treatment and outcome-framed numbers.
- **Fix tier:** Upgrade stats to animated rings (low effort, high "alive" payoff).

### 13 · Testimonials — 5/10
- **Current:** 3 video-card placeholders + quotes. Structure right, posters empty.
- **Reference (`453c6f65`):** Play button over **real athlete photo**, name, **skill achieved** tag.
- **Missing:** Real poster images, the "skill achieved" tag, working video. Overlaps Member Journeys.
- **Fix tier:** Wire posters + merge with Section 6 into one Results block.

---

## Summary of root causes

1. **Missing photography** (8 sections on placeholders) — biggest single cause of "wireframe" feel.
2. **Grids where the reference has connectors** — Path and Skill Tree are the two that destroy the
   "ecosystem" reading. These are *structural*, not cosmetic, failures.
3. **No gamification state** — nothing shows locked/available/mastered/progress%. The references
   lean on this everywhere; the build shows it nowhere.
4. **Static where references are alive** — Hall of Firsts and Why-Stay stats should move/react.
5. **Redundancy** — Member Journeys + Testimonials + Community are three overlapping "social proof"
   sections; the references consolidate into Hall of Firsts (feed) + Results (ring stats + video).

## What's already good (don't touch)
- Hero composition, the design tokens/palette/type, Memberships, FAQ, Visit, Final CTA.
- The `MediaSlot` primitive itself is well-built — it just needs assets passed in.
- The data layer (`home.js`) already models stages, nodes, prereqs — the rebuild is mostly
  **presentation**, not new data.
