// Build-time SSR entry. Vite builds this to dist/server/entry-server.js and
// scripts/prerender.mjs calls render() once per route to bake real HTML.
import { prerender } from "react-dom/static";
import { StaticRouter } from "react-router-dom";
import { AppShell } from "@/App";
import { SITE_URL } from "@/data/site";
import { BLOG_POSTS } from "@/data/blog";

export { SITE_URL };

const BUILD_DATE = new Date().toISOString().slice(0, 10);

// Every indexable URL, with the lastmod that goes into sitemap.xml.
export const ROUTES = [
  { path: "/", priority: "1.0" },
  { path: "/programs", priority: "0.9" },
  { path: "/pricing", priority: "0.9" },
  { path: "/coaches", priority: "0.8" },
  { path: "/transformations", priority: "0.8" },
  { path: "/gallery", priority: "0.6" },
  { path: "/contact", priority: "0.8" },
  { path: "/blog", priority: "0.7" },
  ...BLOG_POSTS.map((p) => ({
    path: `/blog/${p.slug}`,
    lastmod: p.updated_at || p.created_at,
    priority: "0.6",
  })),
].map((r) => ({ lastmod: BUILD_DATE, ...r }));

export async function render(url) {
  const errors = [];
  const { prelude } = await prerender(
    <StaticRouter location={url}>
      <AppShell />
    </StaticRouter>,
    { onError: (e) => errors.push(e) }
  );
  const html = await new Response(prelude).text();
  // React 19 hoists <title>/<meta>/<link> to the front of the stream; the app
  // tree starts at the .App wrapper. Split there: head tags before, body after.
  const i = html.indexOf('<div class="App');
  if (i < 0) throw new Error(`prerender(${url}): no .App wrapper in output`);
  return { head: html.slice(0, i), body: html.slice(i), errors };
}
