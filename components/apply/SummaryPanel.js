'use client';

import { suggestedPlanName, answerRows } from './planSuggestion';

// A running recap of what's been answered so far, styled after the
// "Policy Preview" card on the homepage. Competitor flows never show
// visitors what they've already told them — this keeps the quiz transparent.
export default function SummaryPanel({ data }) {
  const rows = answerRows(data).filter((r) => r.value);

  const planName = suggestedPlanName(data);
  const subjectName = data.subjectFirstName
    ? `${data.subjectFirstName} ${data.subjectLastName || ''}`.trim()
    : null;

  return (
    <aside className="apply-summary">
      <div className="apply-summary-tab">
        <span>Your plan so far</span>
      </div>
      <div className="apply-summary-body">
        {subjectName && <div className="apply-summary-name">{subjectName}</div>}
        {planName && <div className="apply-summary-plan">{planName}</div>}

        {rows.length === 0 ? (
          <p className="apply-summary-empty">Your answers will show up here as you go.</p>
        ) : (
          <div className="apply-summary-rows">
            {rows.map((r) => (
              <div className="apply-summary-row" key={r.label}>
                <span>{r.label}</span>
                <span>{r.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
