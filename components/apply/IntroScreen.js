'use client';

import { QUESTION_STEPS } from './quizConfig';

export default function IntroScreen({ onBegin }) {
  return (
    <div className="apply-bookend">
      <h1>Let&rsquo;s shape your plan.</h1>
      <p className="apply-bookend-lede">
        About {QUESTION_STEPS.filter((s) => !s.when).length} quick questions, around four
        minutes. Most are one tap. No Social Security number and no health forms — just enough
        to match you with the right plan.
      </p>
      <p className="apply-bookend-fine">
        LegacyDirect helps you build and submit a plan. LegacyDirect is not the insurance
        company — the insurer decides whether to offer coverage.
      </p>
      <button type="button" className="btn btn-brass" onClick={onBegin}>
        Begin
      </button>
      <p className="apply-bookend-fine apply-bookend-fine-last">
        A quick preview to help you plan — not an application or an offer.
      </p>
    </div>
  );
}
