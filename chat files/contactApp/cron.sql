-- ════════════════════════════════════════════════════════════════════
-- Let's Stay in Touch — Cron Jobs
-- Run this ONLY after enabling the pg_cron extension:
-- Dashboard → Database → Extensions → search "pg_cron" → Enable
--
-- Before running: replace YOUR_PROJECT_ID and YOUR_SERVICE_ROLE_KEY
-- with your actual values (Project Settings → API)
-- ════════════════════════════════════════════════════════════════════

select cron.schedule(
  'followup-reminders',
  '0 13 * * *',   -- Daily at 1pm UTC (9am ET)
  $$
    select net.http_post(
      url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/followup-reminders',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);

select cron.schedule(
  'weekly-backup',
  '0 13 * * 0',   -- Every Sunday at 1pm UTC (9am ET)
  $$
    select net.http_post(
      url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/weekly-backup',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);
