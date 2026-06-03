-- Pin search_path on the trigger function (advisor 0011)
alter function touch_updated_at() set search_path = '';

-- Trigger functions must never be callable as RPCs; triggers run them regardless of grants.
revoke all on function touch_updated_at() from public, anon, authenticated;
revoke all on function handle_new_user() from public, anon, authenticated;

-- is_admin(): needed by RLS policies (authenticated role) but never by anon.
revoke all on function is_admin() from public, anon;
grant execute on function is_admin() to authenticated;

-- get_admin_stats(): only signed-in admins (function self-checks is_admin()).
revoke all on function get_admin_stats() from public, anon;
grant execute on function get_admin_stats() to authenticated;
