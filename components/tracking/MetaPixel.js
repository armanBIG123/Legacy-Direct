'use client';

import { useEffect } from 'react';
import { META_PIXEL_ID, CONSENT_EVENT, getConsent } from './consent';

// Meta's standard base code, loaded only after the visitor allows ad
// tracking. Same behavior as the snippet from Events Manager, minus the
// <noscript> image (that fires with no way to ask first).
function loadPixel(id) {
  if (window.fbq) return;
  /* eslint-disable */
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  // No automatic button/metadata scraping: we send only the events we choose
  // (PageView, Lead, Contact) and never form answers.
  window.fbq('set', 'autoConfig', false, id);
  window.fbq('init', id);
  window.fbq('track', 'PageView');
}

// The site moves between some pages without a full reload; count those as
// page views too.
function watchNavigation() {
  if (window.__ldNavWatch) return;
  window.__ldNavWatch = true;
  let last = window.location.pathname;
  const check = () => {
    if (window.location.pathname !== last) {
      last = window.location.pathname;
      if (typeof window.fbq === 'function') window.fbq('track', 'PageView');
    }
  };
  for (const m of ['pushState', 'replaceState']) {
    const orig = window.history[m];
    window.history[m] = function (...args) {
      const r = orig.apply(this, args);
      setTimeout(check, 0);
      return r;
    };
  }
  window.addEventListener('popstate', check);
}

export default function MetaPixel() {
  useEffect(() => {
    if (!META_PIXEL_ID) return;
    const start = () => {
      if (getConsent() === 'granted') {
        loadPixel(META_PIXEL_ID);
        watchNavigation();
      }
    };
    start();
    const onChange = (e) => {
      if (e.detail === 'granted') start();
      else if (e.detail === 'denied' && typeof window.fbq === 'function') {
        // Stop sending for the rest of this visit; nothing loads next time.
        window.fbq('consent', 'revoke');
      }
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);
  return null;
}
