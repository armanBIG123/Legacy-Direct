-- LegacyDirect — alert the team about people who LEFT the term form
-- after giving an email or phone number (didn't finish, didn't tap Call).
--
-- Run once in the LegacyDirect Supabase project:
--   SQL Editor → New query → paste → Run.
--
-- How it works: every 5 minutes, any term lead that
--   • has a valid email or 10-digit phone,
--   • hasn't completed the form or tapped Call,
--   • and hasn't changed for 10 minutes
-- gets abandoned_alerted_at stamped. That update fires the existing
-- term_leads webhook, and notify-new-lead emails it as "LEFT MID-FORM".
-- Each lead is alerted once. If they come back and finish, you still get
-- the normal "Completed form" email.

alter table public.term_leads
  add column if not exists abandoned_alerted_at timestamptz;

create index if not exists term_leads_abandoned_idx
  on public.term_leads (updated_at)
  where completed = false and call_clicked_at is null and abandoned_alerted_at is null;

create extension if not exists pg_cron;

-- Re-running this file replaces the job instead of adding a second one.
select cron.unschedule(jobid) from cron.job where jobname = 'term-abandoned-alerts';

select cron.schedule(
  'term-abandoned-alerts',
  '*/5 * * * *',
  $$
  update public.term_leads
     set abandoned_alerted_at = now()
   where completed = false
     and call_clicked_at is null
     and abandoned_alerted_at is null
     and (email is not null or phone ~ '^\d{10}$')
     and updated_at < now() - interval '10 minutes'
     and created_at > now() - interval '2 days'
  $$
);
