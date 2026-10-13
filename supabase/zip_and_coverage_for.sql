-- LegacyDirect — new fields for the Oct 12 quiz update. Run once:
--   SQL Editor → New query → paste → Run.
--
-- IUL quiz now asks for ZIP code on the first screen.
alter table public.leads
  add column if not exists zip text check (zip ~ '^\d{5}$');

-- Term quiz now starts with "Me / Someone else".
alter table public.term_leads
  add column if not exists coverage_for text check (coverage_for in ('me', 'someone-else'));
