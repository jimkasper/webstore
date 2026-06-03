-- ════════════════════════════════════════════════════════════════════
-- Let's Stay in Touch — Supabase Schema
-- Fresh install. Run once in: Supabase Dashboard → SQL Editor
-- ════════════════════════════════════════════════════════════════════

create table contacts (
  id             uuid        primary key default gen_random_uuid(),
  created_at     timestamptz default now(),

  -- Identity
  first_name     text        check (char_length(first_name) <= 100),
  last_name      text        check (char_length(last_name) <= 100),
  email          text        check (char_length(email) <= 254),
  phone          text        check (char_length(phone) <= 30),
  profession     text        check (char_length(profession) <= 200),
  company        text        check (char_length(company) <= 200),
  location       text        check (char_length(location) <= 200),
  birthday       text        check (char_length(birthday) <= 20),

  -- Context
  met_at         text        check (char_length(met_at) <= 200),
  when_met       text        check (char_length(when_met) <= 20),
  mutual_friends text        check (char_length(mutual_friends) <= 300),
  talked         text        check (char_length(talked) <= 2000),

  -- Photos (base64 data URLs, size-capped in Edge Function)
  photo          text,
  business_card  text,

  -- Structured data
  contact_methods  jsonb default '[]',
  social_handles   jsonb default '[]',
  personal_links   jsonb default '[]',
  collaborations   jsonb default '[]',

  -- Notes
  note           text        check (char_length(note) <= 2000),

  -- Directory management
  followup_date  date,
  flagged        boolean     default false,
  spam_score     int         default 0
);

-- ── Row-Level Security ───────────────────────────────────────────────
-- Anon key: no direct access (all form submissions go through Edge Function)
-- Authenticated users (Supabase Auth login): full access

alter table contacts enable row level security;

create policy "Authenticated users have full access"
  on contacts for all
  to authenticated
  using (true)
  with check (true);

create policy "Anon has no direct access"
  on contacts for all
  to anon
  using (false)
  with check (false);

-- ── Cron jobs (follow-up reminders + weekly backup) ──────────────────
-- ⚠️  DO NOT run these here yet.
-- Cron jobs require the pg_cron extension to be enabled first.
-- Run these in a SEPARATE step after enabling the extension:
--
--   Step A: Dashboard → Database → Extensions → search "pg_cron" → Enable
--   Step B: Open SQL Editor again and run cron.sql (the second file)

-- ── Supabase Auth hardening ──────────────────────────────────────────
-- Do these in the Supabase dashboard, not SQL:
--
-- Dashboard → Authentication → Configuration:
--   • JWT expiry: 28800  (8 hours)
--   • Enable "Leaked password protection"
--
-- Dashboard → Authentication → Users:
--   • Add yourself as a user (this is your login for /peeps)
