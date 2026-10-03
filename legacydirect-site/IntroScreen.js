'use client';

import { QUESTION_STEPS } from './quizConfig';

export default function IntroScreen({ onBegin }) {
  return (
    <div className="apply-bookend">
      <h1>Let&rsquo;s shape your plan.</h1>
      <p className="apply-bookend-lede">
        {QUESTION_STEPS.length} quick questions, about three minutes. No health forms yet —
        just enough to see what coverage could look like.
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
