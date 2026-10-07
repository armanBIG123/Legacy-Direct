'use client';

import { suggestedPlanName, answerRows } from './planSuggestion';

export default function ReviewScreen({ data, onContinue, onBack, onEditAnswers }) {
  const isMe = data.coverageFor === 'me';
  const subjectName = isMe
    ? `${data.applicantFirstName} ${data.applicantLastName}`.trim()
    : `${data.subjectFirstName} ${data.subjectLastName}`.trim();
  const planName = suggestedPlanName(data);

  const rows = [...answerRows(data), { label: 'Mobile', value: data.mobile || 'Not provided' }];

  return (
    <div className="apply-bookend apply-bookend-wide">
      <div className="apply-eyebrow">Your preview</div>
      <h1>Here&rsquo;s your plan preview.</h1>
      <p className="apply-subtitle">Nothing has been submitted yet — review it, then continue.</p>

      <div className="apply-review-card">
        <div className="apply-review-card-tab">
          <span>Plan Preview</span>
          <span>For {subjectName || 'you'}</span>
        </div>
        <div className="apply-review-card-body">
          {planName && <div className="apply-review-plan">{planName}</div>}
          <div className="apply-review-rows">
            {rows.map((r) => (
              <div className="apply-review-row" key={r.label}>
                <span>{r.label}</span>
                <span>{r.value || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="apply-bookend-fine">
        This is an example built from your answers — not a quote. Final eligibility and pricing
        are confirmed by the insurer during underwriting.
      </p>

      <div className="apply-nav">
        <button type="button" className="apply-nav-back" onClick={onBack}>
          Back
        </button>
        <div className="apply-nav-right">
          <button type="button" className="apply-edit-link" onClick={onEditAnswers}>
            Edit my answers
          </button>
          <button type="button" className="btn btn-brass" onClick={onContinue}>
            Continue to create my account
          </button>
        </div>
      </div>
    </div>
  );
}
