import { SUBMIT_URL, leadsConfigured } from '../apply/leadConfig';
import { TEXT_CONSENT_WORDING } from '../apply/submitLead';
import { suggestedCoverage } from './termConfig';
import { getAttribution } from './attribution';

const clean = (s, max) => {
  const v = s == null ? '' : String(s).trim();
  return v ? v.slice(0, max) : null;
};

// "01/13/1987" → "1987-01-13" if it's a real date, else null.
export function parseDob(text) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text || '');
  if (!m) return null;
  const [, mm, dd, yyyy] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (d.getFullYear() !== Number(yyyy) || d.getMonth() !== Number(mm) - 1 || d.getDate() !== Number(dd)) return null;
  return `${yyyy}-${mm}-${dd}`;
}

export function ageFrom(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const now = new Date();
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age -= 1;
  return age;
}

export const phoneDigits = (p) => (p || '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');

// One row for public.term_leads, built from whatever has been answered so far.
export function buildTermRow(data, extra = {}) {
  const digits = phoneDigits(data.phone);
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
    date_of_birth: parseDob(data.dob),
    zip: /^\d{5}$/.test(data.zip || '') ? data.zip : null,
    tobacco_last_2_years: data.tobacco === 'yes' ? true : data.tobacco === 'no' ? false : null,
    email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((data.email || '').trim()) ? clean(data.email, 200) : null,
    phone: digits.length >= 10 ? digits.slice(0, 15) : null,
    consent_texts: !!data.wantsTexts && digits.length >= 10,
    consent_text_wording: data.wantsTexts && digits.length >= 10 ? TEXT_CONSENT_WORDING : null,
    source_url: typeof window !== 'undefined' ? window.location.href.slice(0, 500) : null,
    ...getAttribution(),
    ...extra,
  };
}

// True once the visitor has told us anything worth following up on.
export function hasAnyAnswer(data) {
  return !!(data.need || data.firstName || data.email || data.phone || data.zip || data.dob);
}

// True once we could actually reach them.
export function hasContact(data) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((data.email || '').trim()) || phoneDigits(data.phone).length >= 10;
}

function body(sessionId, token, data, extra) {
  return JSON.stringify({ kind: 'term', session_id: sessionId, token, lead: buildTermRow(data, extra) });
}

// Background save (Call taps, partial leads, leaving the page). Sent as a
// "simple" keepalive request so it still goes out while the dialer opens or
// the tab closes. Never throws.
export function sendSnapshot(sessionId, token, data, extra) {
  if (!leadsConfigured || !token || data.website) return false;
  try {
    fetch(SUBMIT_URL, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: body(sessionId, token, data, extra),
    }).catch(() => {});
    return true;
  } catch {
    return false;
  }
}

// Final submit. Throws a friendly Error on failure.
export async function submitTermLead(sessionId, token, data) {
  if (data.website) return;
  if (!leadsConfigured) throw new Error('Submissions aren’t connected yet. Please call us instead.');
  if (!token) throw new Error('Still running a quick security check — give it a second and try again.');

  let res;
  try {
    res = await fetch(SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: body(sessionId, token, data, { completed: true, last_step: 'done' }),
    });
  } catch {
    throw new Error('We couldn’t reach our server. Check your connection and try again — or call us.');
  }
  if (res.ok) return;
  let code = '';
  try {
    code = (await res.json()).error || '';
  } catch {}
  if (typeof console !== 'undefined') console.error('Term submit failed', res.status, code);
  if (code === 'verification_failed') throw new Error('Our security check didn’t go through. Please tap the button again.');
  if (code === 'invalid_lead') throw new Error('Something didn’t look right — check your email, phone, ZIP and birth date.');
  throw new Error('Something went wrong sending your information. Please try again, or call us.');
}
