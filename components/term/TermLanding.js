'use client';

import Link from 'next/link';
import TermHeader from './TermHeader';
import CallButton from './CallButton';
import { NEEDS, INCOME_MULTIPLE } from './termConfig';

const ICONS = {
  living: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M14 24s-9-5.4-9-11.7A5 5 0 0 1 14 9.6a5 5 0 0 1 9 2.7C23 18.6 14 24 14 24z" />
      <path d="M8.5 14h3.5l1.5-3 2 5.5 1.5-2.5h2.5" />
    </svg>
  ),
  temporary: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="9" cy="9" r="3.5" />
      <path d="M3 22c0-4 2.7-6.5 6-6.5s6 2.5 6 6.5" />
      <circle cx="19.5" cy="11" r="2.8" />
      <path d="M16 22c.3-3.2 1.8-5 4-5s3.6 1.7 4 5" />
    </svg>
  ),
  mortgage: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 13 14 5l10 8" />
      <path d="M7 11v12h14V11" />
      <path d="M12 23v-6h4v6" />
    </svg>
  ),
};

const STEPS = [
  { n: '1', t: 'Answer 7 quick questions', b: 'About two minutes. No medical exam to get started and no Social Security number.' },
  { n: '2', t: 'See your starting coverage', b: `Sized to your income (${INCOME_MULTIPLE}×) or your mortgage — whichever you're protecting.` },
  { n: '3', t: 'Talk to a licensed agent', b: 'They find your price and walk you through applying. Call any time if you’d rather start there.' },
];

export default function TermLanding() {
  return (
    <div className="term-page">
      <TermHeader />

      <section className="term-hero">
        <div className="term-hero-inner">
          <div className="eyebrow on-ink">Term life coverage</div>
          <h1>
            Protect your paycheck, your family and your home — <em>without overpaying.</em>
          </h1>
          <p className="term-hero-lede">
            Simple, affordable coverage for the years that matter most. Answer a few questions to see
            your starting coverage, or call and talk to a licensed agent right now.
          </p>
          <div className="term-hero-ctas">
            <Link href="/term/apply" className="btn btn-brass">See my coverage</Link>
            <CallButton variant="ghost" />
          </div>
          <ul className="term-trust">
            <li>No exam to get started</li>
            <li>No SSN needed</li>
            <li>Licensed agents, real people</li>
          </ul>
        </div>
      </section>

      <section className="term-needs">
        <div className="term-section-inner">
          <h2>What do you want to protect?</h2>
          <p className="term-section-lede">Pick one to get started — it takes about two minutes.</p>
          <div className="term-need-grid">
            {Object.values(NEEDS).map((n) => (
              <Link key={n.key} href={`/term/apply?need=${n.key}`} className="term-need-card">
                <span className="term-need-icon">{ICONS[n.key]}</span>
                <span className="term-need-tag">{n.tag}</span>
                <span className="term-need-title">{n.title}</span>
                <span className="term-need-body">{n.body}</span>
                <span className="term-need-cta">Start →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="term-how">
        <div className="term-section-inner">
          <h2>How it works</h2>
          <ol className="term-how-list">
            {STEPS.map((s) => (
              <li key={s.n}>
                <span className="term-how-num">{s.n}</span>
                <div>
                  <div className="term-how-title">{s.t}</div>
                  <div className="term-how-body">{s.b}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="term-talk">
        <div className="term-section-inner term-talk-inner">
          <div>
            <h2>Rather talk to a person?</h2>
            <p>A licensed agent can answer your questions and get you a price on the phone.</p>
          </div>
          <CallButton variant="solid" />
        </div>
      </section>

      <footer className="term-footer">
        <div className="term-section-inner">
          <p>
            Term life insurance provides coverage for a set period of time. Coverage amounts shown are
            starting points, not quotes; final eligibility and pricing are determined by the insurance
            company. Living benefit riders vary by insurer and state and may have limits and
            eligibility requirements.
          </p>
          <p>
            Looking for permanent coverage with cash value? <Link href="/">See LegacyDirect IUL plans</Link>
            {' · '}
            <a href="/data-use">How your information is used</a>
          </p>
        </div>
      </footer>

      <div className="term-callbar">
        <CallButton variant="solid" label="Call for live help" />
      </div>
    </div>
  );
}
