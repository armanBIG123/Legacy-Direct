'use client';

import { recommendPlan, who } from './planSuggestion';

const NEXT_STEPS = [
  {
    title: 'An advisor reviews your answers',
    body: 'A licensed LegacyDirect advisor looks over everything you shared.',
  },
  {
    title: 'You talk it through together',
    body: 'They confirm the right design, coverage amount and monthly budget with you — no pressure.',
  },
  {
    title: 'You decide whether to apply',
    body: 'Only if you choose to go ahead does anything go to an insurance company.',
  },
];

export default function DoneScreen({ data, onStartOver }) {
  const w = who(data);
  const email = w.isMe ? data.applicantEmail : data.yourEmail;
  const rec = recommendPlan(data);

  return (
    <div className="done">
      <div className="done-badge" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <path d="M8 15.5l4.5 4.5L22 10.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="done-title">You&rsquo;re all set{w.isMe && data.applicantFirstName ? `, ${data.applicantFirstName}` : ''}.</h1>
      <p className="done-lede">
        Your answers were sent to a licensed LegacyDirect advisor, who will follow up at{' '}
        <strong>{email || 'the email you gave us'}</strong>
        {data.mobile ? <> or {data.mobile}</> : null}.
      </p>

      {rec && (
        <div className="done-card">
          <div className="done-card-label">Your starting point</div>
          <div className="done-card-plan">{rec.plan.name}</div>
          <p>{rec.plan.tagline}</p>
        </div>
      )}

      <div className="done-card">
        <div className="done-card-label">What happens next</div>
        <ol className="done-steps">
          {NEXT_STEPS.map((s, i) => (
            <li key={s.title}>
              <span className="done-step-num">{i + 1}</span>
              <div>
                <div className="done-step-title">{s.title}</div>
                <div className="done-step-body">{s.body}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="done-fine">
        Your information is sent over an encrypted connection and is only used to help with this
        request. You can safely close this page.{' '}
        <a href="/data-use">How your information is used</a>
      </p>

      <div className="done-actions">
        <a href="/" className="btn btn-brass">
          Back to LegacyDirect
        </a>
        <button type="button" className="apply-nav-back" onClick={onStartOver}>
          Start another for someone else
        </button>
      </div>
    </div>
  );
}
