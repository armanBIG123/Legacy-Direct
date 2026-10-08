'use client';

import Link from 'next/link';
import CallButton from './CallButton';

export default function TermHeader({ onCall, homeHref = '/term' }) {
  return (
    <header className="term-header">
      <div className="term-header-inner">
        <Link href={homeHref} className="apply-logo" aria-label="LegacyDirect term coverage home">
          <svg width="26" height="22" viewBox="0 0 30 26" fill="none" aria-hidden="true">
            <path d="M2 21H18" stroke="#241134" strokeWidth="1.4" strokeDasharray="3 3" />
            <circle cx="24" cy="21" r="3.4" fill="#C6A030" />
            <path d="M6 4V16" stroke="#241134" strokeWidth="1.6" />
            <path d="M6 4L14 4" stroke="#241134" strokeWidth="1.6" />
          </svg>
          <span className="apply-logo-word">
            Legacy<b>Direct</b>
          </span>
          <span className="term-header-tag">Term</span>
        </Link>
        <div className="term-header-call">
          <span className="term-header-help">Questions? A licensed agent can help.</span>
          <CallButton onCall={onCall} variant="solid" label="Call now" />
        </div>
      </div>
    </header>
  );
}
