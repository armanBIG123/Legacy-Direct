'use client';

import StepHeading from '../StepHeading';
import { US_STATES } from '../usStates';

export default function StateStep({ data, update }) {
  const name = data.subjectFirstName || 'the applicant';

  return (
    <div>
      <StepHeading
        eyebrow={`About ${name}`}
        title={`What state does ${name} live in?`}
        subtitle="This determines which carriers can offer coverage."
      />
      <div className="apply-field">
        <label htmlFor="state-select">State of residence</label>
        <select
          id="state-select"
          className="apply-select"
          value={data.state}
          onChange={(e) => update({ state: e.target.value })}
        >
          <option value="">Select a state</option>
          {US_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function stateIsValid(data) {
  return !!data.state;
}
