-- Status enums (integrity: a typo can never reach the table)
create type lead_status    as enum ('new','contacted','converted','lost');
create type booking_status as enum ('pending','confirmed','attended','no_show');

-- leads (contact form)
create table leads (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  phone              text not null,
  age                int,
  fitness_goal       text,
  interested_program text,
  message            text,
  status             lead_status not null default 'new',
  admin_notes        text,
  source             text not null default 'contact_form',
  archived           boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index leads_status_idx     on leads (status);
create index leads_created_at_idx on leads (created_at desc);
create index leads_phone_idx      on leads (phone);

-- bookings (trial booking modal; a booking is a hot lead, so it links to leads)
create table bookings (
  id                uuid primary key default gen_random_uuid(),
  lead_id           uuid references leads(id) on delete set null,
  name              text not null,
  phone             text not null,
  age               int,
  preferred_program text,
  preferred_slot    text,
  fitness_goal      text,
  notes             text,
  admin_notes       text,
  status            booking_status not null default 'pending',
  source            text not null default 'trial_modal',
  archived          boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index bookings_status_idx     on bookings (status);
create index bookings_created_at_idx on bookings (created_at desc);
create index bookings_phone_idx      on bookings (phone);

-- updated_at trigger (applied to both tables)
create function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger leads_touch    before update on leads
  for each row execute function touch_updated_at();
create trigger bookings_touch before update on bookings
  for each row execute function touch_updated_at();
