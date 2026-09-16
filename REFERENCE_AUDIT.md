# REFERENCE AUDIT — Caliterrain

> Per-image analysis of the 20 reference frames in `DesignReferences/`.
> Goal: extract the **layout architecture, storytelling structure, interaction pattern,
> and emotional goal** of each reference — not just its colours and type.
>
> The references are not a gym website. They are an **athlete progression ecosystem**:
> a path you enter, a tree you unlock, a feed of firsts you want to join, a facility you
> walk through. Every frame is built to make the visitor answer three questions:
> **Where am I? Where am I going? What unlocks next?**

---

## 0. The system the references share (read this first)

Before the per-frame notes, the recurring DNA across all 20 frames:

| Trait | What the references do |
|---|---|
| **Spine metaphor** | Everything hangs off ONE journey: *first pull-up → muscle-up → front lever*. Skills, programs, facility zones, and pricing are all framed as positions on that journey. |
| **One dominant element per section** | Each section has a single hero object — a connected path, a node graph, an achievement stream, a hotspot panorama — never 6 equal cards. |
| **Photography is the surface** | ~70% of every frame is full-bleed athlete/facility photography with a dark scrim. Text sits *on* imagery, not beside empty boxes. |
| **Progression states are visible** | Locked / available / in-progress / mastered are shown with icons, checks, locks, rings, % bars. The user can see status at a glance. |
| **Connectors, not grids** | Stages are joined by lines, arrows, and dependency edges. The eye is led along a route. |
| **Reassurance scaffolding** | Recurring "you don't have to be fit to start", "no pressure", "no commitment" micro-bars under bold claims — removes fear at every step. |
| **Design tokens** | Caliterrain Blue `#2E8DFF` accent + glow, near-black `#0B1016` base, Montserrat/condensed bold display in white with one blue accent line, generous uppercase eyebrows. (Confirmed by the style-guide frame.) |

---

## 1. `ChatGPT Image … 11_50_35 PM` — Home v1 + Style Guide
- **Layout:** Hero ("BUILD STRENGTH. MASTER MOVEMENT.") over facility photo → 4-stat bar → "TRAIN YOUR WAY" 4-card row → "THE CALITERRAIN SPACE" 3-up gallery w/ carousel arrows → trial CTA strip → footer. Right rail is a **design-system panel**.
- **Visual hierarchy:** 1) Hero headline on photo, 2) stat bar, 3) train-your-way cards.
- **Interaction:** Gallery carousel; standard scroll.
- **Emotional goal:** Confidence / arrival. "This is a serious, premium place."
- **Token source of truth:** Palette (`#2FA3D9` blue hover, `#0F1115` bg, `#2A2F3A` surface, `#3F2F4F7` neon white light, `#33F7032` turf green accent, `#7E26FF` accent glow), Montserrat Bold/Semibold/Regular, H1 64/72, H2 36/44, primary/secondary button styles, icon row, card style, progress/accent bar. **This frame defines the tokens — match them exactly.**
- **Memorable:** The explicit design system makes the visual language non-negotiable.

## 2. `0388f4eb` — Disciplines ("ONE FACILITY. EVERY DISCIPLINE.")
- **Layout:** Eyebrow → two-tone headline left, one-line intro → **10 discipline cards** (Calisthenics, Strength Training, Hybrid Athlete, HYROX Prep, Mobility, Flexibility, Gymnastics Strength, Freestyle, Functional Fitness…), each a photo card with icon + title + 1-line + "LEARN MORE".
- **Hierarchy:** Headline → the photo grid (every card is a real athlete mid-movement).
- **Interaction:** Hover lift / learn-more; cards link to program detail.
- **Emotional goal:** Possibility / breadth — "whatever your goal, there's a path here."
- **Memorable:** It is a *grid*, but it survives because **every tile is full-bleed photography**, not a flat panel. Density is the point (breadth), but imagery carries it.

## 3. `03dcbb43` — Home composite v2 ("THIS ISN'T A GYM. IT'S A PATH TO PHYSICAL CAPABILITY.")
- **Layout (top→bottom):** Hero on facility lane photo → 4-stat bar → **"4 PURPOSE-BUILT ZONES. 1 COMPLETE ATHLETE ECOSYSTEM"** (4 photo zones) → **THE CALITERRAIN PATH** (horizontal connected stages w/ ring nodes + joining line) → **SKILL TREE** (mini node graph) + **HALL OF FIRSTS** (member cards) side-by-side → **WHAT HAPPENS IN YOUR FIRST SESSION** (numbered steps) → stat trio (83/67/92) → "YOU'RE CLOSER TO A MUSCLE-UP THAN YOU THINK" CTA.
- **Hierarchy:** Hero claim → zones → the Path → the Skill Tree.
- **Interaction:** Path = roadmap; Skill Tree = unlock nodes; Hall of Firsts = social feed.
- **Emotional goal:** Orientation — "I can see the whole journey from here."
- **Memorable:** Skill Tree and Hall of Firsts **share a row** — progression + social proof framed as one idea.

## 4. `095ae6a0` — FAQ ("QUESTIONS ARE NORMAL. GETTING STARTED IS BETTER.")
- **Layout:** Two-tone headline → vertical **accordion** of fear-based questions ("Can complete beginners join?", "Am I too overweight?", "Can women join?", "How long until my first pull-up?") each with a leading icon → "Ready to get your answers in person?" CTA bar.
- **Hierarchy:** Headline → the question list.
- **Interaction:** Expand/collapse accordion.
- **Emotional goal:** Belonging / fear-removal. Every question is "am I allowed here?" answered with yes.
- **Memorable:** FAQ is reframed as **objection-handling for the anxious beginner**, not logistics.

## 5. `1362a015` — Hero ("TO SKILLS YOU NEVER THOUGHT POSSIBLE.")
- **Layout:** Eyebrow "FROM YOUR FIRST PULL-UP" → giant two-tone headline left, athlete-on-bar photo right → 2 CTAs ("BOOK TRIAL SESSION" / "EXPLORE THE PATH") → handwritten "Master Your Body. Own Your Journey." → **4-stat trust bar** (500+ / 20,000+ / 1000+ / 4.9★) → strip "THIS ISN'T JUST A GYM. IT'S A PATH." with 4 micro-proofs.
- **Hierarchy:** Headline → athlete photo → stat bar.
- **Interaction:** Static, immersive.
- **Emotional goal:** Aspiration + immersion. You are *entering* something.
- **Memorable:** Headline names a concrete skill destination ("first pull-up → skills you never thought possible"), not a slogan.

## 6. `22de9684` — The Path ("A STRUCTURED JOURNEY FROM BASICS TO MASTERY.")
- **Layout:** Centered headline + sub → **6 stages laid horizontally** (Assessment → Foundation → Strength → Skills → Performance → Mastery). Each stage = numbered ring node, **a connecting line runs through all six**, a title, a short blurb, **and a photo strip with 2–3 sample skills + "VIEW SKILLS →"** below → 4 pillars (Clear Progression / Expert Coaching / Measurable Results / Skills For Life).
- **Hierarchy:** The connecting line + ring nodes first, then per-stage detail.
- **Interaction:** Roadmap; each stage expands to skills.
- **Emotional goal:** Progress / clarity. "There is a route, and I can see every step."
- **Memorable:** **The joining line is the hero.** It reads as a metro map of becoming an athlete — NOT six separate cards.

## 7. `2b504acd` — Pricing ("SIMPLE PRICING. SERIOUS RESULTS.")
- **Layout:** Centered headline → **4 tiers** (Trial ₹499 → Monthly ₹2,999 *MOST POPULAR* → Quarterly ₹7,999 → Annual ₹27,999), each with feature checklist + CTA; "All Plans Include Assessment" callout → 4 support pillars → "Start your transformation today" footer line.
- **Hierarchy:** Headline → the highlighted Monthly tier (lifted + bordered blue).
- **Interaction:** Plan select.
- **Emotional goal:** Commitment made safe; the trial is the low-friction door.
- **Memorable:** Pricing is still framed as **"choose the plan that fits your journey"** — journey language even in commerce.

## 8. `2eba9916` — The Problem ("THE GYM EXISTS TO HELP YOU GET THERE.")
- **Layout:** Left = "02 / THE PROBLEM" eyebrow + giant quote **"I NEED TO GET FIT BEFORE I START."** + "So they wait. And nothing changes." Right = "REALITY" label + **progression strip**: 4 photo tiles **CAN'T DO PUSH-UP ❌ → PUSH-UP ✓ → PULL-UP ✓ → MUSCLE-UP ✓** with a `VS` pivot between myth and reality → reassurance bar "You don't have to be great to start. You just have to start."
- **Hierarchy:** The myth quote vs the ✓-progression tiles.
- **Interaction:** Static; the ❌→✓ states do the work.
- **Emotional goal:** Fear removal → self-recognition. "That's me — and that's fine."
- **Memorable:** The **locked→unlocked progression of one skill** visualised as a filmstrip. Gamified states inside an objection.

## 9. `2fd25b69` — First Session ("WHAT HAPPENS IN YOUR FIRST SESSION?")
- **Layout:** Headline + "No pressure. No judgment." → **5 steps as photo cards** (01 Meet Your Coach → 02 Movement Assessment → 03 Skill Evaluation → 04 Receive Personal Roadmap → 05 Start Training), **each numbered, joined by → arrows, each over a real coaching photo**, with a 1-line "WHAT TO EXPECT" caption → 3 reassurance chips (No Commitment Pressure / 60 Minutes / All-Levels Welcome) → CTA.
- **Hierarchy:** The numbered arrow-linked photo sequence.
- **Interaction:** Sequential read; arrows imply flow.
- **Emotional goal:** Safety + clarity for the very first step.
- **Memorable:** **Photos behind every step** + connecting arrows make it a *walkthrough*, not a list of icons.

## 10. `3c23f30d` — Facility composite ("BUILT FOR EVERY STAGE OF YOUR JOURNEY" / "WHY THIS FACILITY IS DIFFERENT")
- **Layout:** Hero over the green-lane facility panorama → 4 zone labels (Strength Lab / Performance Lane / Skill Arena / Mobility Zone) → dark band **"WHY THIS FACILITY IS DIFFERENT"** → **4 colour-coded zone cards**: RECOVER (green) / BUILD (blue) / PERFORM (orange) / MASTER (purple) — each with icon, photo, bulleted equipment, "EXPLORE ZONE →" → 4 summary pills.
- **Hierarchy:** Panorama → the 4 coloured journey-stage zones.
- **Interaction:** Explore-zone drilldown.
- **Emotional goal:** "The building itself is a progression system."
- **Memorable:** Zones are **mapped to journey stages** (recover→build→perform→master) and **colour-coded** — the facility mirrors the Path.

## 11. `453c6f65` — Why Stay / Results ("REAL RESULTS. REAL PEOPLE." + "I THOUGHT I COULDN'T.")
- **Layout:** Left intro + 3 big **circular-ring stats** (83% First Pull-Up / 67% New Skill <6mo / 92% Would Recommend) → "MEMBER STORIES — I THOUGHT I COULDN'T." → **3 video testimonial cards** (play button over athlete photo + name + quote + skill achieved) → 4 trust pills.
- **Hierarchy:** The 3 ring-stats → the 3 video stories.
- **Interaction:** Play video; ring stats animate.
- **Emotional goal:** Self-identification — "people like me did it; the data says I will too."
- **Memorable:** **Animated ring stats** + **"I thought I couldn't"** framing — outcome data married to emotional video proof.

## 12. `47b90ff8` — ★ MASTER Home composite ("FROM YOUR FIRST PULL-UP TO SKILLS YOU NEVER THOUGHT POSSIBLE.")
> **This is the definitive page flow. When in doubt, this frame wins.**
- **Order:** Hero+stats → **The Problem** (myth vs ❌→✓ progression) → **The Caliterrain Path** (6 ring nodes on one connecting line) → **Skill Tree** (RPG node graph w/ branches + a detail panel for MUSCLE-UP showing prerequisites/progress) → **Hall of Firsts** (member achievement cards) → **First Session** (numbered steps) → **"WE TRAIN FOR EVERYTHING THAT MAKES YOU CAPABLE"** (disciplines) → 5 proof pillars → **"YOU'RE CLOSER TO A MUSCLE-UP THAN YOU THINK"** CTA.
- **Hierarchy:** Hero → Path → **Skill Tree (the centrepiece)**.
- **Interaction:** Skill Tree node graph w/ live detail panel is the signature interaction of the whole site.
- **Emotional goal:** Mastery is mappable. Curiosity → desire to explore the tree.
- **Memorable:** **The Skill Tree as a dependency graph with a detail rail** — this is the single feature that turns "gym site" into "progression ecosystem."

## 13. `48c6c57b` — Coaches ("GUIDING YOU. CHANGING LIVES.")
- **Layout:** Headline + "Our coaches don't just teach reps. They build people." → **4 coach cards**, each = full portrait photo + name + specialty tags + **stat list** (200+ Pull-Ups Coached / 50+ Muscle-Ups Coached / HYROX Athlete) + **a member success quote with the member's tiny avatar** → "More than coaches" CTA.
- **Hierarchy:** The 4 portraits → coach outcome stats → member quotes.
- **Interaction:** Meet-the-team drilldown.
- **Emotional goal:** Trust through *outcomes delivered*, not credentials listed.
- **Memorable:** Each coach card carries a **member's success quote** — proof nested inside the coach.

## 14. `5c4c225e` — Skill Journey ("EVERY MOVEMENT HAS A JOURNEY.")
- **Layout:** Centered headline + 3 mode chips (Structured Progression / Expert Coaching / Track & Achieve) → **horizontal 7-stage timeline** over photos: 01 Push-Up → 02 Pull-Up → 03 Dip → 04 L-Sit → 05 Handstand → 06 Muscle-Up → 07 Front Lever, **grouped under band labels FOUNDATION · BUILD STRENGTH · CONTROL · SKILL DEVELOPMENT · MASTERY**, with a progress line + node dots along the top → "Your journey. Your pace." CTA.
- **Hierarchy:** The timeline line + grouped stage bands.
- **Interaction:** Timeline scrub / node hover.
- **Emotional goal:** "Mastery is a finite, ordered set of named skills I can tick off."
- **Memorable:** **Named skills grouped into mastery tiers** along one timeline — the cleanest expression of the progression spine.

## 15. `81615a6c` — Facility grid ("EXPLORE THE SPACE. EXPERIENCE THE DIFFERENCE.")
- **Layout:** Eyebrow + headline + photo inset → 4 trait chips → **"EXPLORE OUR SPACES"** + "Click a space to explore" → **10-zone photo grid** (Strength Lab, Skill Arena, Performance Lane, Mobility Zone, Endurance Zone, Open Movement Space, Parallel Bars Area, Skierg Zone, Recovery Corner, Turf Zone) each w/ icon + name + 1-line + "Explore →".
- **Hierarchy:** Headline → the 10 photo zones.
- **Interaction:** Click-to-explore each zone.
- **Emotional goal:** Exploration / abundance — "there's a dedicated space for everything."
- **Memorable:** Every zone is **named and photographed** — the building is inventoried like a game map.

## 16. `d44d3bfb` — Facility panorama ("DESIGNED FOR EVERY STAGE.")
- **Layout:** Headline over the **wide facility panorama** with **`+` hotspot pins** scattered across the real space (Strength Lab, Pull-Up Rigs, Skiergs, Mobility Zone, Parallel Bars, Open Movement Space, Performance Lane). Top-right shows the **hovered hotspot's detail card** (photo + name + blurb + "Learn more"). Below: a **thumbnail rail** of all zones acting as a selector.
- **Hierarchy:** The panorama + glowing hotspots → the detail card.
- **Interaction:** **Hover/click hotspots on a real photo** → detail card updates; thumbnail rail navigates.
- **Emotional goal:** Immersion — "I'm standing in the room, looking around."
- **Memorable:** **Interactive hotspots on a true panorama** — the most immersive interaction in the set.

## 17. `f18b9d92` — Hall of Firsts ("REAL PEOPLE. REAL MILESTONES.")
- **Layout:** Headline + "Every first is held. Every breakthrough." + a small **"YOUR milestone starts here"** ghost card → **horizontal stream of member achievement cards**: each = athlete photo + **milestone badge** (FIRST PULL-UP / FIRST HANDSTAND / 10 DIPS / FIRST MUSCLE-UP / FIRST L-SIT / FRONT LEVER) + name + date + **a small "cheers/reactions" count** → "Your story could be next" CTA.
- **Hierarchy:** The achievement stream — many faces, each tagged with a named first.
- **Interaction:** Horizontal scroll/marquee; reaction counts imply a *live feed*.
- **Emotional goal:** Belonging + FOMO — "I want my card in this stream."
- **Memorable:** **An achievement *feed*, not a testimonial grid** — dated, reacted-to, alive, community-owned.

## 18. `fe7e0d0b` — ★ SKILL TREE ("SEE THE JOURNEY. CHASE THE SKILLS.")
> **The single most important interaction reference in the entire set.**
- **Layout:** Headline left → **center: an RPG dependency graph** of skills (Push-Up → Pull-Up → L-Sit → Handstand → Muscle-Up → Back Lever → Front Lever) with **edges showing prerequisites**, node states colour/icon-coded **Mastered ✓ / In Progress ◐ / Available ● / Locked 🔒**, a small legend → **right: a detail rail for the selected node (MUSCLE-UP)** = demo video, **Requirements** (10 pull-ups, explosive pulling strength, straight-bar support dip), **Average Time (4–8 months)**, **Difficulty (Advanced)**, **Coach Insight** w/ avatar, **Related Skills** chips, **"START WORKING ON THIS SKILL →"** → bottom-left **"YOUR PROGRESS 37%"** widget (14 mastered / in-progress / locked counts) + **"NOT SURE WHERE TO START? TAKE ASSESSMENT"**.
- **Hierarchy:** The node graph → the detail rail → the personal progress widget.
- **Interaction:** **Click a node → graph highlights its prerequisite path + detail rail loads.** Locked nodes signal "unlock me." Progress % is personal.
- **Emotional goal:** Curiosity, mastery, exploration, desire to advance. Pure RPG.
- **Memorable:** **Dependencies + states + personal progress %.** This is Duolingo's skill tree applied to calisthenics. Nothing else in the set carries the "ecosystem" feeling this hard.

## 19. `feca48a8` — Home composite v4 ("MOVE BETTER. GET STRONGER. MASTER YOUR BODY.")
- **Layout:** Hero on rig photo → stat bar → "More than a gym. It's a movement." + 4 value props → **"Every Master Was Once A Beginner"** 7-skill timeline (Push-Up→Front Lever) → **"Find the right path for your goals"** (program cards) → **"Built for movement. Designed for performance."** facility band → 3-column (Learn From The Best / Real People Real Progress / More Than Members) → testimonial quotes → **"Ready to become the strongest version of yourself?"** CTA.
- **Hierarchy:** Hero → the skill timeline → program paths.
- **Interaction:** Standard + timeline.
- **Emotional goal:** Transformation as identity ("strongest version of yourself").
- **Memorable:** Confirms the skill-timeline + "paths not products" framing as load-bearing across multiple home variants.

## 20. (`f527f63b` referenced but file missing on disk — excluded.)

---

## Reference → Section map (what each home section MUST become)

| # | Section | Primary reference(s) | Required hero element |
|---|---|---|---|
| 1 | Hero | 5, 12 | Full-bleed facility video/photo + skill-destination headline + 4-stat bar |
| 2 | The Problem | 8, 12 | Myth quote `VS` ❌→✓ skill filmstrip |
| 3 | The Path | 6, 14 | **Connected horizontal journey** — ring nodes on one line, grouped tiers |
| 4 | **Skill Tree** | **18, 12** | **RPG dependency graph + detail rail + progress %** |
| 5 | Hall of Firsts | 17 | **Live achievement feed** — photos, milestone badges, reactions, dates |
| 6 | Member Journeys / Results | 11 | Ring stats (83/67/92) + "I thought I couldn't" video stories |
| 7 | First Session | 9 | Numbered **photo** steps joined by arrows + reassurance chips |
| 8 | Disciplines | 2, 12 | Full-bleed athlete photo grid ("everything that makes you capable") |
| 9 | Coaches | 13 | Portrait cards + outcome stats + nested member quote |
| 10 | Facility | 16, 15, 3 | **Hotspot panorama** + named zone grid (colour-coded to journey) |
| 11 | Community | 17-adjacent | Event/feed imagery, not flat icon cards |
| 12 | Why Stay | 11 | Ring stats + reasons |
| 13 | Testimonials | 11 | Video story cards on athlete photos |
| 14 | Memberships | 7 | 4 tiers, Monthly highlighted, journey framing |
| 15 | FAQ | 4 | Fear-based accordion with leading icons |
| 16 | Visit | — | Map + hours decision strip (acceptable as-is) |
| 17 | Final CTA | 12 | "You're closer to a muscle-up than you think" |

---

## The one-line verdict
The references are a **game board**: a path, a tree, a feed of firsts, a map of the room.
The job is to rebuild the three load-bearing interactions — **The Path (connected journey),
the Skill Tree (dependency graph + progress), and the Hall of Firsts (live feed)** — and to
**fill every photography slot**, because empty placeholders are what make the build read as a
brochure instead of an ecosystem.
