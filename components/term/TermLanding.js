'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import TermHeader from './TermHeader';
import CallButton from './CallButton';
import { NEEDS, INCOME_MULTIPLE } from './termConfig';
import { captureAttribution } from './attribution';
import { trackEvent } from './track';
import { SAVE_NOTICE } from './disclosures';

const ICONS = {
  living: (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M14 24s-9-5.4-9-11.7A5 5 0 0 1 14 9.6a5 5 0 0 1 9 2.7C23 18.6 14 24 14 24z" />
      <path d="M8.5 14h3.5l1.5-3 2 5.5 1.5-2.5h2.5" />
    </svg>
  ),
  temporary: (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="9" cy="9" r="3.5" />
      <path d="M3 22c0-4 2.7-6.5 6-6.5s6 2.5 6 6.5" />
      <circle cx="19.5" cy="11" r="2.8" />
      <path d="M16 22c.3-3.2 1.8-5 4-5s3.6 1.7 4 5" />
    </svg>
  ),
  mortgage: (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 13 14 5l10 8" />
      <path d="M7 11v12h14V11" />
      <path d="M12 23v-6h4v6" />
    </svg>
  ),
};

const HOW = [
  { t: 'Tap what you want to protect', b: 'Then answer 5 quick questions — about two minutes.' },
  { t: 'See your starting coverage', b: `Sized to your income (${INCOME_MULTIPLE}×) or your mortgage balance.` },
  { t: 'Finish with a real, licensed agent', b: 'Start online, then an agent compares insurers and gets you exact prices. No obligation.' },
];

const FAQ = [
  {
    q: 'Do I need a medical exam?',
    a: 'Not to get started. Depending on your age, health and coverage amount, many people can apply without one — your agent will tell you up front.',
  },
  {
    q: 'How much does it cost?',
    a: 'Term is usually the most affordable kind of life insurance. Your price depends on age, health, tobacco use, coverage amount and term length. An agent gets you exact prices.',
  },
  {
    q: 'What are living benefits?',
    a: 'Riders that let you use part of your coverage while you’re alive if you have a qualifying serious illness, so you can keep paying bills. Availability varies by insurer and state.',
  },
  {
    q: 'Will I get spammed?',
    a: 'No. Your information is only used to help with your coverage request, and you choose whether we can text you.',
  },
];

export default function TermLanding() {
  useEffect(() => {
    captureAttribution();
    trackEvent('term_view');
  }, []);

  return (
    <div className="term-page">
      <TermHeader />

      <section className="term-hero">
        <div className="term-hero-inner">
          <div className="eyebrow on-ink">Term life coverage</div>
          <h1>
            Protect your paycheck, your family and your home — <em>see your coverage in 2 minutes.</em>
          </h1>
          <p className="term-hero-lede">No exam to get started. No Social Security number. Real people, licensed agents.</p>

          <div className="term-hero-pick">
            <div className="term-hero-q">What do you want to protect?</div>
            <div className="term-hero-cards">
              {Object.values(NEEDS).map((n) => (
                <Link
                  key={n.key}
                  href={`/term/apply?need=${n.key}`}
                  className="term-hero-card"
                  onClick={() => trackEvent('term_start', { need: n.key, from: 'hero' })}
                >
                  <span className="term-hero-card-icon">{ICONS[n.key]}</span>
                  <span className="term-hero-card-text">
                    <span className="term-hero-card-title">{n.title}</span>
                    <span className="term-hero-card-tag">{n.tag}</span>
                  </span>
                  <span className="term-hero-card-arrow" aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
            <p className="term-hero-notice">
              {SAVE_NOTICE} <a href="/data-use#term">How we use your information</a>
            </p>
            <div className="term-hero-alt">
              <span>Prefer to talk?</span>
              <CallButton variant="ghost" onCall={() => trackEvent('term_call', { step: 'landing_hero' })} />
            </div>
          </div>
        </div>
      </section>

      <section className="term-myth">
        <div className="term-section-inner term-myth-inner">
          <div className="term-myth-stat">
            <span className="term-myth-num">10–12×</span>
            <span className="term-myth-label">how much adults 30 and under overestimate the cost of term life</span>
          </div>
          <div className="term-myth-copy">
            <h2>It probably costs less than you think.</h2>
            <p>
              In LIMRA&rsquo;s 2025 research, young adults guessed a $250,000, 20-year term policy costs
              10 to 12 times more than it actually does. Cost is the #1 reason people put this off — so
              see your real number before you decide.
            </p>
            <Link href="/term/apply" className="btn btn-brass" onClick={() => trackEvent('term_start', { from: 'myth' })}>
              See my coverage →
            </Link>
            <p className="term-myth-source">Source: LIMRA &amp; Life Happens, 2025 Insurance Barometer Study.</p>
          </div>
        </div>
      </section>

      <section className="term-needs">
        <div className="term-section-inner">
          <h2>Three ways term coverage protects you</h2>
          <div className="term-need-grid">
            {Object.values(NEEDS).map((n) => (
              <Link key={n.key} href={`/term/apply?need=${n.key}`} className="term-need-card"
                onClick={() => trackEvent('term_start', { need: n.key, from: 'cards' })}>
                <span className="term-need-icon">{ICONS[n.key]}</span>
                <span className="term-need-tag">{n.tag}</span>
                <span className="term-need-title">{n.title}</span>
                <span className="term-need-body">{n.body}</span>
                <span className="term-need-cta">See my coverage →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="term-how">
        <div className="term-section-inner">
          <h2>How it works</h2>
          <ol className="term-how-list">
            {HOW.map((s, i) => (
              <li key={s.t}>
                <span className="term-how-num">{i + 1}</span>
                <div>
                  <div className="term-how-title">{s.t}</div>
                  <div className="term-how-body">{s.b}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="term-faq">
        <div className="term-section-inner term-faq-inner">
          <h2>Common questions</h2>
          {FAQ.map((f) => (
            <details key={f.q} className="term-faq-item">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="term-talk">
        <div className="term-section-inner term-talk-inner">
          <div>
            <h2>Ready when you are.</h2>
            <p>Two minutes online, or talk to a licensed agent now.</p>
          </div>
          <div className="term-talk-ctas">
            <Link href="/term/apply" className="btn btn-brass" onClick={() => trackEvent('term_start', { from: 'footer_cta' })}>
              See my coverage →
            </Link>
            <CallButton variant="solid" onCall={() => trackEvent('term_call', { step: 'landing_footer' })} />
          </div>
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
        <CallButton variant="solid" label="Call for live help" onCall={() => trackEvent('term_call', { step: 'landing_bar' })} />
      </div>
    </div>
  );
}
