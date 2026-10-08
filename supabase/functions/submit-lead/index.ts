// submit-lead — the only way a lead gets into the database.
// Handles both product lines:
//   kind = 'iul'  (default) → public.leads        (full IUL quiz)
//   kind = 'term'           → public.term_leads   (short term quiz; may be
//                              partial when someone taps "Call" mid-form)
//
// 1. Confirms with Cloudflare Turnstile that a real person submitted it.
// 2. Keeps only the fields the website is allowed to set.
// 3. Skips exact repeats (same email within 10 minutes).
// 4. Saves the lead. The existing database webhook then emails the team.
//
// Secrets (Supabase → Edge Functions → Secrets):
//   TURNSTILE_SECRET_KEY   from Cloudflare → Turnstile → your widget
// Provided automatically by Supabase:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Deploy with "Verify JWT" turned OFF — Turnstile is the gate here.

const ALLOWED_ORIGINS = [
  'https://legacydirectplan.com',
  'https://www.legacydirectplan.com',
  'https://legacydirect.arman-716.workers.dev',
];

// Columns the website may fill in. Anything else in the request is ignored,
// so a tampered request can't set status, assignment, etc.
const ALLOWED_FIELDS = [
  'coverage_for', 'insured_first_name', 'insured_last_name', 'contact_email', 'contact_mobile',
  'goals', 'trigger_reason', 'dependents', 'children_under_18', 'mortgage_remaining', 'state',
  'date_of_birth', 'sex', 'height_inches', 'weight_lbs', 'tobacco', 'citizenship',
  'monthly_budget', 'timing', 'matched_plan',
  'consent_reminder_email', 'consent_updates_email', 'consent_texts', 'consent_text_wording',
  'source_url',
];

const TERM_FIELDS = [
  'completed', 'call_clicked_at', 'last_step',
  'coverage_need', 'annual_income', 'mortgage_balance', 'suggested_coverage',
  'first_name', 'last_name', 'date_of_birth', 'zip', 'tobacco_last_2_years', 'email', 'phone',
  'consent_texts', 'consent_text_wording', 'source_url',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid',
  'landing_page', 'referrer',
];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function cors(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
}

function reply(origin: string | null, status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(origin) });
  if (req.method !== 'POST') return reply(origin, 405, { error: 'method_not_allowed' });

  const secret = Deno.env.get('TURNSTILE_SECRET_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!secret || !supabaseUrl || !serviceKey) {
    console.error('submit-lead is missing configuration');
    return reply(origin, 500, { error: 'not_configured' });
  }

  const body = await req.json().catch(() => null);
  const token = body?.token;
  const input = body?.lead;
  if (!token || typeof input !== 'object' || input === null) {
    return reply(origin, 400, { error: 'bad_request' });
  }

  // 1. Is this a real person?
  const ip = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', String(token));
  if (ip) form.append('remoteip', ip);
  const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form })
    .then((r) => r.json())
    .catch(() => null);
  if (!verify?.success) {
    console.warn('Turnstile rejected', verify?.['error-codes']);
    return reply(origin, 403, { error: 'verification_failed' });
  }

  const rest = (path: string, init: RequestInit = {}) =>
    fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });

  // ---------- TERM: create or update this visit's row ----------
  if (body?.kind === 'term') {
    const sessionId = String(body?.session_id ?? '');
    if (!UUID_RE.test(sessionId)) return reply(origin, 400, { error: 'bad_request' });

    const row: Record<string, unknown> = { session_id: sessionId };
    for (const key of TERM_FIELDS) if (key in input) row[key] = input[key];
    if (typeof row.email === 'string') row.email = row.email.trim().toLowerCase() || null;
    row.user_agent = (req.headers.get('user-agent') ?? '').slice(0, 500);

    const up = await rest('term_leads?on_conflict=session_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(row),
    });
    if (!up.ok) {
      const detail = await up.text();
      console.error('Term upsert failed', up.status, detail);
      return reply(origin, up.status === 400 ? 400 : 500, { error: up.status === 400 ? 'invalid_lead' : 'save_failed' });
    }
    return reply(origin, 200, { ok: true });
  }

  // ---------- IUL ----------
  // 2. Keep only allowed fields.
  const lead: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) if (key in input) lead[key] = input[key];
  lead.user_agent = (req.headers.get('user-agent') ?? '').slice(0, 500);

  const email = typeof lead.contact_email === 'string' ? lead.contact_email.trim().toLowerCase() : '';
  if (!email) return reply(origin, 400, { error: 'bad_request' });
  lead.contact_email = email;

  // 3. Same person double-submitting? Treat it as already received.
  // Matches on email AND the insured's name, so one family member can still
  // submit for several relatives back to back.
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const q = (v: unknown) => encodeURIComponent(String(v ?? ''));
  const dupe = await rest(
    `leads?select=id&contact_email=eq.${q(email)}&insured_first_name=eq.${q(lead.insured_first_name)}` +
      `&insured_last_name=eq.${q(lead.insured_last_name)}&created_at=gte.${q(since)}&limit=1`,
  )
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => []);
  if (Array.isArray(dupe) && dupe.length > 0) return reply(origin, 200, { ok: true, duplicate: true });

  // 4. Save it.
  const insert = await rest('leads', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(lead) });
  if (!insert.ok) {
    const detail = await insert.text();
    console.error('Insert failed', insert.status, detail);
    // 400s here are the table's own checks (bad email format, out-of-range values).
    return reply(origin, insert.status === 400 ? 400 : 500, { error: insert.status === 400 ? 'invalid_lead' : 'save_failed' });
  }

  return reply(origin, 200, { ok: true });
});
