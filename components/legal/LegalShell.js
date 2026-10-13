import Link from 'next/link';
import ApplyHeader from '../apply/ApplyHeader';
import AgencyLine, { LegalLinks } from './AgencyLine';

// Page frame for the privacy policy, terms and data-use pages.
export default function LegalShell({ eyebrow, title, lede, children }) {
  return (
    <div className="apply-page">
      <ApplyHeader />
      <main className="apply-main">
        <div className="data-use-layout">
          <Link href="/" className="data-use-back">
            ← Back to LegacyDirect
          </Link>
          <div className="apply-eyebrow">{eyebrow}</div>
          <h1 className="data-use-title">{title}</h1>
          {lede && <p className="apply-subtitle">{lede}</p>}
          {children}
        </div>
      </main>
      <footer className="apply-footer">
        <div className="apply-footer-inner apply-footer-legal">
          <AgencyLine />
          <LegalLinks />
        </div>
      </footer>
    </div>
  );
}
