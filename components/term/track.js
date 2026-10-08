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
//   term_lead   finished the form          { need, coverage } → Meta "Lead", GA "generate_lead"

export function trackEvent(name, props = {}) {
  if (typeof window === 'undefined') return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...props });
    if (typeof window.gtag === 'function') {
      window.gtag('event', name === 'term_lead' ? 'generate_lead' : name, props);
    }
    if (typeof window.fbq === 'function') {
      if (name === 'term_lead') window.fbq('track', 'Lead', props);
      else if (name === 'term_call') window.fbq('track', 'Contact', props);
      else window.fbq('trackCustom', name, props);
    }
  } catch {}
}
