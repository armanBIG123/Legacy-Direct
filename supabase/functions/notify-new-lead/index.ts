// notify-new-lead — emails the team whenever a new lead lands.
//
// Triggered by Supabase Database Webhooks:
//   - INSERT on public.leads            (IUL quiz)
//   - INSERT and UPDATE on public.term_leads (term quiz / call button)
//     → emails when a term lead first appears, when it's completed, and
//       when the person taps "Call".
// Sends through Resend (resend.com). Required secrets, set in Supabase →
// Edge Functions → Secrets:
//   RESEND_API_KEY   your Resend API key
//   ALERT_EMAILS     comma-separated recipients, e.g. "a@x.com,b@x.com"
//   FROM_EMAIL       a sender on a domain verified in Resend,
//                    e.g. "LegacyDirect Leads <leads@legacydirectplan.com>"
//   WEBHOOK_SECRET   any long random string; also added as the
//                    x-webhook-secret header on the database webhook

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

function heightText(inches: number | null) {
  return inches ? `${Math.floor(inches / 12)}'${inches % 12}"` : '—';
}


const NEED_LABEL: Record<string, string> = {
  living: 'Living benefits / income replacement',
  temporary: 'Temporary coverage (10× income)',
  mortgage: 'Mortgage protection',
};
const money = (n: unknown) => (n === null || n === undefined || n === '' ? '—' : `$${Number(n).toLocaleString('en-US')}`);

function termEmail(lead: Record<string, any>, reason: string) {
  const name = `${lead.first_name ?? ''} ${lead.last_name ?? ''}`.trim() || 'Name not given yet';
  const rows: [string, string][] = [
    ['Why you got this', reason],
    ['Phone', /^\d{10}$/.test(lead.phone ?? '') ? `(${lead.phone.slice(0, 3)}) ${lead.phone.slice(3, 6)}-${lead.phone.slice(6)}` : lead.phone || '—'],
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
    ['OK to text', lead.consent_texts ? 'Yes (consent recorded)' : 'No'],
    ['Ad source', [lead.utm_source, lead.utm_campaign].filter(Boolean).join(' / ') || (lead.gclid ? 'Google Ads' : lead.fbclid ? 'Facebook/Instagram' : 'Direct / unknown')],
  ];
  const tag = reason.includes('Call') ? 'CALLING NOW' : 'Completed form';
  return {
    subject: `Term lead (${tag}): ${name} · ${NEED_LABEL[lead.coverage_need] ?? 'Term'}`,
    reply_to: lead.email || undefined,
    html: `
    <div style="font-family:Arial,sans-serif;max-width:560px;color:#23172E">
      <h2 style="margin:0 0 4px">Term lead: ${esc(name)}</h2>
      <p style="margin:0 0 16px;color:#665A70">${esc(new Date(lead.updated_at ?? lead.created_at).toLocaleString('en-US', { timeZone: 'America/Chicago' }))} CT</p>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        ${rows.map(([k, v]) => `<tr><td style="padding:7px 10px;border-bottom:1px solid #eee;color:#665A70;width:40%">${esc(k)}</td><td style="padding:7px 10px;border-bottom:1px solid #eee;font-weight:600">${esc(v)}</td></tr>`).join('')}
      </table>
      <p style="font-size:12px;color:#665A70;margin-top:16px">Lead ID ${esc(lead.id)}. Contains personal information — don't forward outside the team.</p>
    </div>`,
  };
}

// Decide whether a term_leads change deserves an email, and why.
function termReason(type: string, rec: Record<string, any>, old: Record<string, any> | null): string | null {
  if (type === 'INSERT') return rec.call_clicked_at ? 'Tapped Call for live help' : rec.completed ? 'Completed the term quiz' : null;
  if (type === 'UPDATE' && old) {
    if (rec.call_clicked_at && !old.call_clicked_at) return 'Tapped Call for live help';
    if (rec.completed && !old.completed) return 'Completed the term quiz';
  }
  return null;
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

  if (payload?.table === 'term_leads') {
    const reason = termReason(payload.type, lead, payload.old_record ?? null);
    if (!reason) return new Response('no email needed', { status: 200 });
    const msg = termEmail(lead, reason);
    const r = await sendEmail(msg.subject, msg.html, msg.reply_to);
    if (!r.ok) {
      console.error('Resend error', r.status, await r.text());
      return new Response('email failed', { status: 502 });
    }
    return new Response('sent', { status: 200 });
  }

  if (payload?.type !== 'INSERT') return new Response('ignored', { status: 200 });

  const name = `${lead.insured_first_name ?? ''} ${lead.insured_last_name ?? ''}`.trim();
  const rows: [string, string][] = [
    ['Matched plan', lead.matched_plan ?? '—'],
    ['Coverage for', lead.coverage_for === 'me' ? 'Themselves' : 'Someone else (filled out by family/friend)'],
    ['Email', lead.contact_email],
    ['Mobile', lead.contact_mobile || '—'],
    ['Timing', label('timing', lead.timing)],
    ['Budget', label('monthly_budget', lead.monthly_budget)],
    ['Goals', label('goals', lead.goals)],
    ['What prompted it', label('trigger_reason', lead.trigger_reason)],
    ['Dependents', label('dependents', lead.dependents)],
    ['Children under 18', lead.children_under_18 ?? '—'],
    ['Mortgage left', lead.mortgage_remaining != null ? `$${Number(lead.mortgage_remaining).toLocaleString('en-US')}` : '—'],
    ['State', lead.state || '—'],
    ['Date of birth', lead.date_of_birth || '—'],
    ['Sex', lead.sex || '—'],
    ['Height / weight', `${heightText(lead.height_inches)} / ${lead.weight_lbs ? lead.weight_lbs + ' lb' : '—'}`],
    ['Tobacco', label('tobacco', lead.tobacco)],
    ['Residency', label('citizenship', lead.citizenship)],
    ['OK to text', lead.consent_texts ? 'Yes (consent recorded)' : 'No'],
    ['OK to email updates', lead.consent_updates_email ? 'Yes' : 'No'],
  ];

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;color:#23172E">
      <h2 style="margin:0 0 4px">New LegacyDirect lead: ${esc(name)}</h2>
      <p style="margin:0 0 16px;color:#665A70">${esc(new Date(lead.created_at).toLocaleString('en-US', { timeZone: 'America/Chicago' }))} CT</p>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:7px 10px;border-bottom:1px solid #eee;color:#665A70;width:40%">${esc(k)}</td><td style="padding:7px 10px;border-bottom:1px solid #eee;font-weight:600">${esc(v)}</td></tr>`,
          )
          .join('')}
      </table>
      <p style="font-size:12px;color:#665A70;margin-top:16px">Lead ID ${esc(lead.id)}. Contains personal information — don't forward outside the team.</p>
    </div>`;

  const to = (Deno.env.get('ALERT_EMAILS') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: Deno.env.get('FROM_EMAIL'),
      to,
      reply_to: lead.contact_email,
      subject: `New lead: ${name} · ${lead.matched_plan ?? 'LegacyDirect'} · ${label('timing', lead.timing)}`,
      html,
    }),
  });

  if (!res.ok) {
    console.error('Resend error', res.status, await res.text());
    return new Response('email failed', { status: 502 });
  }
  return new Response('sent', { status: 200 });
});
