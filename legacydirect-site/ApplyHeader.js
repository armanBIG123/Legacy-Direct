import Link from 'next/link';

export default function ApplyHeader() {
  return (
    <header className="apply-header">
      <div className="apply-header-inner">
        <Link href="/" className="apply-logo">
          <span className="apply-logo-word">
            Legacy<b>Direct</b>
          </span>
        </Link>
        <div className="apply-header-badge">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1l5 2v3.5c0 3.2-2.1 5.6-5 6.5-2.9-.9-5-3.3-5-6.5V3l5-2z" stroke="var(--forest)" strokeWidth="1.2" />
            <path d="M4.5 7l1.8 1.8L9.5 5.3" stroke="var(--forest)" strokeWidth="1.2" />
          </svg>
          <div>
            <div className="apply-header-badge-title">Plan preview</div>
            <div className="apply-header-badge-sub">Private and secure</div>
          </div>
        </div>
        <button type="button" className="apply-signin-btn" title="Accounts are coming soon">
          Sign in to save
        </button>
      </div>
    </header>
  );
}
