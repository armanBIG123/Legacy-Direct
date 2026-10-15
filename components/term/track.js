// One place to report funnel events. Works with whatever is installed:
//   - Google Tag Manager / GA4 (window.dataLayer, window.gtag)
//   - Meta Pixel (window.fbq)
// If none are installed yet, calls are harmless no-ops. Add your pixel or
// tag to the site later and these events start flowing automatically.
//
// Events:
//   term_view   landing page viewed
//   term_start  picked a coverage need
//   term_step   reached a quiz step       { step }
//   term_call   tapped a Call button       { step }  → Meta "Contact"
//   term_lead   finished the term quiz     { need, coverage } → Meta "Lead", GA "generate_lead"
//   iul_lead    sent the IUL quiz                     → Meta "Lead", GA "generate_lead"
//
// META GETS NO FORM DATA. Only the bare standard events (Lead, Contact) go to
// the Meta Pixel — no coverage need, amounts, steps or anything typed. Meta's
// rules and our Privacy Policy both depend on this. The pixel itself only
// exists after the visitor allows it (components/tracking).

export function trackEvent(name, props = {}) {
  if (typeof window === 'undefined') return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...props });
    if (typeof window.gtag === 'function') {
      window.gtag('event', name === 'term_lead' || name === 'iul_lead' ? 'generate_lead' : name, props);
    }
    if (typeof window.fbq === 'function') {
      if (name === 'term_lead' || name === 'iul_lead') window.fbq('track', 'Lead');
      else if (name === 'term_call') window.fbq('track', 'Contact');
    }
  } catch {}
}
