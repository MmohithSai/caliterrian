-- ============ leads / bookings: admin-only, no anon access ============
-- Public has NO direct table access. Inserts happen ONLY via the
-- submit-lead / submit-booking Edge Functions (service-role, bypasses RLS).
alter table leads    enable row level security;
alter table bookings enable row level security;

create policy "admins read leads"      on leads    for select to authenticated using ( is_admin() );
create policy "admins update leads"     on leads    for update to authenticated using ( is_admin() ) with check ( is_admin() );
create policy "admins read bookings"    on bookings for select to authenticated using ( is_admin() );
create policy "admins update bookings"  on bookings for update to authenticated using ( is_admin() ) with check ( is_admin() );
-- No insert/delete policy for clients: "delete" = set archived=true (an UPDATE).
-- Hard purges happen only via SQL / service-role.

-- ============ profiles: is_admin must be server-only (CRITICAL) ============
alter table profiles enable row level security;

-- a signed-in user may read ONLY their own profile row
create policy "read own profile" on profiles
  for select to authenticated using ( id = auth.uid() );
-- NO insert/update/delete policy for clients:
-- is_admin can be set ONLY via SQL / service-role. No self-escalation possible.
