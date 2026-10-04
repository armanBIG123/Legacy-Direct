'use client';

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
      <p className="apply-subtitle">This won&rsquo;t change your preview.</p>

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
        <span>Email me about this saved preview if I leave before finishing. I can stop these emails at any time.</span>
      </label>

      <label className="apply-checkbox-row">
        <input
          type="checkbox"
          checked={data.wantsTexts}
          onChange={(e) => update({ wantsTexts: e.target.checked })}
        />
        <span>
          Text me about this request, including automated or prerecorded messages. Consent isn&rsquo;t
          required to buy anything. Message and data rates may apply.
        </span>
      </label>

      <p className="apply-bookend-fine">
        Next, you&rsquo;ll review your plan preview and start building a free LegacyDirect account.
        A licensed advisor reviews it with you before anything goes to the insurance company.
      </p>

      <div className="apply-nav">
        <button type="button" className="apply-nav-back" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn btn-brass" onClick={onContinue}>
          Save and continue
        </button>
      </div>
    </div>
  );
}
