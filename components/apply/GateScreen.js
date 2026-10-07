'use client';

import { useState } from 'react';

export default function GateScreen({ data, update, onContinue, onBack }) {
  const [touched, setTouched] = useState(false);

  const isMe = data.coverageFor === 'me';
  const isSomeoneElse = data.coverageFor === 'someone-else';

  const firstName = isMe ? data.applicantFirstName : data.subjectFirstName;
  const lastName = isMe ? data.applicantLastName : data.subjectLastName;
  const email = isMe ? data.applicantEmail : data.yourEmail;

  const canContinue =
    !!data.coverageFor && !!firstName && !!lastName && !!email && email.includes('@');

  function handleContinue() {
    if (!canContinue) {
      setTouched(true);
      return;
    }
    // Keep a single canonical "subject" name regardless of which path was
    // chosen, so the rest of the quiz can always say "What state does
    // {subjectFirstName} live in?" without branching logic everywhere else.
    if (isMe) {
      update({ subjectFirstName: data.applicantFirstName, subjectLastName: data.applicantLastName });
    }
    onContinue();
  }

  return (
    <div className="apply-bookend apply-bookend-wide">
      <div className="apply-eyebrow">Before we start</div>
      <h1>Who is this coverage for?</h1>
      <p className="apply-subtitle">
        Pick one, then add a name and email so you can pick this back up if you step away.
      </p>

      <div className="apply-card-grid apply-card-grid-2 apply-gate-cards">
        <button
          type="button"
          className={`apply-option-card ${isMe ? 'is-selected' : ''}`}
          aria-pressed={isMe}
          onClick={() => update({ coverageFor: 'me' })}
        >
          <span className="apply-gate-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="7" r="4" />
              <path d="M3 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
            </svg>
          </span>
          <span className="apply-option-title">Me</span>
          <span className="apply-option-body">I want coverage for myself</span>
        </button>
        <button
          type="button"
          className={`apply-option-card ${isSomeoneElse ? 'is-selected' : ''}`}
          aria-pressed={isSomeoneElse}
          onClick={() => update({ coverageFor: 'someone-else' })}
        >
          <span className="apply-gate-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="7" r="3.4" />
              <path d="M1.5 19c0-3.8 2.9-6 6.5-6s6.5 2.2 6.5 6" />
              <circle cx="16" cy="8.5" r="2.6" />
              <path d="M15 13.2c3.3-.4 5.5 1.6 5.5 4.8" />
            </svg>
          </span>
          <span className="apply-option-title">Someone else</span>
          <span className="apply-option-body">I&rsquo;m helping a family member or friend</span>
        </button>
      </div>

      {data.coverageFor && (
        <div className="apply-gate-form">
          <div className="apply-field-group-label">
            {isMe ? 'Your name' : 'The name of the person being covered'}
          </div>
          <div className="apply-name-row">
            <div className="apply-field">
              <label>First name</label>
              <input
                className="apply-input"
                value={firstName || ''}
                onChange={(e) =>
                  update(isMe ? { applicantFirstName: e.target.value } : { subjectFirstName: e.target.value })
                }
              />
            </div>
            <div className="apply-field">
              <label>Last name</label>
              <input
                className="apply-input"
                value={lastName || ''}
                onChange={(e) =>
                  update(isMe ? { applicantLastName: e.target.value } : { subjectLastName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="apply-field">
            <label>Your email address</label>
            <input
              type="email"
              className="apply-input"
              value={email || ''}
              onChange={(e) =>
                update(isMe ? { applicantEmail: e.target.value } : { yourEmail: e.target.value })
              }
            />
            {isSomeoneElse && (
              <p className="apply-field-note">Use your own email — you&rsquo;re the one filling this out.</p>
            )}
          </div>

          <label className="apply-checkbox-row">
            <input
              type="checkbox"
              checked={data.wantsPreviewReminder}
              onChange={(e) => update({ wantsPreviewReminder: e.target.checked })}
            />
            <span>Email me a reminder if I leave before finishing. I can turn this off anytime.</span>
          </label>

          {touched && !canContinue && (
            <p className="apply-field-note apply-field-note-warn">
              Add a first name, last name, and a valid email to continue.
            </p>
          )}
        </div>
      )}

      <div className="apply-nav">
        <button type="button" className="apply-nav-back" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn btn-brass" onClick={handleContinue}>
          Continue to the questions
        </button>
      </div>
    </div>
  );
}
