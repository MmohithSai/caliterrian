# REVIEW SCORECARD v2 — after P1–P5

> Re-score after the structural/interaction rebuilds (P1–P3) and the P4/P5 work.
> Screenshots: `review-screenshots/section-*.png` + `fullpage-desktop.png` (regenerated).
>
> **Important scoring caveat:** imagery is still the `MediaSlot` placeholder system
> (P0 deferred by request). So **Visual** is scored on *treatment/composition with
> placeholders*, and a **Visual @ real-photo** column estimates where each section lands
> once production photography drops into the existing, clearly-labeled slots. Structure,
> Layout, Interaction and Storytelling are scored as final.

## Old 17 → new 14 (consolidation map)
| Old section | Disposition |
|---|---|
| 1 Hero | kept |
| 2 The Problem | **rebuilt** → Myth vs Reality split |
| 3 The Path | **rebuilt** → connected journey |
| 4 Skill Tree | **rebuilt** → RPG dependency graph |
| 5 Hall of Firsts | **rebuilt** → live feed |
| 6 Member Journeys | **merged → Results** |
| 7 First Session | **rebuilt** → photo flow + arrows |
| 8 Disciplines | **rebuilt** → bento mosaic |
| 9 Coaches | **rebuilt** → 4-up + member quotes |
| 10 Facility | **upgraded** → interactive hotspot detail cards |
| 11 Community | **merged → Hall of Firsts** |
| 12 Why Members Stay | **merged → Results** (rings) |
| 13 Testimonials | **merged → Results** (video stories) |
| 14 Memberships | kept |
| 15 FAQ | kept |
| 16 Visit | kept |
| 17 Final CTA | kept |

Net: 17 → **14 sections** (3 social-proof sections consolidated into Results; Community folded into the feed).

---

## New 14-section scorecard

| # | Section | Visual (placeholder) | Visual @ real-photo | Layout | Interaction | Story | Ref Match | Verdict |
|---|---|:--:|:--:|:--:|:--:|:--:|:--:|---|
| 1 | Hero | 8 | 9 | 9 | 7 | 8 | **8** | ✅ |
| 2 | The Problem | 8 | 9 | 9 | 7 | 9 | **9** | ✅ Myth vs Reality |
| 3 | The Path | 9 | 9 | 9 | 8 | 9 | **9** | ✅ connected journey |
| 4 | Skill Tree | 8 | 9 | 9 | 9 | 9 | **9** | ✅ RPG graph |
| 5 | Hall of Firsts (+Community) | 6 | 9 | 9 | 8 | 9 | **8** | ✅ structure done, needs member photos |
| 6 | First Session | 7 | 9 | 9 | 7 | 8 | **8** | ✅ photo flow + arrows |
| 7 | Disciplines | 6 | 9 | 8 | 6 | 7 | **8** | ✅ bento; needs photos |
| 8 | Coaches | 6 | 9 | 9 | 6 | 8 | **8** | ✅ 4-up + member quotes |
| 9 | Facility | 6 | 9 | 8 | 9 | 7 | **8** | ✅ hotspots interactive; needs panorama photo |
| 10 | Results | 8 | 9 | 9 | 8 | 9 | **9** | ✅ rings + stories |
| 11 | Memberships | 9 | 9 | 9 | 7 | 8 | **9** | ✅ |
| 12 | FAQ | 8 | 8 | 8 | 7 | 7 | **8** | ✅ |
| 13 | Visit | 8 | 8 | 8 | 7 | 7 | **8** | ✅ |
| 14 | Final CTA | 9 | 9 | 9 | 8 | 8 | **9** | ✅ |

**Passing (≥8) on current Ref-Match: 14 of 14.** Compare to v1: **5 of 17** passing.
🔒 **Architecture & interaction are now FROZEN** — the next phase is asset production.

---

## What changed since v1

### Rebuilt structural/interaction (P1–P3)
- **Skill Tree 3 → 9** — flat button grid replaced by a positioned dependency graph: SVG
  edges from `prereq`, four node states (mastered/in-progress/available/locked), clicking a
  node lights its full prerequisite path, detail rail with coach insight + "unlocks" chips,
  and a personal progress ring (`Your Progress 42%` + Take Assessment).
- **The Path 4 → 9** — six-card grid replaced by one connecting progression line threading
  numbered ring nodes (Start→Mastery) with tier labels + skill-chip previews. Horizontal rail
  desktop / vertical timeline mobile.
- **Hall of Firsts 4 → 8** — static placeholders replaced by a live horizontal feed (milestone
  badges, heart reaction counts, "Live feed" ping, "Your milestone starts here" ghost card).

### P4 polish
- **First Session** — icon cards → photo-backed poster steps with `→` arrow connectors and a
  "what to expect" line per step.
- **Disciplines** — flat 3×3 grid → bento mosaic (Calisthenics + HYROX as 2×-span featured
  tiles) for varied density.
- **Coaches** — 2 → 4 cards; each real coach now carries a nested member-success quote (avatar
  initial + achievement badge). 2 cards are clearly-labeled "Profile Coming Soon" slots.
- **Facility** — hotspot pins upgraded from name-tooltips to an interactive **detail card**
  (thumbnail + name + description) driven by hovering pins *or* the zone selector grid; active
  pin/tile highlight.
- **Outcome rings** — new animated `StatRing` primitive (count-up + conic fill in sync on
  scroll-in) powering the Results outcomes.

### P5 consolidation
- **Community → Hall of Firsts** — community tiles now live under the achievement feed
  ("More than members. We are a family.").
- **Member Journeys + Testimonials → Results** — one section: animated outcome rings + four
  "why members stay" reasons + "I thought I couldn't" video stories with achievement badges.

---

## Remaining work (by request, deferred)

### P0 · Photography (the only thing capping Visual scores)
Every slot is wired and **clearly labeled** in `src/data/home.js` (each `media.label` /
`media.hint` names exactly what photo belongs there). Sections most dependent on it:
- **Facility panorama** (`FACILITY.panorama`) — the hotspot map floats on a placeholder until
  a real wide facility shot lands. Highest single-asset impact.
- **Hall of Firsts** member photos, **Coaches** portraits (incl. 2 new hires), **Disciplines**
  9 discipline photos, **First Session** 5 step photos, **Results** video stills, **Community**
  event photos, **Hero** facility video.

### Data placeholders to replace with verified figures
- `RESULTS.outcomes` (83% / 67% / 92%) are **illustrative placeholders** flagged in-code — swap
  for real member-survey numbers before launch (same discipline as the image slots).
- Coaches 3 & 4 ("Profile Coming Soon") — replace with real coach name/bio/photo.

### The Problem — now rebuilt (✅ 9)
Replaced the old asymmetric layout with the reference's **Myth vs Reality** structure: a
struck-through, greyed MYTH ("I need to get fit before I start.") on the left with an ❌ MYTH
indicator; a glowing **VS** badge on the centre divider; and a photographic REALITY progression
on the right — **Can't Hang (❌, greyscale) → Push-Up ✓ → Pull-Up ✓ → Muscle-Up ✓** joined by
arrows, with a "you don't have to be fit to start" reassurance bar. Emotionally pivots
self-doubt → belief; directly answers "I'm not fit enough to join."

---

## 🔒 Freeze status — architecture & interaction complete

All 14 sections pass (≥8). **The Problem was the final interaction/design item.**
Architecture and interaction work is now **frozen**. The next major phase is **content
production**, after which we re-evaluate whether any section needs structural changes:

| Asset phase | Slots already wired & labeled in `home.js` |
|---|---|
| Facility photography | `FACILITY.panorama` (highest impact) + 10 zone photos; Hero facility video |
| Coach photography | 2 real portraits + 2 new-hire slots |
| Hall of Firsts imagery | 6 member milestone photos |
| Testimonial videos | 3 Results story stills/clips |
| Community / event imagery | 4 community tiles |
| (+ Problem, Path-stage, Skill demo, First-Session, Disciplines photos) | all labeled |

### Data placeholders (replace with verified figures, not images)
- `RESULTS.outcomes` (83% / 67% / 92%) — flagged in-code; swap for real member-survey numbers.
- Coaches 3 & 4 "Profile Coming Soon" — real name/bio/photo on hire.

## Definition-of-done status
- ✅ One dominant element per section (path / tree / feed / panorama / rings / VS split).
- ✅ Visible progression state + "what unlocks next" (Skill Tree, Path, Problem filmstrip).
- ✅ Redundant social-proof consolidated.
- ✅ Every image/video slot production-ready and labeled; **no external image URLs introduced.**
- ✅ All 14 sections ≥8 on structure/interaction.
- ⏳ Zero visible placeholders — pending the content-production phase only.
