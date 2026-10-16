'use client';

import { AGENT_PHONE_DISPLAY, AGENT_PHONE_TEL } from './termConfig';
import { trackEvent } from './track';

// Every Call button announces the tap with this event. If a term quiz is on
// the page it saves what the visitor has entered (and records the tap);
// otherwise the button records the tap itself. Never blocks the call.
export const CALL_EVENT = 'ld-term-call';

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M5.2 1.8 3.3 2.2c-.7.2-1.2.8-1.1 1.6.5 5 4.9 9.5 10 10 .7.1 1.4-.4 1.6-1.1l.4-1.9c.1-.5-.2-1-.7-1.2l-2-.8c-.4-.2-.9 0-1.2.3l-.8 1c-1.7-.8-3-2.1-3.8-3.8l1-.8c.3-.3.5-.8.3-1.2l-.8-2c-.2-.5-.7-.8-1.2-.7Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

export default function CallButton({ variant = 'solid', label = 'Call for live help', showNumber = true, where = 'page' }) {
  return (
    <a
      href={`tel:${AGENT_PHONE_TEL}`}
      className={`term-call term-call-${variant}`}
      onClick={() => {
        const detail = { where, handled: false };
        try {
          window.dispatchEvent(new CustomEvent(CALL_EVENT, { detail }));
        } catch {}
        if (!detail.handled) trackEvent('term_call', { step: where });
      }}
    >
      <PhoneIcon />
      <span className="term-call-text">
        <span className="term-call-label">{label}</span>
        {showNumber && <span className="term-call-number">{AGENT_PHONE_DISPLAY}</span>}
      </span>
    </a>
  );
}
