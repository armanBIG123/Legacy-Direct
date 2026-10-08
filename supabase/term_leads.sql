-- LegacyDirect TERM leads — run once in the LegacyDirect Supabase project
-- (SQL Editor → New query → paste → Run).
--
-- Separate from the IUL `leads` table because term leads are shorter and can
-- be partial: if someone taps "Call" halfway through, we save whatever they
-- had entered. Each visit has a session_id, so finishing the form later
-- updates the same row instead of creating a duplicate.

create table if not exists public.term_leads (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  session_id          uuid not null unique,

  -- How far they got
  completed           boolean not null default false,
  call_clicked_at     timestamptz,
  last_step           text check (char_length(last_step) <= 40),

  -- What they need
  coverage_need       text check (coverage_need in ('living', 'temporary', 'mortgage')),
  annual_income       integer check (annual_income between 0 and 100000000),
  mortgage_balance    integer check (mortgage_balance between 0 and 100000000),
  suggested_coverage  integer check (suggested_coverage between 0 and 1000000000),

  -- About them
  first_name          text check (char_length(first_name) <= 80),
  last_name           text check (char_length(last_name) <= 80),
  date_of_birth       date,
  zip                 text check (zip ~ '^\d{5}$'),
  tobacco_last_2_years boolean,
  email               text check (email is null or (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 200)),
  phone               text check (char_length(phone) <= 30),

  -- Consent record
  consent_texts        boolean not null default false,
  consent_text_wording text,

  -- Context
  source_url          text check (char_length(source_url) <= 500),
  user_agent          text check (char_length(user_agent) <= 500),

  -- Working the lead
  status              text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'applied', 'closed', 'spam')),
  assigned_to         text,
  paceledger_synced_at timestamptz
);

create index if not exists term_leads_created_at_idx on public.term_leads (created_at desc);

-- Keep updated_at current on every change.
create or replace function public.touch_term_leads() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists term_leads_touch on public.term_leads;
create trigger term_leads_touch before update on public.term_leads
  for each row execute function public.touch_term_leads();

-- Security: the public website has NO direct access at all. Leads only
-- arrive through the submit-lead server function (which checks Cloudflare
-- Turnstile first) acting as service_role.
alter table public.term_leads enable row level security;
revoke all on public.term_leads from anon, authenticated;
grant select, insert, update, delete on public.term_leads to service_role;
