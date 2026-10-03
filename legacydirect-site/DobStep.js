'use client';

import StepHeading from '../StepHeading';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function DobStep({ data, update }) {
  const name = data.subjectFirstName || 'the applicant';

  return (
    <div>
      <StepHeading
        eyebrow={`About ${name}`}
        title={`When was ${name} born?`}
      />
      <div className="apply-dob-row">
        <div className="apply-field">
          <label htmlFor="dob-month">Month</label>
          <select
            id="dob-month"
            className="apply-select"
            value={data.dobMonth}
            onChange={(e) => update({ dobMonth: e.target.value })}
          >
            <option value="">Select</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div className="apply-field apply-field-narrow">
          <label htmlFor="dob-day">Day</label>
          <input
            id="dob-day"
            type="number"
            className="apply-input"
            min="1"
            max="31"
            placeholder="15"
            value={data.dobDay}
            onChange={(e) => update({ dobDay: e.target.value })}
          />
        </div>
        <div className="apply-field apply-field-narrow">
          <label htmlFor="dob-year">Year</label>
          <input
            id="dob-year"
            type="number"
            className="apply-input"
            min="1920"
            max={new Date().getFullYear()}
            placeholder="1980"
            value={data.dobYear}
            onChange={(e) => update({ dobYear: e.target.value })}
          />
        </div>
      </div>
      {dobOutOfRange(data) && (
        <p className="apply-field-note apply-field-note-warn">
          Most LegacyDirect plans cover applicants between 18 and 85 years old.
        </p>
      )}
    </div>
  );
}

function dobOutOfRange(data) {
  if (!data.dobMonth || !data.dobDay || !data.dobYear) return false;
  const dob = new Date(Number(data.dobYear), Number(data.dobMonth) - 1, Number(data.dobDay));
  if (Number.isNaN(dob.getTime())) return false;
  const ageMs = Date.now() - dob.getTime();
  const age = ageMs / (1000 * 60 * 60 * 24 * 365.25);
  return age < 18 || age > 85;
}

export function dobIsValid(data) {
  // Out-of-range ages show a note but don't block continuing — an advisor
  // can still follow up. Only require the fields to be filled in.
  return !!(data.dobMonth && data.dobDay && data.dobYear);
}
