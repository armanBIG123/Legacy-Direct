-- Run ONLY AFTER the new site (with the Cloudflare check) is live and a
-- test lead has come through. This removes the website's direct ability to
-- write to the leads table, so every lead must pass through the
-- submit-lead function (which verifies a real person first).

drop policy if exists "website can submit leads" on public.leads;
revoke insert on public.leads from anon;

-- To undo (only if something goes wrong):
--   grant insert on public.leads to anon;
--   create policy "website can submit leads" on public.leads for insert to anon
--     with check (status = 'new' and assigned_to is null and paceledger_synced_at is null);
