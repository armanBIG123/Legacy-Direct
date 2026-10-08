import { SUPABASE_URL, SUPABASE_ANON_KEY, leadsConfigured } from './leadConfig';
import { recommendPlan } from './planSuggestion';

// Exact wording shown next to the text-message checkbox. Stored with each
// lead so there's a record of precisely what the person agreed to.
export const TEXT_CONSENT_WORDING =
  'Text me about this request, including automated or prerecorded messages. Consent isn’t required to buy anything. Message and data rates may apply.';

function pad(n) {
  return String(n).padStart(2, '0');
}

// Turns the quiz state into one row for the leads table.
export function buildLeadRow(data) {
  const isMe = data.coverageFor === 'me';
  const rec = recommendPlan(data);
  const dob =
    data.dobYear && data.dobMonth && data.dobDay
      ? `${data.dobYear}-${pad(data.dobMonth)}-${pad(data.dobDay)}`
      : null;
  const clean = (s, max) => (s ? String(s).trim().slice(0, max) : null);

  return {
    coverage_for: data.coverageFor,
    insured_first_name: clean(isMe ? data.applicantFirstName : data.subjectFirstName, 80),
    insured_last_name: clean(isMe ? data.applicantLastName : data.subjectLastName, 80),
    contact_email: clean(isMe ? data.applicantEmail : data.yourEmail, 200),
    contact_mobile: clean(data.mobile, 30),

    goals: data.goals || [],
    trigger_reason: data.trigger,
    dependents: data.dependents || [],
    children_under_18: (data.dependents || []).includes('children') ? data.childrenCount : null,
    mortgage_remaining: data.mortgageTouched ? Number(data.mortgage) || 0 : null,
    state: clean(data.state, 40),
    date_of_birth: dob,
    sex: data.sex,
    height_inches: data.hwTouched ? Number(data.heightFeet) * 12 + Number(data.heightInches) : null,
    weight_lbs: data.hwTouched ? Number(data.weightLbs) : null,
    tobacco: data.tobacco,
    citizenship: data.citizenship,
    monthly_budget: data.budget,
    timing: data.timing,
    matched_plan: rec ? rec.plan.name : null,

    consent_reminder_email: !!data.wantsPreviewReminder,
    consent_updates_email: !!data.wantsEmailUpdates,
    consent_texts: !!data.wantsTexts,
    consent_text_wording: data.wantsTexts ? TEXT_CONSENT_WORDING : null,

    source_url: typeof window !== 'undefined' ? window.location.href.slice(0, 500) : null,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 500) : null,
  };
}

// Sends the lead. Resolves on success; throws an Error with a friendly
// message otherwise. Uses Supabase's REST endpoint directly, so the site
// needs no extra packages.
export async function submitLead(data) {
  // Honeypot: real people never see or fill this field; bots often do.
  if (data.website) return;

  if (!leadsConfigured) {
    throw new Error('Submissions aren’t connected yet. Please call or email us and we’ll take it from here.');
  }

  let res;
  try {
    res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(buildLeadRow(data)),
    });
  } catch {
    throw new Error('We couldn’t reach our server. Check your connection and try again.');
  }

  if (!res.ok) {
    let detail = '';
    try {
      detail = (await res.json()).message || '';
    } catch {}
    if (typeof console !== 'undefined') console.error('Lead submit failed', res.status, detail);
    throw new Error('Something went wrong sending your information. Please try again in a moment.');
  }
}
