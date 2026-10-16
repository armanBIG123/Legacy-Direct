'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TermHeader from './TermHeader';
import CallButton from './CallButton';
import TermQuiz, { NEED_EVENT } from './TermQuiz';
import { NEEDS, INCOME_MULTIPLE } from './termConfig';
import { captureAttribution } from './attribution';
import { trackEvent } from './track';
import { CALL_NOTICE } from './disclosures';
import { agencySentence, LegalLinks } from '../legal/AgencyLine';
import { GENERAL_DISCLOSURE, TERM_DISCLOSURE, LIVING_BENEFITS_DISCLOSURE, COMPENSATION_DISCLOSURE } from '../legal/disclosures';

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
  { t: 'Tell us who it’s for', b: 'Name, email and ZIP — then a few quick taps. About two minutes.' },
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
    a: 'Riders that let you use part of your death benefit early if you’re diagnosed with a qualifying terminal, chronic or critical illness. Using them lowers the amount your family receives, the money may be taxable, and it can affect eligibility for programs like Medicaid. They aren’t disability or long-term care insurance, and availability varies by insurer and state.',
  },
  {
    q: 'Will you sell my information or spam me?',
    a: 'No. We don’t sell your information. A licensed agent contacts you only about the request you started, automated calls and texts are used only if you check the optional consent box, and you can opt out any time — reply STOP or just tell us.',
  },
];

export default function TermLanding() {
  // The header's Call button is always on screen, so on phones the bottom
  // call bar stays out of the way while the form is visible and slides in
  // once the visitor scrolls past it.
  const [quizInView, setQuizInView] = useState(true);
  useEffect(() => {
    captureAttribution();
    trackEvent('term_view');
    const el = document.getElementById('get-started');
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setQuizInView(entry.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="term-page">
      <TermHeader />

      <section className="term-hero">
        <div className="term-hero-inner term-hero-split">
          <div className="term-hero-copy">
            <div className="eyebrow on-ink">Term life coverage</div>
            <h1>
              Protect your paycheck, your family and your home — <em>see your coverage in 2 minutes.</em>
            </h1>
            <p className="term-hero-lede">No exam to get started. No Social Security number. Real people, licensed agents.</p>
            <ul className="term-hero-points">
              {Object.values(NEEDS).map((n) => (
                <li key={n.key}>
                  <span className="term-hero-point-icon">{ICONS[n.key]}</span>
                  <span>
                    <strong>{n.title}</strong> — {n.tag.toLowerCase()}
                  </span>
                </li>
              ))}
            </ul>
            <div className="term-hero-alt">
              <span>Prefer to talk?</span>
              <CallButton variant="ghost" where="landing_hero" />
              <p className="term-hero-callnote">{CALL_NOTICE}</p>
            </div>
          </div>
          <div className="term-hero-quiz">
            <TermQuiz embedded />
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
            <a href="#get-started" className="btn btn-brass" onClick={() => trackEvent('term_start', { from: 'myth' })}>
              See my coverage →
            </a>
            <p className="term-myth-source">Source: LIMRA &amp; Life Happens, 2025 Insurance Barometer Study.</p>
          </div>
        </div>
      </section>

      <section className="term-needs">
        <div className="term-section-inner">
          <h2>Three ways term coverage protects you</h2>
          <div className="term-need-grid">
            {Object.values(NEEDS).map((n) => (
              <a key={n.key} href="#get-started" className="term-need-card"
                onClick={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent(NEED_EVENT, { detail: { need: n.key } }));
                }}>
                <span className="term-need-icon">{ICONS[n.key]}</span>
                <span className="term-need-tag">{n.tag}</span>
                <span className="term-need-title">{n.title}</span>
                <span className="term-need-body">{n.body}</span>
                <span className="term-need-cta">See my coverage →</span>
              </a>
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

      <section className="term-faq" id="faq">
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
            <a href="#get-started" className="btn btn-brass" onClick={() => trackEvent('term_start', { from: 'footer_cta' })}>
              See my coverage →
            </a>
            <CallButton variant="solid" where="landing_footer" />
          </div>
        </div>
      </section>

      <footer className="term-footer">
        <div className="term-section-inner">
          <p><strong>{agencySentence()}</strong></p>
          <p>{GENERAL_DISCLOSURE}</p>
          <p>{TERM_DISCLOSURE}</p>
          <p>{LIVING_BENEFITS_DISCLOSURE}</p>
          <p>{COMPENSATION_DISCLOSURE}</p>
          <p>
            Looking for permanent coverage with cash value? <Link href="/">See LegacyDirect IUL plans</Link>
            {' · '}
            <LegalLinks />
          </p>
        </div>
      </footer>

      <div className={`term-callbar ${quizInView ? 'is-tucked' : ''}`}>
        <CallButton variant="solid" label="Call for live help" where="landing_bar" />
      </div>
    </div>
  );
}
