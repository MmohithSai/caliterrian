# REBUILD PLAN — Caliterrain reference alignment

> Ordered by impact. Every entry follows the **Implementation Rule**: it names the reference
> image, the pattern, the interaction, and the reason — if those can't be stated, it isn't built.
> Nothing here is coded until this plan is approved.

## Guiding principles (from the brief)
1. **Story before content** — every section advances *where am I → where am I going → what unlocks next*.
2. **One dominant element per section** — a path, a tree, a feed, a panorama. Never 6 equal cards.
3. **Vary density** — Hero → sparse → dense → immersive → interactive → CTA. No grid-grid-grid.
4. **Gamify progression** — levels, locks, milestones, progress bars, dependencies.
5. **Make users imagine themselves progressing.**

## Sequencing (do in this order)

| Phase | Work | Why first |
|---|---|---|
| **P0** | Wire all photography into `MediaSlot` slots | Removes the "wireframe" read across 8 sections; unblocks judging everything else |
| **P1** | Rebuild **Skill Tree** (dependency graph + detail rail + progress) | Signature interaction; biggest gym→ecosystem swing |
| **P2** | Rebuild **The Path** (connected journey) | Establishes the spine the whole page references |
| **P3** | Rebuild **Hall of Firsts** (live feed) | Community "alive" feeling; pairs with P1/P2 |
| **P4** | Upgrade First Session, Disciplines, Coaches, Facility (photos + small interactions) | Polish passes on near-misses |
| **P5** | Consolidate Member Journeys + Testimonials + Community → Results + Feed; ring stats | Removes redundancy; tightens narrative |

---

## P0 · Asset pipeline (prerequisite for everything)

- **Reference used:** all frames (every one is photography-saturated).
- **Reference pattern:** full-bleed athlete/facility photo under a dark scrim.
- **Reference interaction:** none — static imagery.
- **Reason:** `MediaSlot` already supports `img`/`video`; the slots are simply empty. This is the
  highest ROI work on the site and gates the value of every later phase.
- **Steps:**
  1. Collect/produce real photography for: hero panorama (video ideal), 4 problem states, 6 path
     stages, skill demo clips, ~8 Hall-of-Firsts member photos, 9 disciplines, 4 coach portraits +
     member avatars, facility panorama + ~10 zones, testimonial posters.
  2. Add `img:` (and `video:` for hero/skill demos) keys to the matching records in
     `src/data/home.js`. No component changes required — `MediaSlot` renders them automatically.
  3. Keep the placeholder system as the graceful fallback for any slot still awaiting art.
- **Expected UX:** the page stops looking unfinished; the existing layouts immediately read 2–3
  points higher before any structural work.

---

## P1 · Skill Tree — rebuild completely  ★ centrepiece

- **Reference used:** `fe7e0d0b` (primary), `47b90ff8` (in-context).
- **Reference pattern:** RPG dependency graph + right-hand detail rail + personal progress widget.
- **Reference interaction:** click a node → its prerequisite path highlights → detail rail loads;
  nodes show Mastered/In-Progress/Available/Locked; "YOUR PROGRESS 37%" + "Take Assessment".
- **Reason:** This is the one feature that converts "gym site" into "progression ecosystem." The
  current flat button grid (`skills.jsx`) discards the `prereq` graph that already exists in data.

**Current problem:** 6 plain buttons in a grid; no edges, states, locks, or progress.

**New layout:**
- A positioned node graph (CSS-positioned nodes + an SVG `<path>`/`<line>` layer for edges).
  Suggested tiers left→right or bottom→top: Push-Up → {Pull-Up, Dip} → {L-Sit, Muscle-Up} →
  {Handstand, Back Lever} → Front Lever, with edges = `prereq` relations from `home.js`.
- Node states driven by a `state` field: `mastered ✓` / `in-progress ◐` / `available ●` / `locked 🔒`
  with the Caliterrain Blue glow on available/active nodes, muted on locked.
- Right detail rail (reuse current card content): demo video, Requirements (from `prereq`), Avg
  Timeline, Difficulty, **add** a Coach Insight line + Related Skills chips + "Start Working On This
  Skill".
- Bottom-left **progress widget**: circular % ("YOUR PROGRESS 37%") + mastered/in-progress/locked
  counts + "Not sure where to start? Take Assessment" → opens trial modal.

**New interactions:**
- Hover node → highlight; click node → `setActiveId` (already exists) **+ highlight its prereq path**
  (walk `prereq` chain, emphasise those edges/nodes).
- Locked nodes show a lock + tooltip "Unlock by mastering {prereq}". 

**Implementation steps:**
1. Extend `SKILLS.nodes` in `home.js` with `state` and graph `position` (col/row or x/y%).
2. Replace the `grid` in `SkillTreeSection` with a positioned graph + an SVG edge layer computed
   from `prereq`.
3. Add node-state styling (extend the existing `.ct-node` styles in `index.css`).
4. Add the progress widget + assessment CTA.
5. Keep the detail rail; add Coach Insight + Related Skills.

**Expected UX:** curiosity and exploration — the visitor traces a path to a skill they want and
sees exactly what unlocks it. RPG feeling achieved.

---

## P2 · The Path — rebuild into a connected journey

- **Reference used:** `22de9684` (primary), `5c4c225e` (tier grouping).
- **Reference pattern:** one connecting line through 6 numbered ring nodes; per-stage skill preview;
  stages grouped into mastery tiers (Foundation → Mastery).
- **Reference interaction:** roadmap; each stage previews its sample skills ("VIEW SKILLS →").
- **Reason:** The Path is the page's spine. As a 6-up card grid it reads as products, not a journey.

**Current problem:** `grid-cols-6` of disconnected equal cards.

**New layout:** horizontal rail (desktop) / vertical rail (mobile) with:
- A continuous progress line (SVG or gradient div) threading all 6 stages.
- Numbered ring nodes (01–06) sitting on the line.
- Under each node: stage name + blurb + 2–3 sample skill chips.
- Optional grouped tier bands above (Foundation · Strength · Control · Skill · Mastery) per `5c4c225e`.
- Keep the 4 pillars row below.

**New interactions:** hover/click a stage → lifts + reveals its sample skills; line can animate-draw
on scroll-in.

**Steps:** rewrite `PathSection` in `intro.jsx`; reuse `PATH.stages`; add `skills[]` previews to
each stage in `home.js`; add the line/node CSS.

**Expected UX:** "there is a route and I can see every step from beginner to mastery."

---

## P3 · Hall of Firsts — rebuild into a live feed

- **Reference used:** `f18b9d92`.
- **Reference pattern:** horizontal achievement *stream* — member photo + milestone badge + name +
  date + cheer/reaction count + a "your milestone starts here" ghost card.
- **Reference interaction:** marquee/horizontal scroll that feels alive; reaction counts imply a feed.
- **Reason:** Current static placeholder grid feels dead; the reference's value is *community momentum*.

**Current problem:** 6 static placeholder poster cards, no motion, no reactions.

**New layout:** horizontally-scrolling rail (or auto-marquee) of member cards, each with a real
photo, milestone badge, name, date, and a **cheers count** (e.g. "❤ 34"); end the rail with a ghost
"Your milestone starts here →" card opening the trial modal.

**New interactions:** drag/auto-scroll marquee; subtle stagger-in; reaction count micro-animation.

**Steps:** rewrite `HallOfFirstsSection` in `skills.jsx`; add `reactions` + real `img` to
`HALL_OF_FIRSTS.items`; add a marquee/scroll container.

**Expected UX:** belonging + FOMO — "I want my card in this stream."

---

## P4 · Near-miss upgrades (photos + small interactions)

### First Session (`2fd25b69`)
- **Pattern/interaction:** numbered steps over real coaching photos, joined by → arrows, each with a
  "what to expect" caption. **Reason:** current icon cards read as a checklist, not a walkthrough.
- **Steps:** add photo backgrounds to each step in `FIRST_SESSION.steps`; add arrow connectors
  between cards; add a one-line "what to expect" per step.

### Disciplines (`0388f4eb`, `47b90ff8`)
- **Pattern:** full-bleed athlete photo grid; headline → "WE TRAIN FOR EVERYTHING THAT MAKES YOU
  CAPABLE". **Reason:** structure is already correct; only photography + headline are off.
- **Steps:** wire `DISCIPLINES.items[].img`; update headline copy. (Mostly P0.)

### Coaches (`48c6c57b`)
- **Pattern:** 4 portrait cards + specialty tags + outcome stats + **nested member success quote w/
  avatar**. **Reason:** trust comes from outcomes + a member voice, missing today; only 2 coaches.
- **Steps:** expand `COACHES.items` to 4; add `img` portraits + `memberQuote {text, name, avatar}`;
  render the quote block inside each card.

### Facility (`d44d3bfb`, `81615a6c`)
- **Pattern/interaction:** `+` hotspots on a **real panorama**; hovering a pin loads a detail card
  (photo + blurb + learn-more); thumbnail rail navigates. **Reason:** the interaction is already
  built (`PIN_POS`); it just floats on a void and the tooltip is name-only.
- **Steps:** wire `FACILITY.panorama.img`; upgrade the pin tooltip into a detail card (photo+blurb);
  wire zone photos; optionally make the thumbnail grid drive the active pin.

---

## P5 · Consolidate social proof + ring stats

- **Reference used:** `453c6f65`.
- **Reference pattern:** ring stats (83/67/92, outcome-framed) + "I THOUGHT I COULDN'T" video stories.
- **Reason:** Member Journeys (6), Testimonials (13), and Community (11) are three overlapping
  social-proof sections. The references consolidate into **Hall of Firsts (feed)** + **Results (ring
  stats + video stories)**.
- **Decision for approval (see questions):** how aggressively to consolidate.
- **Steps:**
  1. Upgrade Why-Stay / Results stats to **animated circular rings** with outcome labels.
  2. Merge Testimonials into a single "I thought I couldn't" video-story row (real posters + skill
     tag).
  3. Either re-skin Community with real event photos **or** fold it into Hall of Firsts.
  4. Keep Member Journeys only if it tells a distinct month-by-month story with real photos;
     otherwise retire it into the video stories.

---

## Final section order (proposed)

1. Hero · 2. The Problem · 3. **The Path (connected)** · 4. **Skill Tree (graph)** ·
5. **Hall of Firsts (feed)** · 6. First Session · 7. Disciplines · 8. Coaches ·
9. Facility (panorama) · 10. Results (ring stats + video stories) · 11. Memberships ·
12. FAQ · 13. Visit · 14. Final CTA

(Community folded into Hall of Firsts; Member Journeys + Testimonials folded into Results.)

---

## Definition of done
- No section scores below 8 in a re-run of `CURRENT_GAP_ANALYSIS.md`.
- The Path, Skill Tree, and Hall of Firsts each pass the principle test: **one dominant element,
  visible progression state, and a clear "what unlocks next."**
- Zero visible `MediaSlot` placeholders on the production home page.
- A first-time visitor can answer, unprompted: *Where am I? Where am I going? What unlocks next?*
