// notify-new-lead — emails the team whenever a new lead lands.
//
// Triggered by Supabase Database Webhooks:
//   - INSERT on public.leads            (IUL quiz)
//   - INSERT and UPDATE on public.term_leads (term quiz / call button)
//     → emails when a term lead first appears, when it's completed, when
//       the person taps "Call", and when they leave mid-form.
//
// Every email carries compliance checks so agents don't have to remember:
//   - DO NOT CONTACT banner if the person is on the internal do-not-contact
//     list (public.do_not_contact) or their lead is flagged.
//   - Licensed-state check against the LICENSED_STATES secret.
//   - Whether automated calls/texts are allowed (consent box) or manual only.
//   - Whether a National DNC scrub is needed before calling.
//   - Calling-hours and attempt limits that satisfy the strictest states.
//
// Secrets (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY   your Resend API key
//   ALERT_EMAILS     comma-separated recipients, e.g. "a@x.com,b@x.com"
//   FROM_EMAIL       a sender on a domain verified in Resend
//   WEBHOOK_SECRET   also sent as the x-webhook-secret header by the webhooks
//   LICENSED_STATES  optional, e.g. "AR,TX,NV" — states where your agents
//                    hold a life license. Leads elsewhere get a warning.
// Provided automatically: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

const LABELS: Record<string, Record<string, string>> = {
  goals: { legacy: 'Leave a legacy', retirement: 'Grow money for retirement', living: 'Living benefits', unsure: 'Not sure yet' },
  trigger_reason: {
    married: 'Getting married', child: 'Having a child', home: 'Buying a home', retirement: 'Planning for retirement',
    job: 'Leaving work coverage', health: 'A health scare', loss: 'Death of a loved one', proactive: 'Just being proactive',
  },
  dependents: { spouse: 'Spouse/partner', children: 'Children', parent: 'Parent', other: 'Someone else', none: 'No one' },
  tobacco: { never: 'None in 2+ years', quit: 'Quit 1–2 years ago', current: 'Within last 12 months' },
  citizenship: { citizen: 'U.S. citizen', resident: 'Permanent resident', other: 'Other' },
  monthly_budget: { under100: 'Under $100/mo', '100-250': '$100–$250/mo', '250-500': '$250–$500/mo', '500+': '$500+/mo', unsure: 'Not sure' },
  timing: { today: 'Ready today', week: 'Within a week', months: 'In a few months', unsure: 'Not sure' },
};

const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function label(field: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  const map = LABELS[field];
  if (Array.isArray(value)) return value.length ? value.map((v) => map?.[v] ?? v).join(', ') : '—';
  return map?.[String(value)] ?? String(value);
}

const heightText = (inches: number | null) => (inches ? `${Math.floor(inches / 12)}'${inches % 12}"` : '—');
const money = (n: unknown) => (n === null || n === undefined || n === '' ? '—' : `$${Number(n).toLocaleString('en-US')}`);
const digits = (p: unknown) => String(p ?? '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
const phoneText = (p: unknown) => {
  const d = digits(p);
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : String(p || '—');
};

const NEED_LABEL: Record<string, string> = {
  living: 'Living benefits / income protection',
  temporary: 'Temporary coverage (10× income)',
  mortgage: 'Mortgage protection',
};

// ---------- State lookups for the licensing check ----------
const STATE_CODES: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA', Colorado: 'CO', Connecticut: 'CT',
  Delaware: 'DE', 'District of Columbia': 'DC', Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL',
  Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA',
  Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND',
  Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT', Virginia: 'VA', Washington: 'WA',
  'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY',
};

// First three ZIP digits → state (USPS prefix ranges). Mirrors components/apply/zipState.js.
const ZIP3: [number, number, string][] = [
  [5, 5, 'NY'], [10, 27, 'MA'], [28, 29, 'RI'], [30, 38, 'NH'], [39, 49, 'ME'], [50, 54, 'VT'], [55, 55, 'MA'],
  [56, 59, 'VT'], [60, 69, 'CT'], [70, 89, 'NJ'], [100, 149, 'NY'], [150, 196, 'PA'], [197, 199, 'DE'],
  [200, 200, 'DC'], [201, 201, 'VA'], [202, 205, 'DC'], [206, 219, 'MD'], [220, 246, 'VA'], [247, 268, 'WV'],
  [270, 289, 'NC'], [290, 299, 'SC'], [300, 319, 'GA'], [320, 339, 'FL'], [341, 349, 'FL'], [350, 369, 'AL'],
  [370, 385, 'TN'], [386, 397, 'MS'], [398, 399, 'GA'], [400, 427, 'KY'], [430, 459, 'OH'], [460, 479, 'IN'],
  [480, 499, 'MI'], [500, 528, 'IA'], [530, 549, 'WI'], [550, 567, 'MN'], [569, 569, 'DC'], [570, 577, 'SD'],
  [580, 588, 'ND'], [590, 599, 'MT'], [600, 629, 'IL'], [630, 658, 'MO'], [660, 679, 'KS'], [680, 693, 'NE'],
  [700, 714, 'LA'], [716, 729, 'AR'], [730, 732, 'OK'], [733, 733, 'TX'], [734, 749, 'OK'], [750, 799, 'TX'],
  [800, 816, 'CO'], [820, 831, 'WY'], [832, 838, 'ID'], [840, 847, 'UT'], [850, 865, 'AZ'], [870, 884, 'NM'],
  [885, 885, 'TX'], [889, 898, 'NV'], [900, 961, 'CA'], [967, 968, 'HI'], [970, 979, 'OR'], [980, 994, 'WA'],
  [995, 999, 'AK'],
];
function stateFromZip(zip: unknown): string | null {
  if (!/^\d{5}$/.test(String(zip ?? ''))) return null;
  const p = Number(String(zip).slice(0, 3));
  return ZIP3.find(([lo, hi]) => p >= lo && p <= hi)?.[2] ?? null;
}

function licenseCheck(state: string | null): string {
  const list = (Deno.env.get('LICENSED_STATES') ?? '').split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
  if (!state) return 'State unknown — confirm where they live before discussing coverage';
  if (!list.length) return `${state} — licensing check not set up (add LICENSED_STATES secret)`;
  return list.includes(state)
    ? `${state} — licensed ✓`
    : `⚠ ${state} — NOT on your licensed-states list. Don't discuss or sell coverage unless an agent licensed in ${state} handles it.`;
}

// ---------- Internal do-not-contact list ----------
async function onDncList(phone: unknown, email: unknown): Promise<boolean> {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return false;
  const checks: string[] = [];
  const p = digits(phone);
  if (p.length === 10) checks.push(`phone=eq.${p}`);
  const e = String(email ?? '').trim().toLowerCase();
  if (e) checks.push(`email=eq.${encodeURIComponent(e)}`);
  for (const q of checks) {
    try {
      const r = await fetch(`${url}/rest/v1/do_not_contact?select=id&${q}&limit=1`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
      if (r.ok && (await r.json()).length) return true;
    } catch (err) {
      console.error('DNC lookup failed', err);
    }
  }
  return false;
}

// Same for every alert: the rules that keep calls legal in every state.
const AGENT_RULES =
  'Call or text only 9 a.m.–8 p.m. Mon–Sat in the lead’s time zone (no Sundays or holidays; Rhode Island: weekdays 9–6, Saturday 9–5). ' +
  'Max 3 attempts per 24 hours. If they ask you to stop — any wording, any channel — stop and tick do_not_contact on this lead within 10 business days (same day is best). ' +
  'Tell them at the start if a call is recorded. Only discuss coverage in states where you’re licensed.';

type Row = [string, string];

function render(opts: {
  title: string;
  when: string;
  banner: string | null;
  checks: Row[];
  rows: Row[];
  footer: string;
}) {
  const tr = ([k, v]: Row, strong = true) =>
    `<tr><td style="padding:7px 10px;border-bottom:1px solid #eee;color:#665A70;width:40%">${esc(k)}</td><td style="padding:7px 10px;border-bottom:1px solid #eee;${strong ? 'font-weight:600' : ''}">${esc(v)}</td></tr>`;
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;color:#23172E">
      ${opts.banner ? `<div style="background:#B42318;color:#fff;padding:12px 14px;border-radius:8px;font-weight:700;margin-bottom:14px">${esc(opts.banner)}</div>` : ''}
      <h2 style="margin:0 0 4px">${esc(opts.title)}</h2>
      <p style="margin:0 0 16px;color:#665A70">${esc(opts.when)} CT</p>
      <table style="border-collapse:collapse;width:100%;font-size:14px;margin-bottom:14px;background:#FBF6EA">
        ${opts.checks.map((r) => tr(r)).join('')}
      </table>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        ${opts.rows.map((r) => tr(r)).join('')}
      </table>
      <p style="font-size:12px;color:#665A70;margin-top:16px"><strong>Agent rules:</strong> ${esc(AGENT_RULES)}</p>
      <p style="font-size:12px;color:#665A70">${esc(opts.footer)} Contains personal information — don't forward outside the team.</p>
    </div>`;
}

const ctTime = (t: unknown) => new Date(String(t ?? Date.now())).toLocaleString('en-US', { timeZone: 'America/Chicago' });

// ---------- Term ----------
function termReason(type: string, rec: Record<string, any>, old: Record<string, any> | null): string | null {
  if (type === 'INSERT') return rec.call_clicked_at ? 'Tapped Call for live help' : rec.completed ? 'Completed the term quiz' : null;
  if (type === 'UPDATE' && old) {
    if (rec.call_clicked_at && !old.call_clicked_at) return 'Tapped Call for live help';
    if (rec.completed && !old.completed) return 'Completed the term quiz';
    if (rec.abandoned_alerted_at && !old.abandoned_alerted_at) return 'Left the form after giving contact info — follow up';
  }
  return null;
}

async function termEmail(lead: Record<string, any>, reason: string) {
  const name = `${lead.first_name ?? ''} ${lead.last_name ?? ''}`.trim() || 'Name not given yet';
  const dnc = lead.do_not_contact || (await onDncList(lead.phone, lead.email));
  const calling = reason.includes('Call');
  const consent = !!lead.consent_texts;
  const outreach = dnc
    ? calling
      ? 'They’re calling you, so take the call — but don’t call, text or email them afterward unless they clearly ask you to on the call.'
      : 'Do not call, text or email.'
    : calling
      ? 'They’re calling you. Follow-up calls are fine about this request.'
      : lead.completed
        ? consent
          ? 'Calls and texts OK, including automated.'
          : 'Manual calls and texts only (no autodialer or prerecorded). They asked for help, so under the federal inquiry rule the National DNC list doesn’t block calls about this request for 3 months — check your state’s rules too.'
        : 'They didn’t submit. Manual calls only, and scrub the number against the National DNC Registry first. If it’s listed, email instead.';

  const checks: Row[] = [
    ['Outreach', outreach],
    ['Licensing', licenseCheck(stateFromZip(lead.zip))],
    [
      'Automated calls/texts',
      !consent
        ? 'NOT allowed — manual dial only'
        : lead.completed
          ? `Allowed — box checked ${lead.consent_recorded_at ?? ''}`
          : 'Box checked but form not submitted — manual dial only unless counsel approves',
    ],
  ];
  const rows: Row[] = [
    ['Why you got this', reason],
    ['Coverage for', lead.coverage_for === 'someone-else' ? 'Someone else — phone/email belong to the person who filled it out' : lead.coverage_for === 'me' ? 'Themselves' : '—'],
    ['Phone', phoneText(lead.phone)],
    ['Email', lead.email || '—'],
    ['Coverage need', NEED_LABEL[lead.coverage_need] ?? '—'],
    ['Annual income', money(lead.annual_income)],
    ['Mortgage balance', money(lead.mortgage_balance)],
    ['Starting coverage', money(lead.suggested_coverage)],
    ['Tobacco (last 2 yrs)', lead.tobacco_last_2_years === true ? 'Yes' : lead.tobacco_last_2_years === false ? 'No' : '—'],
    ['Date of birth', lead.date_of_birth || '—'],
    ['ZIP', lead.zip || '—'],
    ['Form completed', lead.completed ? 'Yes' : `No — stopped at "${lead.last_step ?? 'start'}"`],
    ['Tapped Call', lead.call_clicked_at ? 'Yes' : 'No'],
    ['Ad source', [lead.utm_source, lead.utm_campaign].filter(Boolean).join(' / ') || (lead.gclid ? 'Google Ads' : lead.fbclid ? 'Facebook/Instagram' : 'Direct / unknown')],
  ];
  const tag = calling ? 'CALLING NOW' : reason.startsWith('Left') ? 'LEFT MID-FORM' : 'Completed form';
  return {
    subject: `${dnc ? '[DO NOT CONTACT] ' : ''}Term lead (${tag}): ${name} · ${NEED_LABEL[lead.coverage_need] ?? 'Term'}`,
    reply_to: dnc ? undefined : lead.email || undefined,
    html: render({
      title: `Term lead: ${name}`,
      when: ctTime(lead.updated_at ?? lead.created_at),
      banner: dnc ? 'DO NOT CONTACT — this person is on your do-not-contact list.' : null,
      checks,
      rows,
      footer: `Lead ID ${lead.id} · disclosures ${lead.disclosure_version ?? '—'} · IP ${lead.ip_address ?? '—'}.`,
    }),
  };
}

// ---------- IUL ----------
async function iulEmail(lead: Record<string, any>) {
  const name = `${lead.insured_first_name ?? ''} ${lead.insured_last_name ?? ''}`.trim();
  const dnc = lead.do_not_contact || (await onDncList(lead.contact_mobile, lead.contact_email));
  const consent = !!lead.consent_texts;
  const state = STATE_CODES[lead.state] ?? stateFromZip(lead.zip);
  const checks: Row[] = [
    ['Outreach', dnc ? 'Do not call, text or email.' : consent ? 'Calls and texts OK, including automated.' : 'Manual calls and texts only (no autodialer or prerecorded). They asked for help, so under the federal inquiry rule the National DNC list doesn’t block calls about this request for 3 months — check your state’s rules too.'],
    ['Licensing', licenseCheck(state)],
    ['Automated calls/texts', consent ? `Allowed — box checked ${lead.consent_recorded_at ?? ''}` : 'NOT allowed — manual dial only'],
  ];
  const rows: Row[] = [
    ['Starting design', lead.matched_plan ?? '—'],
    ['Coverage for', lead.coverage_for === 'me' ? 'Themselves' : 'Someone else — email/mobile belong to the person who filled it out'],
    ['Email', lead.contact_email],
    ['Mobile', lead.contact_mobile ? phoneText(lead.contact_mobile) : '—'],
    ['Timing', label('timing', lead.timing)],
    ['Budget', label('monthly_budget', lead.monthly_budget)],
    ['Goals', label('goals', lead.goals)],
    ['What prompted it', label('trigger_reason', lead.trigger_reason)],
    ['Dependents', label('dependents', lead.dependents)],
    ['Children under 18', lead.children_under_18 ?? '—'],
    ['Mortgage left', lead.mortgage_remaining != null ? money(lead.mortgage_remaining) : '—'],
    ['State', lead.state || '—'],
    ['ZIP', lead.zip || '—'],
    ['Date of birth', lead.date_of_birth || '—'],
    ['Sex', lead.sex || '—'],
    ['Height / weight', `${heightText(lead.height_inches)} / ${lead.weight_lbs ? lead.weight_lbs + ' lb' : '—'}`],
    ['Tobacco', label('tobacco', lead.tobacco)],
    ['Residency', label('citizenship', lead.citizenship)],
    ['OK to email updates', lead.consent_updates_email ? 'Yes' : 'No'],
  ];
  return {
    subject: `${dnc ? '[DO NOT CONTACT] ' : ''}New lead: ${name} · ${lead.matched_plan ?? 'LegacyDirect'} · ${label('timing', lead.timing)}`,
    reply_to: dnc ? undefined : lead.contact_email,
    html: render({
      title: `New LegacyDirect lead: ${name}`,
      when: ctTime(lead.created_at),
      banner: dnc ? 'DO NOT CONTACT — this person is on your do-not-contact list.' : null,
      checks,
      rows,
      footer: `Lead ID ${lead.id} · disclosures ${lead.disclosure_version ?? '—'} · IP ${lead.ip_address ?? '—'}.`,
    }),
  };
}

async function sendEmail(subject: string, html: string, replyTo?: string) {
  const to = (Deno.env.get('ALERT_EMAILS') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: Deno.env.get('FROM_EMAIL'), to, reply_to: replyTo, subject, html }),
  });
}

Deno.serve(async (req) => {
  const secret = Deno.env.get('WEBHOOK_SECRET');
  if (!secret || req.headers.get('x-webhook-secret') !== secret) {
    return new Response('unauthorized', { status: 401 });
  }

  const payload = await req.json().catch(() => null);
  const lead = payload?.record;
  if (!lead) return new Response('ignored', { status: 200 });

  let msg: { subject: string; html: string; reply_to?: string } | null = null;
  if (payload?.table === 'term_leads') {
    const reason = termReason(payload.type, lead, payload.old_record ?? null);
    if (!reason) return new Response('no email needed', { status: 200 });
    msg = await termEmail(lead, reason);
  } else {
    if (payload?.type !== 'INSERT') return new Response('ignored', { status: 200 });
    msg = await iulEmail(lead);
  }

  const r = await sendEmail(msg.subject, msg.html, msg.reply_to);
  if (!r.ok) {
    console.error('Resend error', r.status, await r.text());
    return new Response('email failed', { status: 502 });
  }
  return new Response('sent', { status: 200 });
});
