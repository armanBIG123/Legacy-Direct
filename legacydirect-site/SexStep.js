'use client';

import StepHeading from '../StepHeading';

export default function SexStep({ data, update }) {
  const name = data.subjectFirstName || 'the applicant';

  return (
    <div>
      <StepHeading
        eyebrow={`About ${name}`}
        title={`What sex will be listed on ${name}'s application?`}
        subtitle="Carriers classify risk using female or male here — this is separate from gender identity."
      />
      <div className="apply-card-grid apply-card-grid-2">
        <button
          type="button"
          className={`apply-option-card apply-option-card-compact ${data.sex === 'female' ? 'is-selected' : ''}`}
          onClick={() => update({ sex: 'female' })}
        >
          <span className="apply-option-icon">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle cx="13" cy="9" r="6" stroke="currentColor" strokeWidth="1.4" />
              <path d="M13 15v9M9 21h8" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </span>
          <span className="apply-option-title">Female</span>
        </button>
        <button
          type="button"
          className={`apply-option-card apply-option-card-compact ${data.sex === 'male' ? 'is-selected' : ''}`}
          onClick={() => update({ sex: 'male' })}
        >
          <span className="apply-option-icon">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle cx="11" cy="15" r="6" stroke="currentColor" strokeWidth="1.4" />
              <path d="M15 11l7-7M15 4h7v7" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </span>
          <span className="apply-option-title">Male</span>
        </button>
      </div>
    </div>
  );
}

export function sexIsValid(data) {
  return !!data.sex;
}
