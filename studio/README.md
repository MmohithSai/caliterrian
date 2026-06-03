# Cali Terrian — Sanity Studio

Editorial content for the Cali Terrian site (pages, trainers, plans, programs,
testimonials, success stories, blog, FAQs, gallery, site settings).

This is a **separate workspace** from the main app. It has its own
`package.json` and `node_modules` (its React 18 does not affect the app's
React 19).

## One-time setup

1. **Create a Sanity project** (free):
   ```bash
   cd studio
   npm install
   npx sanity login        # opens browser
   npx sanity init --env   # creates the project + writes SANITY_STUDIO_PROJECT_ID into .env
   ```
   …or create it manually at https://www.sanity.io/manage and then:
   ```bash
   cp .env.example .env     # then paste your project id
   ```

2. **Set the project id** in `studio/.env`:
   ```
   SANITY_STUDIO_PROJECT_ID=your_project_id
   SANITY_STUDIO_DATASET=production
   ```

## Run

```bash
npm run dev     # http://localhost:3333
```

## Deploy

```bash
npm run deploy  # hosts at https://<your-project>.sanity.studio
```

## Structure

- `sanity.config.js` — Studio config (plugins, schema, singleton guards).
- `structure/` — custom desk: singletons shown once, orderable collection lists.
- `schemaTypes/`
  - `objects/` — reusable objects (`seo`, `socialLink`, `stat`, …).
  - `singletons/` — `siteSettings`, `homePage`, `aboutPage`, `scheduleSettings`.
  - `documents/` — `trainer`, `membershipPlan`, `program`, `testimonial`,
    `successStory`, `blogPost`, `faq`, `galleryImage`.

Field names mirror the existing hardcoded consts in `src/` so the frontend
cutover (Phase 3) is a near-1:1 swap.

## Next steps (per `../backend plan.md`)

- Phase 2 — seed: `scripts/seed-sanity.mjs` ports `mockData.js` + page consts.
- Phase 3 — frontend reads via `@sanity/client` + GROQ, Portable Text for blog.
