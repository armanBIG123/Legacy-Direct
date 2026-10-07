'use client';

import StepHeading from '../StepHeading';
import { formatMoney, who } from '../planSuggestion';

const MAX = 1000000;

export default function MortgageStep({ data, update }) {
  const w = who(data);
  const value = Number(data.mortgage) || 0;

  return (
    <div>
      <StepHeading
        eyebrow="Obligations"
        title={`About how much is left on ${w.poss} mortgage?`}
        subtitle="A rough number is fine. Leave it at $0 if there's no mortgage."
      />
      <div className="apply-slider">
        <div className="apply-slider-value">
          {value >= MAX ? '$1M+' : formatMoney(value)}
        </div>
        <input
          type="range"
          min="0"
          max={MAX}
          step="10000"
          value={value}
          onChange={(e) => update({ mortgage: Number(e.target.value), mortgageTouched: true })}
          aria-label="Remaining mortgage"
          style={{ '--fill': `${(value / MAX) * 100}%` }}
        />
        <div className="apply-slider-scale">
          <span>$0</span>
          <span>$1M+</span>
        </div>
      </div>
      <p className="apply-field-note">
        A mortgage is often the biggest bill a family would face without you. Knowing it helps
        your advisor size coverage that keeps the house.
      </p>
    </div>
  );
}

export function mortgageIsValid() {
  return true;
}
