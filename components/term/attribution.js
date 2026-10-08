// Remembers where a visitor came from (ad, campaign, click IDs) for the whole
// visit, so the lead row shows which ad produced it — even after they move
// from the landing page into the quiz.

const KEY = 'ld_attribution';
const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];

function read() {
  try {
    return JSON.parse(window.sessionStorage.getItem(KEY) || 'null');
  } catch {
    return null;
  }
}

// Call on every term page load. First touch wins: once captured, later page
// views in the same visit don't overwrite it.
export function captureAttribution() {
  if (typeof window === 'undefined') return;
  if (read()) return;
  const q = new URLSearchParams(window.location.search);
  const a = {};
  for (const p of PARAMS) {
    const v = q.get(p);
    if (v) a[p] = v.slice(0, 200);
  }
  a.landing_page = (window.location.pathname + window.location.search).slice(0, 500);
  a.referrer = (document.referrer || '').slice(0, 500) || null;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(a));
  } catch {}
}

export function getAttribution() {
  if (typeof window === 'undefined') return {};
  const a = read() || {};
  const out = {};
  for (const p of [...PARAMS, 'landing_page', 'referrer']) out[p] = a[p] || null;
  return out;
}
