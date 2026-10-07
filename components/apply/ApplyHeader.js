import Link from 'next/link';

// Focused header for the quiz: brand, a privacy reassurance, and a clear
// way back to the main site. No marketing nav to pull people out mid-flow.
export default function ApplyHeader() {
  return (
    <header className="apply-header">
      <div className="apply-header-inner">
        <Link href="/" className="apply-logo" aria-label="LegacyDirect home">
          <svg width="26" height="22" viewBox="0 0 30 26" fill="none" aria-hidden="true">
            <path d="M2 21H18" stroke="#241134" strokeWidth="1.4" strokeDasharray="3 3" />
            <circle cx="24" cy="21" r="3.4" fill="#C6A030" />
            <path d="M6 4V16" stroke="#241134" strokeWidth="1.6" />
            <path d="M6 4L14 4" stroke="#241134" strokeWidth="1.6" />
          </svg>
          <span className="apply-logo-word">
            Legacy<b>Direct</b>
          </span>
        </Link>

        <div className="apply-header-badge">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1l5 2v3.5c0 3.2-2.1 5.6-5 6.5-2.9-.9-5-3.3-5-6.5V3l5-2z" stroke="currentColor" strokeWidth="1.2" />
            <path d="M4.5 7l1.8 1.8L9.5 5.3" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <span>Private &amp; secure · No SSN needed</span>
        </div>

        <Link href="/" className="apply-exit">
          Exit
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
