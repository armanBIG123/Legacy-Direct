'use client';

import { suggestedPlanName, answerRows } from './planSuggestion';
import Turnstile from './Turnstile';
import { TURNSTILE_SITE_KEY, leadsConfigured } from './leadConfig';
import { useState } from 'react';

export default function ReviewScreen({
  data,
  onContinue,
  onBack,
  onEditAnswers,
  submitting,
  error,
  turnstileKey,
  turnstileToken,
  onTurnstileToken,
}) {
  const [checkFailed, setCheckFailed] = useState(false);
  // Only hold the button while Cloudflare's check is running and working.
  const checking = leadsConfigured && !turnstileToken && !checkFailed;
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
      <p className="apply-subtitle">Check your answers, then send them to a licensed LegacyDirect advisor.</p>

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
        This is a preview built from your answers — not a quote or an application. Sending it
        doesn&rsquo;t commit you to anything. Final eligibility and pricing are confirmed by the
        insurer during underwriting.
      </p>

      {leadsConfigured && (
        <Turnstile
          key={turnstileKey}
          siteKey={TURNSTILE_SITE_KEY}
          onToken={(t) => {
            if (t) setCheckFailed(false);
            onTurnstileToken(t);
          }}
          onError={() => setCheckFailed(true)}
        />
      )}

      {checkFailed && !error && (
        <div className="apply-error" role="alert">
          Our security check couldn&rsquo;t load. Turn off any ad or script blockers for this site,
          then refresh the page.
        </div>
      )}

      {error && (
        <div className="apply-error" role="alert">
          {error}
        </div>
      )}

      <div className="apply-nav">
        <button type="button" className="apply-nav-back" onClick={onBack}>
          Back
        </button>
        <div className="apply-nav-right">
          <button type="button" className="apply-edit-link" onClick={onEditAnswers}>
            Edit my answers
          </button>
          <button type="button" className="btn btn-brass" onClick={onContinue} disabled={submitting || checking}>
            {submitting ? 'Sending…' : checking ? 'Securing…' : error ? 'Try again' : 'Send to my advisor'}
          </button>
        </div>
      </div>
    </div>
  );
}
