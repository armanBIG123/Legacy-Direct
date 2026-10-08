-- Adds ad-tracking columns to term_leads so every lead shows which ad,
-- campaign and click produced it. Run once in the SQL Editor BEFORE
-- deploying the updated submit-lead function and site.

alter table public.term_leads
  add column if not exists utm_source   text check (char_length(utm_source)   <= 200),
  add column if not exists utm_medium   text check (char_length(utm_medium)   <= 200),
  add column if not exists utm_campaign text check (char_length(utm_campaign) <= 200),
  add column if not exists utm_content  text check (char_length(utm_content)  <= 200),
  add column if not exists utm_term     text check (char_length(utm_term)     <= 200),
  add column if not exists gclid        text check (char_length(gclid)        <= 200),
  add column if not exists fbclid       text check (char_length(fbclid)       <= 200),
  add column if not exists landing_page text check (char_length(landing_page) <= 500),
  add column if not exists referrer     text check (char_length(referrer)     <= 500);

create index if not exists term_leads_campaign_idx on public.term_leads (utm_campaign);
