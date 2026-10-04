'use client';

import StepHeading from '../StepHeading';

function Stepper({ label, value, onChange, min, max, step = 1 }) {
  const clamp = (v) => Math.min(max, Math.max(min, v));
  return (
    <div className="apply-field">
      <label>{label}</label>
      <div className="apply-stepper">
        <button
          type="button"
          className="apply-stepper-btn"
          onClick={() => onChange(clamp(value - step))}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <input
          type="number"
          className="apply-stepper-input"
          value={value}
          onChange={(e) => {
            const v = e.target.value === '' ? '' : Number(e.target.value);
            onChange(v === '' ? '' : clamp(v));
          }}
        />
        <button
          type="button"
          className="apply-stepper-btn"
          onClick={() => onChange(clamp(value + step))}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function HeightWeightStep({ data, update }) {
  const name = data.subjectFirstName || 'the applicant';

  return (
    <div>
      <StepHeading
        eyebrow={`About ${name}`}
        title={`What's ${name}'s height and weight?`}
        subtitle="A close estimate works fine for this preview."
      />
      <div className="apply-hw-row">
        <Stepper
          label="Height in feet"
          value={data.heightFeet}
          onChange={(v) => update({ heightFeet: v })}
          min={3}
          max={7}
        />
        <Stepper
          label="And inches"
          value={data.heightInches}
          onChange={(v) => update({ heightInches: v })}
          min={0}
          max={11}
        />
        <Stepper
          label="Weight in pounds"
          value={data.weightLbs}
          onChange={(v) => update({ weightLbs: v })}
          min={60}
          max={450}
          step={1}
        />
      </div>
    </div>
  );
}

export function heightWeightIsValid(data) {
  return (
    data.heightFeet !== '' &&
    data.heightInches !== '' &&
    data.weightLbs !== '' &&
    data.weightLbs > 0
  );
}
