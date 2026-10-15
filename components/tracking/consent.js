// Ad-tracking consent, shared by the banner, the pixel and the footer link.
//
// The Meta Pixel only loads after a visitor taps "Allow". A Global Privacy
// Control signal (navigator.globalPrivacyControl) counts as "No" and is never
// overridden. The choice is remembered in this browser only.

// Meta Pixel ID from Events Manager. Public by design (it's visible in any
// site's page source), so it's fine in code. Set to '' to turn the pixel off.
export const META_PIXEL_ID = '4547583868850605';

const KEY = 'ld_ad_consent'; // 'granted' | 'denied'
export const CONSENT_EVENT = 'ld-consent-change';
export const OPEN_CHOICES_EVENT = 'ld-open-ad-choices';

export function gpcOn() {
  try {
    return typeof navigator !== 'undefined' && navigator.globalPrivacyControl === true;
  } catch {
    return false;
  }
}

export function getConsent() {
  if (typeof window === 'undefined') return null;
  if (gpcOn()) return 'denied';
  try {
    const v = window.localStorage.getItem(KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value) {
  try {
    window.localStorage.setItem(KEY, value);
  } catch {}
  try {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  } catch {}
}
