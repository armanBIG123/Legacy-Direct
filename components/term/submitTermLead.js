import { SUBMIT_URL, leadsConfigured } from '../apply/leadConfig';
import { TEXT_CONSENT_WORDING } from '../apply/submitLead';
import { suggestedCoverage } from './termConfig';

function pad(n) {
  return String(n).padStart(2, '0');
}

const clean = (s, max) => {
  const v = s == null ? '' : String(s).trim();
  return v ? v.slice(0, max) : null;
};

// One row for public.term_leads, built from whatever has been answered so far.
export function buildTermRow(data, extra = {}) {
  const dob =
    data.dobYear && data.dobMonth && data.dobDay && String(data.dobYear).length === 4
      ? `${data.dobYear}-${pad(data.dobMonth)}-${pad(data.dobDay)}`
      : null;
  return {
    completed: !!data.completed,
    call_clicked_at: data.callClickedAt || null,
    last_step: clean(data.lastStep, 40),
    coverage_need: data.need || null,
    annual_income: data.need && data.need !== 'mortgage' && data.incomeTouched ? Number(data.income) || 0 : null,
    mortgage_balance: data.need === 'mortgage' && data.mortgageTouched ? Number(data.mortgage) || 0 : null,
    suggested_coverage: suggestedCoverage(data),
    first_name: clean(data.firstName, 80),
    last_name: clean(data.lastName, 80),
    date_of_birth: dob,
    zip: /^\d{5}$/.test(data.zip || '') ? data.zip : null,
    tobacco_last_2_years: data.tobacco === 'yes' ? true : data.tobacco === 'no' ? false : null,
    email: data.email && data.email.includes('@') ? clean(data.email, 200) : null,
    phone: clean(data.phone, 30),
    consent_texts: !!data.wantsTexts,
    consent_text_wording: data.wantsTexts ? TEXT_CONSENT_WORDING : null,
    source_url: typeof window !== 'undefined' ? window.location.href.slice(0, 500) : null,
    ...extra,
  };
}

// True once the visitor has told us anything worth calling back about.
export function hasAnyAnswer(data) {
  return !!(data.need || data.firstName || data.email || data.phone || data.zip || data.dobYear);
}

function payload(sessionId, token, data, extra) {
  return JSON.stringify({ kind: 'term', session_id: sessionId, token, lead: buildTermRow(data, extra) });
}

// Fire-and-forget save used when someone taps Call. Sent as a "simple"
// request with keepalive so it still goes out while the phone app opens.
export function sendCallCapture(sessionId, token, data) {
  if (!leadsConfigured || !token || data.website) return;
  try {
    fetch(SUBMIT_URL, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: payload(sessionId, token, data),
    }).catch(() => {});
  } catch {}
}

// Full submit at the end of the form. Throws a friendly Error on failure.
export async function submitTermLead(sessionId, token, data) {
  if (data.website) return;
  if (!leadsConfigured) throw new Error('Submissions aren’t connected yet. Please call us instead.');
  if (!token) throw new Error('Still running a quick security check — give it a second and try again.');

  let res;
  try {
    res = await fetch(SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: payload(sessionId, token, data, { completed: true, last_step: 'done' }),
    });
  } catch {
    throw new Error('We couldn’t reach our server. Check your connection and try again.');
  }
  if (res.ok) return;
  let code = '';
  try {
    code = (await res.json()).error || '';
  } catch {}
  if (typeof console !== 'undefined') console.error('Term submit failed', res.status, code);
  if (code === 'verification_failed') throw new Error('Our security check didn’t go through. Please try again.');
  if (code === 'invalid_lead') throw new Error('Something didn’t look right — check your email, ZIP and birth date.');
  throw new Error('Something went wrong sending your information. Please try again, or call us.');
}
