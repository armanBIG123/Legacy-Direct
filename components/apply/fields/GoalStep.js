'use client';

import StepHeading from '../StepHeading';

const OPTIONS = [
  {
    value: 'protect',
    title: 'Protect the people I love',
    body: 'Income, a mortgage, tuition, or final expenses — covered if something happens to me.',
    icon: (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.4" />
        <path d="M3 25c0-5 3-8 7-8s7 3 7 8" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="21" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.4" />
        <path d="M16 25c0.3-4 2.6-6.6 5.6-6.6 2.8 0 5 2.1 5.6 5.4" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    value: 'access',
    title: 'Build money I can access later',
    body: "Tax-free distributions and penalty-free loans you can use while you're alive — not a savings account.",
    icon: (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <path d="M4 22l7-8 5 4 9-11" stroke="currentColor" strokeWidth="1.4" fill="none" />
        <path d="M19 7h6v6" stroke="currentColor" strokeWidth="1.4" fill="none" />
      </svg>
    ),
  },
  {
    value: 'both',
    title: 'A bit of both',
    body: 'Protection today, with tax-advantaged access built in for down the road.',
    icon: (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <path d="M15 4v22" stroke="currentColor" strokeWidth="1.4" />
        <path d="M4 9l4-3 4 3-4 9-4-9z" stroke="currentColor" strokeWidth="1.4" />
        <path d="M18 9l4-3 4 3-4 9-4-9z" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
];

export default function GoalStep({ data, update }) {
  return (
    <div>
      <StepHeading
        eyebrow="Your goal"
        title="What's this coverage for?"
        subtitle="Pick what's closest to your goal right now."
      />
      <div className="apply-card-grid apply-card-grid-3">
        {OPTIONS.map((opt) => (
          <button
            type="button"
            key={opt.value}
            className={`apply-option-card ${data.goal === opt.value ? 'is-selected' : ''}`}
            onClick={() => update({ goal: opt.value })}
          >
            <span className="apply-option-icon">{opt.icon}</span>
            <span className="apply-option-title">{opt.title}</span>
            <span className="apply-option-body">{opt.body}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function goalIsValid(data) {
  return !!data.goal;
}
