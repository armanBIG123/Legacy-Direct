'use client';

import { useState } from 'react';
import TermHeader from './TermHeader';
import CallButton from './CallButton';
import TermQuiz from './TermQuiz';
import { LegalLinks } from '../legal/AgencyLine';
import { LIVING_BENEFITS_DISCLOSURE } from '../legal/disclosures';

// /term/apply — the term quiz on its own focused page. Ads can link here
// with ?need=living | temporary | mortgage; the first screen is the same.
export default function TermFlow() {
  // On phones the header's Call button is always visible, so the bottom
  // call bar stays tucked on the first screen to keep its button in view.
  const [step, setStep] = useState('start');
  return (
    <div className="apply-page term-page">
      <TermHeader />

      <main className="apply-main term-main">
        <div className="apply-layout">
          <div className="apply-content">
            <TermQuiz onStepChange={setStep} />
          </div>
        </div>
      </main>

      {/* Phones: Call button always within thumb reach */}
      <div className={`term-callbar ${step === 'start' ? 'is-tucked' : ''}`}>
        <CallButton variant="solid" label="Call for live help" where="callbar" />
        <p className="term-callbar-note">The agent will see any answers you&rsquo;ve given.</p>
      </div>

      <footer className="apply-footer">
        <div className="apply-footer-inner">
          <span>
            Term life insurance provides coverage for a set period and has no cash value. Applying
            doesn&rsquo;t start coverage — the insurance company decides. {LIVING_BENEFITS_DISCLOSURE}
          </span>
          <LegalLinks />
        </div>
      </footer>
    </div>
  );
}
