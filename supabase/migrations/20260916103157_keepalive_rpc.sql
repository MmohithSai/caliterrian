-- keepalive(): a harmless real query for the scheduled pingers
-- (api/keepalive.js via Vercel Cron, .github/workflows/supabase-keepalive.yml)
-- so the free-tier project never sits idle 7 days and gets paused.
-- Returns only the server time — the one RPC anon may call.
create or replace function public.keepalive()
returns timestamptz
language sql
stable
set search_path = ''
as $$ select now() $$;

grant execute on function public.keepalive() to anon;
