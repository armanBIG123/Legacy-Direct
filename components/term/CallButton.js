'use client';

import { AGENT_PHONE_DISPLAY, AGENT_PHONE_TEL } from './termConfig';

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

// A real tel: link (works on every phone). onCall runs first so the flow can
// save whatever the visitor has entered — it never blocks the call.
export default function CallButton({ onCall, variant = 'solid', label = 'Call for live help', showNumber = true }) {
  return (
    <a
      href={`tel:${AGENT_PHONE_TEL}`}
      className={`term-call term-call-${variant}`}
      onClick={() => {
        if (onCall) onCall();
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
