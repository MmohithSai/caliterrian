# Cali Terrain — Backend Setup (what's done + your remaining steps)

This session stood up the Supabase backend, the secure write path for the public
forms, and the `/admin` operational dashboard. Below is what exists and the few
**manual steps only you can do** (Supabase Auth config can't be done over the API).

## ✅ Done in this session

**Database** (`public` schema, all via migrations):
- `lead_status` / `booking_status` enums.
- `leads`, `bookings` tables (indexes, `updated_at` triggers, `admin_notes`, `archived` soft-delete; `bookings.lead_id → leads.id`).
- `profiles` table (1:1 with `auth.users`, auto-created on signup via trigger; `is_admin` flag).
- `is_admin()` helper + `get_admin_stats()` RPC (admin-gated).
- **RLS**: public has *no* direct table access. Reads/updates only for admins; `is_admin` is server-only (no self-escalation possible).

**Edge Functions** (the ONLY public write path):
- `submit-lead`, `submit-booking` — validate + normalize, honeypot, per-IP rate limit, service-role insert, Telegram notify hook. Booking dedupes/links to a lead by phone.

**Frontend**:
- `src/lib/supabase.js` client + `submitForm()` helper.
- Contact form → `submit-lead`; Trial modal → `submit-booking` (persists first, then WhatsApp redirect). Honeypot field added to both.
- Full `/admin` app (code-split): login + forgot-password, protected routes, dashboard (KPIs, uncontacted/pending deep-links, recent activity), Leads & Bookings (search, status filter, inline status, notes, archive, tap-to-call/WhatsApp, detail drawer, pagination, mobile cards).

Verified end-to-end: valid submissions persist, honeypot/invalid rejected, booking links to lead, anon is blocked from reading/inserting (RLS `42501`).

---

## 🔧 Your remaining steps (5 minutes, in the Supabase dashboard)

### 1. Create the owner account
Dashboard → **Authentication → Users → Add user** → enter the owner's email + a
password (check "Auto Confirm User"). Then make them admin — SQL Editor:

```sql
update profiles set is_admin = true where email = 'OWNER_EMAIL_HERE';
```

Log in at `/admin/login`. (To add more admins later, repeat this one line.)

### 2. Disable public sign-ups (important)
Dashboard → **Authentication → Sign In / Providers → Email** → turn **off**
"Allow new users to sign up". Admins are provisioned manually (step 1), so no one
can self-register and get a `profiles` row.

### 3. (Optional) Owner notifications via Telegram
The Edge Functions stay silent until you add the secrets:
```bash
supabase secrets set TELEGRAM_BOT_TOKEN=xxx TELEGRAM_CHAT_ID=xxx
```
(Create a bot with @BotFather; get your chat id from @userinfobot.) Or wire email/Resend in `notifyOwner()`.

### 4. (Recommended before launch) Custom SMTP + backups
- Auth emails (password reset) are rate-limited on Supabase's built-in sender →
  configure a custom SMTP (Resend/SES) under **Auth → Emails → SMTP**.
- Free tier has **no automatic backups**. For real lead data, enable Pro (daily
  backup + PITR) or schedule a `pg_dump`.

---

## Notes / deferred (from the plan, not done this session)
- **Turnstile/hCaptcha**: honeypot + rate limit are in; add a CAPTCHA token check in the Edge Functions if spam appears.
- **Sanity CMS**: marketing content is still hardcoded — that's a separate phase.
- **Consent checkbox / privacy policy** on forms (India DPDP) — add before launch.
- Two security advisor warnings remain on `is_admin()` / `get_admin_stats()` — these are **intentional**: a `SECURITY DEFINER` helper used inside RLS must be executable by the `authenticated` role.
