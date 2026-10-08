'use client';

import { TEXT_CONSENT_WORDING } from './submitLead';

export default function ContactScreen({ data, update, onContinue, onBack, onEdit }) {
  const isMe = data.coverageFor === 'me';
  const subjectName = isMe
    ? `${data.applicantFirstName} ${data.applicantLastName}`.trim()
    : `${data.subjectFirstName} ${data.subjectLastName}`.trim();
  const email = isMe ? data.applicantEmail : data.yourEmail;

  return (
    <div className="apply-bookend apply-bookend-wide">
      <div className="apply-eyebrow">Last step</div>
      <h1>How should we reach you?</h1>
      <p className="apply-subtitle">A licensed advisor will use this to follow up. It won&rsquo;t change your match.</p>

      <div className="apply-contact-summary">
        <div>
          <div className="apply-field-group-label">Person being covered</div>
          <div className="apply-contact-value">{subjectName || '—'}</div>
        </div>
        <div>
          <div className="apply-field-group-label">Your email</div>
          <div className="apply-contact-value">{email || '—'}</div>
        </div>
        <button type="button" className="apply-edit-link" onClick={onEdit}>
          Edit
        </button>
      </div>

      <div className="apply-field apply-field-narrow-mobile">
        <label>Mobile number (optional)</label>
        <input
          type="tel"
          className="apply-input"
          placeholder="(555) 555-5555"
          value={data.mobile}
          onChange={(e) => update({ mobile: e.target.value })}
        />
      </div>

      <label className="apply-checkbox-row">
        <input
          type="checkbox"
          checked={data.wantsEmailUpdates}
          onChange={(e) => update({ wantsEmailUpdates: e.target.checked })}
        />
        <span>Email me updates about my plan and coverage options. I can unsubscribe at any time.</span>
      </label>

      <label className="apply-checkbox-row">
        <input
          type="checkbox"
          checked={data.wantsTexts}
          onChange={(e) => update({ wantsTexts: e.target.checked })}
        />
        <span>{TEXT_CONSENT_WORDING}</span>
      </label>

      <p className="apply-bookend-fine">
        Next, you&rsquo;ll review your answers and send them to a licensed advisor, who walks
        through everything with you before anything goes to an insurance company.
      </p>

      {/* Honeypot: hidden from people, tempting to bots. */}
      <div className="apply-hp" aria-hidden="true">
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={data.website || ''}
            onChange={(e) => update({ website: e.target.value })}
          />
        </label>
      </div>

      <div className="apply-nav">
        <button type="button" className="apply-nav-back" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn btn-brass" onClick={onContinue}>
          Review my answers
        </button>
      </div>
    </div>
  );
}
