'use client';

import { OPEN_CHOICES_EVENT } from './consent';

// Footer link that reopens the ad-tracking banner so a visitor can change
// their mind at any time.
export default function AdChoicesLink({ label = 'Ad tracking choices' }) {
  return (
    <button
      type="button"
      className="ld-adchoices-link"
      onClick={() => window.dispatchEvent(new Event(OPEN_CHOICES_EVENT))}
      style={{ background: 'none', border: 0, padding: 0, font: 'inherit', color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
    >
      {label}
    </button>
  );
}
