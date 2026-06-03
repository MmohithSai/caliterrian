-- One round-trip for all dashboard KPIs. security definer + explicit admin check
-- so a non-admin calling it gets nothing (defense in depth alongside RLS).
create function get_admin_stats()
returns json language plpgsql security definer stable set search_path = '' as $$
declare
  result json;
  week_start timestamptz := date_trunc('week', now());
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select json_build_object(
    'totalLeads',          (select count(*) from public.leads    where archived = false),
    'totalBookings',       (select count(*) from public.bookings where archived = false),
    'newLeadsThisWeek',    (select count(*) from public.leads    where archived = false and created_at >= week_start),
    'newBookingsThisWeek', (select count(*) from public.bookings where archived = false and created_at >= week_start),
    'uncontactedLeads',    (select count(*) from public.leads    where archived = false and status = 'new'),
    'pendingBookings',     (select count(*) from public.bookings where archived = false and status = 'pending')
  ) into result;

  return result;
end $$;

grant execute on function get_admin_stats() to authenticated;
