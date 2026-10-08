-- LegacyDirect lead capture — run once in the LegacyDirect Supabase project
-- (SQL Editor → New query → paste → Run). Separate from PaceLedger on purpose.

create table if not exists public.leads (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),

  -- Who filled it out / who is covered
  coverage_for        text not null check (coverage_for in ('me', 'someone-else')),
  insured_first_name  text not null check (char_length(insured_first_name) between 1 and 80),
  insured_last_name   text not null check (char_length(insured_last_name) between 1 and 80),
  contact_email       text not null check (contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(contact_email) <= 200),
  contact_mobile      text check (char_length(contact_mobile) <= 30),

  -- Quiz answers
  goals               text[] not null default '{}',
  trigger_reason      text,
  dependents          text[] not null default '{}',
  children_under_18   text,
  mortgage_remaining  integer check (mortgage_remaining between 0 and 100000000),
  state               text check (char_length(state) <= 40),
  date_of_birth       date,
  sex                 text check (sex in ('female', 'male')),
  height_inches       integer check (height_inches between 12 and 108),
  weight_lbs          integer check (weight_lbs between 1 and 1000),
  tobacco             text,
  citizenship         text,
  monthly_budget      text,
  timing              text,
  matched_plan        text,

  -- Consent record (what they agreed to, exact wording, and when)
  consent_reminder_email boolean not null default false,
  consent_updates_email  boolean not null default false,
  consent_texts          boolean not null default false,
  consent_text_wording   text,
  consent_recorded_at    timestamptz not null default now(),

  -- Context
  source_url          text check (char_length(source_url) <= 500),
  user_agent          text check (char_length(user_agent) <= 500),

  -- Working the lead (and the future PaceLedger hand-off)
  status              text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'applied', 'closed', 'spam')),
  assigned_to         text,
  paceledger_synced_at timestamptz
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

-- Security: the public website may ONLY insert. It can never read, change
-- or delete leads. Your team views them in the Supabase dashboard (which
-- bypasses these rules) until a proper admin view is built.
alter table public.leads enable row level security;

drop policy if exists "website can submit leads" on public.leads;
create policy "website can submit leads"
  on public.leads for insert
  to anon
  with check (status = 'new' and assigned_to is null and paceledger_synced_at is null);

revoke all on public.leads from anon;
grant insert on public.leads to anon;
