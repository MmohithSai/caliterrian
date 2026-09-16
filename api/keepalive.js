// Vercel Cron (vercel.json) hits this daily so the free-tier Supabase project
// never sits idle 7 days and gets paused. keepalive() is a real Postgres query
// (supabase/migrations/*_keepalive_rpc.sql).
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/keepalive`, {
    method: "POST",
    headers: { apikey: process.env.VITE_SUPABASE_ANON_KEY, "Content-Type": "application/json" },
  });
  return new Response(await res.text(), { status: res.ok ? 200 : 502 });
}
