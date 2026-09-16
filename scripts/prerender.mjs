// Build-time prerenderer. Runs after `vite build` + the SSR build and bakes a
// real HTML file for every public route, so crawlers and link scrapers get the
// right title / meta / JSON-LD / body copy without executing any JS. The same
// markup is what the browser hydrates (src/main.jsx).
//
// Also emits dist/sitemap.xml, dist/404.html and dist/200.html (the empty SPA
// shell /admin/* rewrites to).
process.env.NODE_ENV ??= "production";

import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const DIST = "dist";
const SEO_RE = /<!--seo-->[\s\S]*?<!--\/seo-->/;
const ROOT_RE = /<div id="root"><\/div>/;
const LD_RE = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;

const { ROUTES, SITE_URL, render } = await import(
  pathToFileURL(join(process.cwd(), DIST, "server/entry-server.js")).href
);

// Read the template before anything writes over dist/index.html.
const template = readFileSync(join(DIST, "index.html"), "utf8");
if (!SEO_RE.test(template)) throw new Error("index.html: <!--seo--> markers missing");
if (!ROOT_RE.test(template)) throw new Error('index.html: <div id="root"></div> missing or not empty');

// Clean SPA shell for /admin/* — no prerendered content, just the marker
// comments removed so the fallback meta stays.
writeFileSync(join(DIST, "200.html"), template.replace("<!--seo-->", "").replace("<!--/seo-->", ""));

const outFile = (path) => (path === "/" ? "index.html" : `${path.slice(1)}/index.html`);

const pages = [...ROUTES.map((r) => ({ ...r, file: outFile(r.path) })), { path: "/404", file: "404.html" }];

for (const page of pages) {
  const { head, body, errors } = await render(page.path);
  if (errors.length) {
    for (const e of errors) console.error(e);
    throw new Error(`prerender ${page.path}: ${errors.length} render error(s)`);
  }

  // Fail the build on schema that would silently break rich results.
  let found = 0;
  for (const [, json] of `${head}${body}`.matchAll(LD_RE)) {
    JSON.parse(json); // throws with the route in the stack below
    found++;
  }

  // Function replacers: the rendered markup can legitimately contain `$&`.
  const html = template
    .replace(SEO_RE, () => head)
    .replace(ROOT_RE, () => `<div id="root">${body}</div>`);

  const dest = join(DIST, page.file);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, html);
  console.log(`prerendered ${page.path.padEnd(46)} → ${page.file}  (${(html.length / 1024).toFixed(0)} KB, ${found} ld+json)`);
}

const urls = ROUTES.map(
  (r) => `  <url>
    <loc>${SITE_URL}${r.path === "/" ? "/" : r.path}</loc>
    <lastmod>${r.lastmod}</lastmod>
    <priority>${r.priority}</priority>
  </url>`
).join("\n");
writeFileSync(
  join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);
console.log(`sitemap.xml  ${ROUTES.length} urls`);

rmSync(join(DIST, "server"), { recursive: true, force: true });

// supabase-js leaves a token-refresh interval running in Node.
process.exit(0);
