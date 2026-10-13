-- LegacyDirect — compliance update (Oct 13). Run once, AFTER
-- zip_and_coverage_for.sql and term_leads_abandoned.sql:
--   SQL Editor → New query → paste → Run. Safe to run again.
--
-- 1. IUL leads keep the same proof-of-consent fields as term leads.
-- 2. An internal do-not-contact list (federal rules require every company
--    that makes sales calls to keep one and honor it). Add a phone or
--    email there — or tick do_not_contact on any lead — and every alert
--    for that person is marked DO NOT CONTACT.
-- 3. Unfinished term requests with no email or phone are deleted after
--    30 days, as the Privacy Policy says.

-- ---------- 1. Proof fields + opt-out flags on both lead tables ----------
alter table public.leads
  add column if not exists disclosure_version text check (char_length(disclosure_version) <= 40),
  add column if not exists ip_address text check (char_length(ip_address) <= 64),
  add column if not exists do_not_contact boolean not null default false,
  add column if not exists opted_out_at timestamptz;

alter table public.term_leads
  add column if not exists do_not_contact boolean not null default false,
  add column if not exists opted_out_at timestamptz;

-- ---------- 2. Internal do-not-contact list ----------
create table if not exists public.do_not_contact (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  phone      text check (phone ~ '^\d{10}$'),
  email      text check (char_length(email) <= 200),
  reason     text,           -- e.g. 'Replied STOP', 'Asked on call 10/14'
  added_by   text,
  check (phone is not null or email is not null)
);
create unique index if not exists do_not_contact_phone_idx on public.do_not_contact (phone) where phone is not null;
create unique index if not exists do_not_contact_email_idx on public.do_not_contact (email) where email is not null;

alter table public.do_not_contact enable row level security;
revoke all on public.do_not_contact from anon, authenticated;
grant select, insert, update, delete on public.do_not_contact to service_role;

-- Normalize what's typed into the list: digits-only phone, lowercase email.
create or replace function public.dnc_normalize() returns trigger
language plpgsql as $$
begin
  if new.phone is not null then
    new.phone := right(regexp_replace(new.phone, '\D', '', 'g'), 10);
  end if;
  if new.email is not null then
    new.email := lower(trim(new.email));
  end if;
  return new;
end $$;
drop trigger if exists do_not_contact_normalize on public.do_not_contact;
create trigger do_not_contact_normalize before insert or update on public.do_not_contact
  for each row execute function public.dnc_normalize();

-- Adding someone to the list flags their existing leads.
create or replace function public.dnc_flag_leads() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.term_leads
     set do_not_contact = true, opted_out_at = coalesce(opted_out_at, now())
   where do_not_contact = false
     and ((new.phone is not null and phone = new.phone) or (new.email is not null and lower(email) = new.email));
  update public.leads
     set do_not_contact = true, opted_out_at = coalesce(opted_out_at, now())
   where do_not_contact = false
     and ((new.phone is not null and regexp_replace(coalesce(contact_mobile, ''), '\D', '', 'g') = new.phone)
          or (new.email is not null and lower(contact_email) = new.email));
  return new;
end $$;
drop trigger if exists do_not_contact_flag on public.do_not_contact;
create trigger do_not_contact_flag after insert on public.do_not_contact
  for each row execute function public.dnc_flag_leads();

-- Ticking do_not_contact on a lead stamps opted_out_at (before the row is
-- saved) and adds that person to the list (after it's saved, so flagging
-- their other leads doesn't collide with this row).
create or replace function public.lead_optout_stamp() returns trigger
language plpgsql as $$
begin
  if new.do_not_contact and not coalesce(old.do_not_contact, false) then
    new.opted_out_at := coalesce(new.opted_out_at, now());
  end if;
  return new;
end $$;

create or replace function public.lead_to_dnc() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  p text;
  e text;
begin
  if new.do_not_contact and not coalesce(old.do_not_contact, false) then
    if tg_table_name = 'term_leads' then
      p := new.phone; e := new.email;
    else
      p := right(regexp_replace(coalesce(new.contact_mobile, ''), '\D', '', 'g'), 10); e := new.contact_email;
    end if;
    if p ~ '^\d{10}$' then
      insert into public.do_not_contact (phone, reason) values (p, 'Flagged on lead ' || new.id) on conflict do nothing;
    end if;
    if e is not null then
      insert into public.do_not_contact (email, reason) values (e, 'Flagged on lead ' || new.id) on conflict do nothing;
    end if;
  end if;
  return null;
end $$;

drop trigger if exists term_leads_optout_stamp on public.term_leads;
create trigger term_leads_optout_stamp before update on public.term_leads
  for each row execute function public.lead_optout_stamp();
drop trigger if exists leads_optout_stamp on public.leads;
create trigger leads_optout_stamp before update on public.leads
  for each row execute function public.lead_optout_stamp();

drop trigger if exists term_leads_to_dnc on public.term_leads;
create trigger term_leads_to_dnc after update on public.term_leads
  for each row execute function public.lead_to_dnc();
drop trigger if exists leads_to_dnc on public.leads;
create trigger leads_to_dnc after update on public.leads
  for each row execute function public.lead_to_dnc();

-- ---------- 3. Scheduled jobs ----------
create extension if not exists pg_cron;

-- "Left mid-form" alerts: same as before, but never for opted-out people.
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
     and do_not_contact = false
     and (email is not null or phone ~ '^\d{10}$')
     and updated_at < now() - interval '10 minutes'
     and created_at > now() - interval '2 days'
  $$
);

-- Retention: unfinished requests that never had an email or phone, 30 days.
select cron.unschedule(jobid) from cron.job where jobname = 'term-purge-contactless';
select cron.schedule(
  'term-purge-contactless',
  '17 8 * * *',
  $$
  delete from public.term_leads
   where completed = false
     and status = 'new'
     and email is null
     and (phone is null or phone !~ '^\d{10}$')
     and created_at < now() - interval '30 days'
  $$
);
