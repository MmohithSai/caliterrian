# Cali Terrain — Backend & Admin Dashboard Plan

> Goal: replace the hardcoded "Phase 1" mock data with a real backend so the gym owner can edit site content (and read leads) without touching code.
> Stack: **Sanity** (editorial CMS for marketing content) + **Supabase** (Postgres, auth, dynamic/transactional data).

---

## 1. Current State (what we're replacing)

The frontend is a React 19 + Vite + Tailwind 4 SPA. **All content is hardcoded**, flagged in code as "Phase 1 — no API":

| Content | Where it lives today | Target system |
|---|---|---|
| Home: programs, why-us, journey, stats | `src/pages/Home.jsx` consts | **Sanity** (singleton) |
| Home FAQ | `src/pages/Home.jsx` `FAQ` | **Sanity** (faq docs) |
| About page | *does not exist yet* | **Sanity** (singleton) |
| Trainer profiles | `src/pages/Coaches.jsx` `COACHES` | **Sanity** (trainer docs) |
| Membership plans + timings | `src/pages/Pricing.jsx` `G3/G5/P3/P5/GM/GE/PM/PE` | **Sanity** (plan docs + settings) |
| Programs | `src/pages/Programs.jsx` `PROGRAMS` | **Sanity** (program docs) |
| Testimonials | `src/data/mockData.js` `TESTIMONIALS` | **Sanity** (testimonial docs) |
| Success stories / transformations | `src/data/mockData.js` `TRANSFORMATIONS` | **Sanity** (story docs) |
| Blog posts | `src/data/mockData.js` `BLOG_POSTS` | **Sanity** (post docs, Portable Text) |
| Gallery | `src/data/mockData.js` `GALLERY` | **Sanity** (image docs) |
| Contact form submit | `src/pages/Contact.jsx` (fake `setTimeout`) | **Supabase** (leads table) |
| Trial booking modal | `src/components/TrialBookingModal.jsx` (WhatsApp redirect) | **Supabase** (bookings table) |
| Site contact info / phone / address | scattered (`ChatBot.jsx`, `Footer.jsx`, `Contact.jsx`) | **Sanity** (siteSettings singleton) |

---

## 2. Architecture Decision — Why Both Sanity *and* Supabase

Split by **who owns the data and how it behaves**:

- **Sanity = read-mostly editorial content.** Rich text, images, ordering, drafts/preview. The owner edits it in **Sanity Studio** (which *is* the content admin dashboard). Served to the public site via the global CDN; no auth on reads.
- **Supabase = dynamic + private data.** Form submissions (leads), trial bookings, admin authentication, and any future member/payment data. Postgres + Row Level Security + Edge Functions.

```
                ┌─────────────────────────┐
                │     React SPA (Vite)     │
                │  public website (CDN)    │
                └───────┬─────────┬────────┘
            read content│         │write leads/bookings
                        ▼         ▼
        ┌───────────────────┐  ┌──────────────────────┐
        │   Sanity Content  │  │  Supabase (Postgres) │
        │   Lake + CDN      │  │  + Auth + Edge Fns   │
        │                   │  │                      │
        │  Sanity Studio ◄──┼──┤  Admin dashboard ◄───┼── owner/admin
        │  (content admin)  │  │  (leads/bookings)    │
        └───────────────────┘  └──────────────────────┘
```

**Two admin surfaces (both owner-facing; the client never touches Supabase or code):**
1. **Sanity Studio** — edit all page/marketing content. Hosted free at `*.sanity.studio` or under `/studio` on our domain.
2. **Custom `/admin` dashboard** — a protected React route in this app for operational data (leads, bookings) with Supabase Auth login. **This is a required deliverable;** the Supabase Table Editor is explicitly *not* a client-facing solution. See §6.2.

> **⚠ SEO/rendering decision (make it deliberately).** The app is a client-rendered SPA. Moving marketing copy out of the bundle and behind a client-side GROQ fetch means crawlers and LCP wait on JS → fetch → render — a real risk for a *local gym* that needs organic/blog discovery. **v1 recommendation:** keep the SPA but **prerender the public marketing routes at build time** (Vite prerender/snapshot) and set per-page meta via `react-helmet-async` (already a dependency); the `/admin` area stays a normal client SPA. If blog SEO becomes a priority, migrate marketing pages to **Next.js SSG/ISR** as a tracked future phase. Don't let "no SSR" happen by accident.

---

## 3. Tech Stack Additions

```
# Sanity
@sanity/client          # query content from React
@sanity/image-url        # build image URLs
groq                     # query language
sanity (CLI/Studio)      # the Studio app (separate workspace/folder)
@portabletext/react      # render blog rich text

# Supabase
@supabase/supabase-js    # client for leads/bookings/auth
```

Environment variables (add to `.env`, already git-ignored):
```
VITE_SANITY_PROJECT_ID=xxxx
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2024-01-01
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
# server-only (Edge Functions / scripts — NEVER prefix with VITE_):
SANITY_WRITE_TOKEN=...      # for seed/migration scripts only
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 4. Sanity — Content Modeling

Create a Studio workspace (e.g. `studio/` folder or separate repo). Schema types below mirror the **exact fields already used in the code** so frontend changes are minimal.

### 4.1 Singletons (one document each)

**`siteSettings`** — global contact/brand info (de-duplicates phone/address scattered across components)
- `gymName` (string), `tagline` (string)
- `phone` (string), `whatsapp` (string), `email` (string)
- `address` (text), `googleMapsUrl` (url), `googleRating` (number)
- `socialLinks` (array of {platform, url})
- `logo` (image)

**`homePage`** — singleton
- `heroHeadline` (string), `heroSubtext` (text), `heroImages` (array of image)
- `stats` (array of {value, label}) — maps to `STATS`
- `whyUs` (array of {title, description, icon}) — maps to `WHY_US`
- `journeySteps` (array of {step, title, description}) — maps to `JOURNEY_STEPS`
- `featuredPrograms` (array of references → `program`)
- `seo` (object: title, description, ogImage)

**`aboutPage`** — singleton (NEW page, doesn't exist yet)
- `headline` (string), `story` (Portable Text / rich text)
- `mission` (text), `vision` (text), `values` (array of {title, description})
- `facilityImages` (array of image), `foundedYear` (number)
- `seo` (object)

**`scheduleSettings`** — batch timings (maps to `GM/GE/PM/PE`)
- `groupMorning` (array of string), `groupEvening` (array of string)
- `personalMorning` (array of string), `personalEvening` (array of string)

### 4.2 Document collections (many)

**`trainer`** (maps to `COACHES`)
- `name`, `role`, `bio` (text), `philosophy` (text)
- `specialties` (array of string), `certifications` (array of string)
- `experience` (string), `membersTrained` (string)
- `image` (image), `order` (number, for sorting)

**`membershipPlan`** (maps to `G3/G5/P3/P5`)
- `name` (e.g. "Group 3-Day"), `category` (string: group | personal)
- `subtitle`, `highlight` (boolean)
- `tiers` (array of {duration, price, currency: default ₹})
- `features` (array of string), `order` (number)

**`program`** (maps to `Programs.jsx PROGRAMS`)
- `title`, `slug`, `emoji`/`icon`, `description` (text)
- `benefits` (array of string), `level`, `ageGroup`, `outcome`
- `image` (image), `order`

**`testimonial`** (maps to `TESTIMONIALS`)
- `name`, `role` (e.g. "Member - 1 Year"), `content` (text)
- `rating` (number 1–5), `featured` (boolean), `order`

**`successStory`** (maps to `TRANSFORMATIONS`)
- `memberName`, `achievementType` (string), `summary`
- `testimonial` (text), `date` (string or date)
- `beforeImage` / `afterImage` (image, optional), `featured` (boolean)

**`blogPost`** (maps to `BLOG_POSTS`)
- `title`, `slug` (slug, source: title)
- `category` (string), `excerpt` (text)
- `coverImage` (image), `publishedAt` (datetime)
- `body` (Portable Text — replaces the markdown string `content`)
- `seo` (object)

**`faq`** (maps to `Home.jsx FAQ`)
- `question`, `answer` (text)
- `category` (string, optional — to group on different pages)
- `order` (number)

**`galleryImage`** (maps to `GALLERY`)
- `image` (image), `caption`, `category` (string), `order`

### 4.3 Studio config
- Configure singleton documents (`siteSettings`, `homePage`, `aboutPage`, `scheduleSettings`) with a custom desk structure so the owner sees them once, not as a "create new" list.
- Add **orderable lists** (`@sanity/orderable-document-list`) for trainers, plans, programs, testimonials, FAQs, gallery.
- Add field validation (required fields, rating 1–5, slug uniqueness).
- Enable **draft + preview** so the owner can preview before publishing.

---

## 5. Supabase — Schema, Auth & Functions

### 5.1 Tables

> **Review-hardened schema.** Status is a proper enum (no typos can break filters), every table has `updated_at`, `admin_notes`, and a soft-delete `archived` flag, and `bookings` links back to `leads`. Indexes back the search/filter/sort queries. `newsletter_subscribers` is dropped until a newsletter actually exists.

**Status enums** (integrity — a typo like `'contaced'` can never reach the table)
```sql
create type lead_status    as enum ('new','contacted','converted','lost');
create type booking_status as enum ('pending','confirmed','attended','no_show');
```

**`leads`** (contact form — maps to `Contact.jsx` form state)
```sql
create table leads (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  phone        text not null,
  age          int,
  fitness_goal text,
  interested_program text,
  message      text,
  status       lead_status not null default 'new',
  admin_notes  text,                                  -- owner's private follow-up notes
  source       text not null default 'contact_form',
  archived     boolean not null default false,         -- soft-delete for spam
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()      -- "last touched" for stale-lead views
);
create index leads_status_idx     on leads (status);
create index leads_created_at_idx on leads (created_at desc);
create index leads_phone_idx      on leads (phone);
```

**`bookings`** (trial booking modal — a booking is a hot lead, so it links to `leads`)
```sql
create table bookings (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid references leads(id) on delete set null,  -- ties booking ↔ lead funnel
  name          text not null,
  phone         text not null,
  preferred_program text,
  preferred_slot text,
  notes         text,                                  -- submitter's note
  admin_notes   text,                                  -- owner's private note
  status        booking_status not null default 'pending',
  source        text not null default 'trial_modal',
  archived      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index bookings_status_idx     on bookings (status);
create index bookings_created_at_idx on bookings (created_at desc);
create index bookings_phone_idx      on bookings (phone);
```

**`updated_at` trigger** (applied to both tables)
```sql
create function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger leads_touch    before update on leads
  for each row execute function touch_updated_at();
create trigger bookings_touch before update on bookings
  for each row execute function touch_updated_at();
```

**`profiles`** — admin gate, 1:1 with `auth.users` (no custom `admin_users` table needed)
```sql
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  is_admin   boolean not null default false,
  created_at timestamptz default now()
);
-- auto-create a profile row when a user signs up
create function handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email) values (new.id, new.email);
  return new;
end $$;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();
```
The single gym-owner account is created once, then `update profiles set is_admin = true where email = '<owner>'`. Every RLS policy below checks this flag, so it is the real security boundary — the React route guard is only UX.

### 5.2 Row Level Security (the real security boundary)

**Model:** the public has **no direct table access at all** — writes go through an Edge Function (service-role), and only admins can read/update. This closes four problems at once: spam, PostgREST filter injection, status-tampering (an anon could otherwise self-set `status='converted'`), and missed notifications.

A helper keeps every policy short and consistent:
```sql
create function is_admin() returns boolean language sql security definer stable as $$
  select exists (select 1 from profiles where id = auth.uid() and is_admin);
$$;
```

**`leads` / `bookings` — admin-only, no anon access**
```sql
alter table leads    enable row level security;
alter table bookings enable row level security;

-- NO public insert policy: anon/authenticated clients cannot touch these tables.
-- Inserts happen only via the submit-lead / submit-booking Edge Functions (service-role,
-- which bypasses RLS). This removes the open `with check (true)` abuse surface entirely.

create policy "admins read leads"    on leads    for select to authenticated using ( is_admin() );
create policy "admins update leads"  on leads    for update to authenticated using ( is_admin() ) with check ( is_admin() );
create policy "admins read bookings"   on bookings for select to authenticated using ( is_admin() );
create policy "admins update bookings" on bookings for update to authenticated using ( is_admin() ) with check ( is_admin() );
-- Hard delete is NOT granted to clients; "delete" = set archived=true (an UPDATE). Purges happen via SQL/service-role only.
```
> Removed from the earlier draft: the `auth.jwt() ->> 'role') = 'admin'` branch. That claim is `anon`/`authenticated`/`service_role` in Supabase and never equals `'admin'` without a custom access-token hook — it was dead code. Authorization is the `profiles.is_admin` flag, full stop.

**`profiles` — `is_admin` must be server-only (CRITICAL)**
```sql
alter table profiles enable row level security;

-- a signed-in user may read ONLY their own profile row
create policy "read own profile" on profiles
  for select to authenticated using ( id = auth.uid() );

-- NO insert/update/delete policy for clients.
-- => is_admin can be set ONLY via SQL / service-role. A user can never escalate themselves.
```
This is the hole that would otherwise sink the whole design: if clients could update their own `profiles` row, anyone could set `is_admin = true` and read every lead. Combined with **no public sign-up** (Auth → disable signups), the admin set is fully controlled. Never expose the service-role key in the frontend.

### 5.3 Edge Functions (REQUIRED — the only write path for public forms)

Public form submissions do **not** insert directly; they POST to an Edge Function. This is now load-bearing for security, not optional polish.

- **`submit-lead`** — validates/normalizes input → forces server-side defaults (`status='new'`, `source`) → service-role insert → fires the owner **notification** (Telegram/email). Verifies a **Cloudflare Turnstile/hCaptcha** token and applies a per-IP **rate limit**; a hidden **honeypot** field is rejected silently.
- **`submit-booking`** — same pattern; also dedupes/links to an existing `lead` by phone (sets `bookings.lead_id`).
- Notification secrets (Telegram bot token, SMTP/Resend key) live only in Edge Function env, never in the bundle.

### 5.4 Auth
- Supabase Auth, email+password for the gym owner/admin.
- **Disable public sign-ups** in Auth settings (admins are provisioned manually). Create the owner once, then `update profiles set is_admin = true where email = '<owner>'`.
- **Configure a custom SMTP sender (Resend/SES).** Supabase's built-in email is rate-limited (~a few/hour) and not production-grade — password-reset and any auth email will be unreliable without this. Enable the "forgot password" flow (the owner *will* forget it).
- Sessions: supabase-js stores the token in `localStorage` (same origin as the public site) — pair with a strict CSP (see §9) to limit XSS token theft; optionally isolate the dashboard on an `admin.` subdomain.
- MFA is out of scope for v1 (single owner); revisit if staff logins are added.

---

## 6. Admin Experience — Two Separate Interfaces

The owner gets **two** admin surfaces. They must **never** need to log into Supabase or edit code.

### 6.1 Content admin → Sanity Studio
Sanity Studio is the editorial dashboard (out of the box). Deploy to `https://cali-terrain.sanity.studio` or mount at `/studio`. Manages: **Home page, About page, Trainers, Membership plans, Programs, Testimonials, Success stories, Blog posts, FAQs, Gallery, Site settings.**

### 6.2 Operational admin → Custom `/admin` Dashboard (REQUIRED DELIVERABLE)

> **Decision (locked):** Supabase Table Editor is **NOT** a client-facing solution. We build a protected `/admin` area inside the existing React + Vite app. The non-technical owner logs in with email/password (Supabase Auth) and manages leads & bookings entirely from this UI.

Manages **operational data only** (content stays in Sanity):

#### Route map
| Route | Purpose | Guard |
|---|---|---|
| `/admin/login` | Email/password sign-in (Supabase Auth) | public |
| `/admin` | Dashboard — KPI cards | admin-only |
| `/admin/leads` | Leads list: search, filter, status update | admin-only |
| `/admin/bookings` | Bookings list: search, filter, status update | admin-only |
| `*` under `/admin` | redirect to `/admin/login` if not authed, `/admin` if authed | — |

All `/admin/*` routes (except login) are wrapped in a `<ProtectedRoute>` that checks: (1) a live Supabase session, and (2) `profiles.is_admin === true`. RLS enforces the same on the server, so a forged client can never read leads.

#### Dashboard (`/admin`)
Four KPI cards (filtering `archived = false`):
- **Total leads** — `count(leads)`
- **Total bookings** — `count(bookings)`
- **New leads this week** — `count(leads where created_at >= date_trunc('week', now()))`
- **New bookings this week** — same window on `bookings`

Plus two things that make the dashboard *actionable*, not just vanity metrics:
- **"Uncontacted leads" count** — `status = 'new'`, the real call-to-action; clicking it deep-links to `/admin/leads?status=new`.
- **Recent activity feed** — latest 5–10 leads/bookings so the owner lands on something to act on.
- (Optional later: week-over-week delta on each card, leads-by-status breakdown, conversion rate.)

#### Leads (`/admin/leads`)
- Table columns: name, phone, interested program, status badge, created date, last-updated.
- **Search** by name or phone (debounced, server-side, **input sanitized** — see §7.4).
- **Filters:** status (`New | Contacted | Converted | Lost` + "All"), **date range**, and an **"uncontacted only"** quick toggle.
- **Inline status update** → optimistic UI + `sonner` toast.
- **Row actions (required):** tap-to-call (`tel:`) and tap-to-WhatsApp (`https://wa.me/<phone>`) — the highest-value action for an owner working from a phone; **add/edit note** (`admin_notes`); **archive** (soft-delete spam).
- Row click → detail drawer: all fields + message + editable notes + call/WhatsApp buttons.
- Simple range-based pagination, newest first. CSV export = nice-to-have.

#### Bookings (`/admin/bookings`)
- Table columns: name, phone, preferred program, preferred slot, status badge, created date.
- **Search** by name or phone.
- **Filters:** status (`Pending | Confirmed | Attended | No Show` + "All"), plus by **program** and a **"today / upcoming"** view.
- **Inline status update** (same pattern as leads); tap-to-call / tap-to-WhatsApp; archive.
- Row click → detail drawer with notes and a link to the linked lead (`lead_id`).

#### Status value mapping (UI label ↔ DB value)
| Leads UI | DB | | Bookings UI | DB |
|---|---|---|---|---|
| New | `new` | | Pending | `pending` |
| Contacted | `contacted` | | Confirmed | `confirmed` |
| Converted | `converted` | | Attended | `attended` |
| Lost | `lost` | | No Show | `no_show` |

#### Shared UX
- Reuse the site's design language (dark theme, `#2EC4B6` accent, Radix UI, `sonner` toasts, `lucide-react` icons) so the admin feels native, not bolted-on.
- Loading skeletons, empty states ("No leads yet"), and error states for every table.
- Logout button in the admin shell header; show signed-in email.
- **Mobile-first, not just "responsive" (the owner's primary device is a phone):** below ~640px the `DataTable` **degrades to stacked cards**, not a horizontally-scrolling table; status changes use a bottom-sheet rather than a tiny inline `<select>`; phone numbers are native `tel:` / `wa.me` links; tap targets ≥44px.

---

## 7. Frontend Integration

### 7.1 Client setup
- `src/lib/sanity.js` — configured `@sanity/client` + `imageUrlBuilder` helper.
- `src/lib/supabase.js` — configured `createClient` with anon key.

### 7.2 Replace mock data with fetches (GROQ)
Swap each hardcoded const for a query. Examples:
```js
// trainers, ordered
const trainers = await client.fetch(
  `*[_type=="trainer"]|order(order asc){
     name, role, bio, philosophy, specialties, certifications,
     experience, membersTrained, "image": image.asset->url }`
);

// blog list / single
*[_type=="blogPost"]|order(publishedAt desc){title,slug,category,excerpt,"coverImage":coverImage.asset->url,publishedAt}
*[_type=="blogPost" && slug.current==$slug][0]{..., body}

// home singleton
*[_type=="homePage"][0]{heroHeadline, stats, whyUs, journeySteps, featuredPrograms[]->}
```
- Add a small `useSanity(query, params)` hook (loading/error/data) or fetch in route loaders.
- Render blog `body` with `@portabletext/react` (replaces the markdown string).
- Keep `mockData.js` as a fallback/seed source until cutover, then delete.

### 7.3 Wire the forms to Supabase
Forms **POST to the Edge Functions** (§5.3), not directly to the tables — anon has no table access.
- `Contact.jsx`: replace the fake `setTimeout` with a `fetch` to `submit-lead` (send a Turnstile token + honeypot field).
- `TrialBookingModal.jsx`: POST to `submit-booking`; keep the WhatsApp redirect as a bonus, but persist first.
- Add a **consent checkbox + privacy-policy link** (storing name/phone → India DPDP Act; see §13).

### 7.4 Admin API / Data Layer (Supabase)

All admin data access lives in **`src/admin/api/`** — thin typed functions wrapping `supabase-js`, so pages never call the client directly. RLS does the authorization; these functions just shape queries.

**`src/admin/api/auth.js`**
```js
export const signIn  = (email, password) => supabase.auth.signInWithPassword({ email, password });
export const signOut = () => supabase.auth.signOut();
export const getSession = () => supabase.auth.getSession();
export const isAdmin = async (userId) => {
  const { data } = await supabase.from('profiles')
    .select('is_admin').eq('id', userId).single();
  return !!data?.is_admin;
};
```

**`src/admin/api/leads.js`**
```js
// PostgREST `or` is built from a raw string, so user input MUST be escaped or it
// becomes a filter-injection bug. Strip the chars that have meaning in the filter grammar.
const safe = (s) => s.replace(/[,()*\\%]/g, ' ').trim();

// list with search + status filter + pagination (newest first, non-archived)
export async function getLeads({ search = '', status = 'all', from = 0, to = 24 }) {
  let q = supabase.from('leads')
    .select('*', { count: 'exact' })
    .eq('archived', false)
    .order('created_at', { ascending: false })
    .range(from, to);
  if (status !== 'all') q = q.eq('status', status);          // status is an enum → no injection surface
  if (search) { const s = safe(search); q = q.or(`name.ilike.%${s}%,phone.ilike.%${s}%`); }
  return q; // -> { data, count, error }
}
export const updateLeadStatus = (id, status) =>
  supabase.from('leads').update({ status }).eq('id', id).select().single();
export const updateLeadNotes = (id, admin_notes) =>
  supabase.from('leads').update({ admin_notes }).eq('id', id).select().single();
export const archiveLead = (id) =>
  supabase.from('leads').update({ archived: true }).eq('id', id);   // soft-delete (UPDATE, not DELETE)
```

**`src/admin/api/bookings.js`** — same shape as leads (`getBookings`, `updateBookingStatus`, `updateBookingNotes`, `archiveBooking`), filtering on `pending|confirmed|attended|no_show`, same `safe()` search escaping.

**`src/admin/api/stats.js`** (dashboard KPIs — `head: true` count queries are cheap)
```js
const weekStart = () => { const d = new Date(); const day = (d.getDay()+6)%7;
  d.setDate(d.getDate()-day); d.setHours(0,0,0,0); return d.toISOString(); };

export async function getDashboardStats() {
  const totalLeads    = await supabase.from('leads').select('*', { count:'exact', head:true });
  const totalBookings = await supabase.from('bookings').select('*', { count:'exact', head:true });
  const newLeads      = await supabase.from('leads').select('*', { count:'exact', head:true }).gte('created_at', weekStart());
  const newBookings   = await supabase.from('bookings').select('*', { count:'exact', head:true }).gte('created_at', weekStart());
  return {
    totalLeads: totalLeads.count, totalBookings: totalBookings.count,
    newLeadsThisWeek: newLeads.count, newBookingsThisWeek: newBookings.count,
  };
}
```
> Optional refinement: expose the four counts via a single Postgres RPC (`get_admin_stats()`, `security definer`) to do it in one round-trip. Start with the four count queries; optimize only if needed.

**React Query layer (recommended):** wrap these in `@tanstack/react-query` hooks (`useLeads`, `useBookings`, `useDashboardStats`, `useUpdateLeadStatus`) for caching, background refetch, and optimistic status updates. If we want zero new deps, a small `useAsync` hook works too.

### 7.5 Admin pages & components (React)

```
src/admin/
├── AdminApp.jsx              # nested router + <AdminLayout>
├── AdminLayout.jsx           # sidebar/topbar shell, logout, signed-in email
├── ProtectedRoute.jsx        # session + is_admin gate, redirects to /admin/login
├── context/
│   └── AuthContext.jsx       # session, user, isAdmin, signIn/signOut
├── pages/
│   ├── LoginPage.jsx         # /admin/login
│   ├── DashboardPage.jsx     # /admin       (KPI cards)
│   ├── LeadsPage.jsx         # /admin/leads
│   └── BookingsPage.jsx      # /admin/bookings
├── components/
│   ├── StatCard.jsx          # KPI card (value, label, icon)
│   ├── DataTable.jsx         # generic table: columns, rows, loading/empty states
│   ├── SearchBar.jsx         # debounced name/phone search
│   ├── StatusFilter.jsx      # status dropdown (config-driven options)
│   ├── StatusBadge.jsx       # colored badge per status value
│   ├── StatusSelect.jsx      # inline status updater (writes back)
│   ├── DetailDrawer.jsx      # Radix Dialog: full record view
│   └── Pagination.jsx        # range-based pager
├── api/                      # §7.4 — auth.js, leads.js, bookings.js, stats.js
└── hooks/
    ├── useLeads.js
    ├── useBookings.js
    └── useDashboardStats.js
```

Wire `AdminApp` into the top-level router (`src/App.jsx`) under `path="/admin/*"`, lazy-loaded (`React.lazy`) so admin code is **code-split** out of the public bundle. `LoginPage` is outside `<ProtectedRoute>`; everything else is inside it.

---

## 8. Data Migration / Seeding

Write one-time Node scripts (run locally with write tokens, never shipped):
- **`scripts/seed-sanity.mjs`** — read the existing arrays from `mockData.js` + page consts (`COACHES`, `PROGRAMS`, `G3/G5/P3/P5`, `FAQ`, `STATS`, etc.), transform to Sanity documents, upload images (Unsplash/Pexels URLs → `client.assets.upload`), and `createOrReplace` documents. This preserves all current content with zero manual re-entry.
- Markdown blog `content` → convert to Portable Text (`@sanity/block-tools` or a quick markdown-to-blocks pass).
- Supabase needs no seed data (leads start empty); just run the table + RLS migration SQL.

---

## 9. Security Checklist
- [ ] Only `VITE_`-prefixed = anon Sanity read + Supabase anon key reach the browser. Write tokens / service-role stay server-side.
- [ ] **`profiles.is_admin` is settable only via SQL/service-role** — no client insert/update/delete policy. (Single most important item; an escalation here exposes all leads.)
- [ ] **Public sign-ups disabled** in Supabase Auth.
- [ ] Supabase RLS: clients have **no direct table access** to `leads`/`bookings`; writes only via Edge Functions, reads/updates only for `is_admin()`.
- [ ] Admin route guard is **UX only** — RLS is the real gate; never rely on the client check alone.
- [ ] **Search input sanitized** before building the PostgREST `or` filter (filter-injection — see §7.4).
- [ ] Form spam protection: honeypot + Turnstile/hCaptcha + per-IP rate limit, all enforced in the Edge Function.
- [ ] **CSP + security headers** set on the SPA (mitigates same-origin admin-token theft via XSS); consider isolating `/admin` on an `admin.` subdomain.
- [ ] Custom SMTP configured (auth emails reliable); secrets (Telegram/SMTP) only in Edge Function env.
- [ ] CORS: restrict Supabase/Sanity to the production domain.
- [ ] Sanity dataset `production` is public-read (fine for marketing content) — confirm no private fields stored there.

---

## 9a. Production Readiness (required before launch)

Beyond features, these operational items gate a real launch:

| Need | Priority | Approach |
|---|---|---|
| **Backups** | **Critical** | Supabase **free tier has no automatic backups / PITR** (Pro only). Customer lead data with zero recovery is unacceptable → upgrade to **Pro** (daily backup + PITR) *or* a scheduled `pg_dump` to object storage. This invalidates the earlier "$0/month" assumption — see §12. |
| **Email delivery (SMTP)** | **High** | Custom sender (Resend/SES) for auth + notifications; built-in Supabase email is not production-grade. |
| **Lead notifications** | **High** | Owner pinged on every new lead/booking (Telegram simplest/free) from the Edge Function. |
| **Spam / rate limiting** | **High** | Turnstile/hCaptcha + honeypot + per-IP limit in the Edge Function. |
| **Error monitoring** | **Med** | Sentry on the SPA *and* Edge Functions — a silently failing lead form = lost revenue. |
| **Privacy / consent** | **Med** | Consent checkbox + privacy policy on forms (India DPDP Act; storing name/phone). |
| **Site analytics** | **Med** | Plausible or GA4 for traffic + conversion visibility. |
| **Uptime + logging** | **Low** | Uptime check on the site; structured logs in Edge Functions. |
| **Staging environment** | **Low** | Separate Sanity dataset + Supabase project; preview deploys. |

---

## 10. Deployment & Environments
- **Frontend:** Vercel/Netlify (already `.vercel` in gitignore → likely Vercel). Set env vars in dashboard.
- **Sanity Studio:** `sanity deploy` → `*.sanity.studio`, or build into `/studio` route.
- **Supabase:** one project; use `supabase/migrations` for SQL + Edge Functions via `supabase functions deploy`.
- Use **two Sanity datasets** (`production`, `development`) and/or two Supabase projects if you want a safe staging environment.

---

## 11. Phased Rollout (suggested order & rough effort)

| Phase | Scope | Deliverables | Est. |
|---|---|---|---|
| **0. Setup** | Create Sanity project + Studio scaffold; create Supabase project; add env vars; install deps (`@sanity/client`, `@supabase/supabase-js`, `@tanstack/react-query`) | working local Studio + Supabase project | 0.5 day |
| **1. Sanity schemas** | Author all schema types (§4) + desk structure + orderable lists | Studio editing all content types | 1.5 days |
| **2. Seed content** | Migration script: port all mock data + upload images | content populated, zero manual entry | 1 day |
| **3. Frontend reads** | Sanity client + replace every hardcoded const with GROQ; Portable Text for blog; add About page | public site reads from Sanity | 2 days |
| **4. Supabase DB + Edge Functions** | `leads`/`bookings`/`profiles` tables, enums, triggers, indexes, hardened RLS (§5.2); `submit-lead`/`submit-booking` Edge Functions (validation + Turnstile + rate limit + owner notification); wire Contact form & Trial modal to them | forms persist via secured write path, RLS enforced | 2 days |
| **5a. Admin auth + shell** | `AuthContext`, `ProtectedRoute`, `AdminLayout`, `LoginPage`; lazy-mount `/admin/*`; provision owner + `is_admin`; password-reset flow | login works, routes gated | 1 day |
| **5b. Admin dashboard + tables** | `api/` + hooks (§7.4); `DashboardPage` (KPIs + uncontacted + recent feed); `LeadsPage`/`BookingsPage` with search, filters, inline status, notes, archive, tap-to-call/WhatsApp, detail drawer, pagination | full operational admin | 3 days |
| **5c. Mobile admin** | `DataTable` → stacked cards under 640px; bottom-sheet status changes; native `tel:`/`wa.me` | usable on owner's phone | 0.5 day |
| **6. Polish + prod-readiness** | Loading/empty/error states, **prerender marketing routes** (SEO, §2), Sentry, analytics, consent/privacy, custom SMTP, backups, delete `mockData.js` | production-ready | 2 days |
| **Total** | | | **~13–14 days** |

---

## 12. Cost (small business / low traffic)
- **Sanity** — Free tier covers content + one editor comfortably.
- **Supabase** — Free tier is *technically* enough for data volume, **but** has no automatic backups. For real customer data, budget **Supabase Pro (~$25/mo)** for daily backups + PITR, *or* accept a self-managed `pg_dump` schedule on free. Don't ship lead data with no recovery path.
- **Email (Resend/SES)** — free/near-free at this volume.
- **Hosting** — Vercel/Netlify free tier.
- **Realistic budget: ~$0–25/mo.** The honest number is Pro-for-backups, not "$0" — that earlier figure ignored backups (see §9a).

---

## 13. Feature Scope & Open Decisions

### 13.1 Feature classification (from the senior review)

**Required before launch** (now baked into the schema/§6/§9a above):
- New-lead/booking **notification** (Telegram/email from the Edge Function).
- **Notes** on a lead/booking (`admin_notes`).
- **Archive/soft-delete** spam.
- **Tap-to-call / tap-to-WhatsApp** from a row.
- **Backups** (Pro or `pg_dump`), **custom SMTP**, **spam protection**, **consent/privacy**.

**Nice to have** (build if time allows in v1, else fast-follow):
- CSV export · date-range & source filters · booking→lead linkage UI · week-over-week deltas on KPI cards · duplicate-by-phone merge.

**Future phase** (deliberately deferred):
- Appointment/calendar scheduling with slot capacity · lead activity/audit history (`lead_activity` table) · multi-role staff management · in-app notification center · follow-up reminders · membership/payment tracking · lead assignment to a coach.

### 13.2 Inputs still needed before Phase 0
1. **Admin account:** confirm the owner's login email (one admin for v1; `profiles.is_admin` already supports more later).
2. **Notification channel:** Telegram (recommended), email, or WhatsApp API?
3. **Studio hosting:** separate `*.sanity.studio` subdomain or `/studio` on the main domain?
4. **About page:** confirm desired sections (story, mission, values, facility, team) — it doesn't exist in code yet.
5. **Backups budget:** Supabase Pro (~$25/mo, recommended) vs self-managed `pg_dump` on free?
6. **SEO posture:** is prerendering marketing routes enough for v1, or is a Next.js migration in scope now? *(Recommend prerender now, Next.js later.)*

> **Resolved decisions:** (a) Leads/bookings admin = **custom `/admin`** (Table Editor ruled out). (b) Public forms write **only via Edge Functions** (no anon table access). (c) `is_admin` is **server-only**. (d) Blog = **Portable Text**. (e) Soft-delete via `archived`. (f) Audit log & scheduling = **future phase**.

---

*Next step once approved: scaffold the Sanity Studio + schemas (Phase 0–1), stand up the Supabase project with `leads`/`bookings`/`profiles` + RLS (Phase 4), then build the `/admin` dashboard (Phase 5a–5b).*
