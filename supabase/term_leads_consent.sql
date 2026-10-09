-- Consent proof columns for term_leads. Run once in the SQL Editor BEFORE
-- deploying the updated submit-lead function and site.
--   consent_recorded_at  when they ticked the calls/texts consent box
--   disclosure_version   which wording they were shown (see disclosures.js)
--   ip_address           recorded by the server when the answers arrived

alter table public.term_leads
  add column if not exists consent_recorded_at timestamptz,
  add column if not exists disclosure_version  text check (char_length(disclosure_version) <= 40),
  add column if not exists ip_address          text check (char_length(ip_address) <= 64);
