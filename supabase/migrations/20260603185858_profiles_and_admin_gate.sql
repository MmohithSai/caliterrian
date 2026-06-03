-- profiles: admin gate, 1:1 with auth.users
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  is_admin   boolean not null default false,
  created_at timestamptz default now()
);

-- auto-create a profile row when a user signs up
create function handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();

-- admin check helper (keeps every policy short + consistent)
create function is_admin() returns boolean language sql security definer stable set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_admin);
$$;
