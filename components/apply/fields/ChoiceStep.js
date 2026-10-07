'use client';

import StepHeading from '../StepHeading';

// One component for every "pick an answer" question. Each question is
// described by a config object in quizConfig.js:
//   field     — key in the shared data object
//   multi     — true = select several (Continue button), false = pick one
//               (auto-advances, like the competitor's tap-and-go flow)
//   exclusive — values that clear every other choice (e.g. "No one")
//   layout    — 'cards' (icon tiles) or 'list' (stacked rows)
export default function ChoiceStep({ config, data, update, onChoose }) {
  const { field, multi = false, exclusive = [], options, layout = 'list' } = config;
  const value = data[field];
  const title = typeof config.title === 'function' ? config.title(data) : config.title;
  const subtitle = typeof config.subtitle === 'function' ? config.subtitle(data) : config.subtitle;
  const eyebrow = typeof config.eyebrow === 'function' ? config.eyebrow(data) : config.eyebrow;

  const isSelected = (v) => (multi ? (value || []).includes(v) : value === v);

  function pick(v) {
    if (!multi) {
      onChoose({ [field]: v });
      return;
    }
    const current = value || [];
    let next = current.includes(v) ? current.filter((x) => x !== v) : [...current, v];
    if (exclusive.includes(v) && next.includes(v)) {
      next = [v];
    } else {
      next = next.filter((x) => !exclusive.includes(x));
    }
    update({ [field]: next });
  }

  return (
    <div>
      <StepHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
      {multi && <p className="apply-choice-hint">Select all that apply.</p>}

      {layout === 'cards' ? (
        <div className={`apply-card-grid ${options.length % 3 === 0 ? 'apply-card-grid-3' : 'apply-card-grid-2'}`}>
          {options.map((opt) => (
            <button
              type="button"
              key={opt.value}
              aria-pressed={isSelected(opt.value)}
              className={`apply-option-card ${isSelected(opt.value) ? 'is-selected' : ''}`}
              onClick={() => pick(opt.value)}
            >
              <span className="apply-option-top">
                {opt.icon && <span className="apply-option-icon">{opt.icon}</span>}
                {multi && <span className={`apply-check ${isSelected(opt.value) ? 'is-on' : ''}`} aria-hidden="true" />}
              </span>
              <span className="apply-option-title">{opt.label}</span>
              {opt.body && <span className="apply-option-body">{opt.body}</span>}
            </button>
          ))}
        </div>
      ) : (
        <div className="apply-choice-list">
          {options.map((opt) => (
            <button
              type="button"
              key={opt.value}
              aria-pressed={isSelected(opt.value)}
              className={`apply-choice-row ${isSelected(opt.value) ? 'is-selected' : ''}`}
              onClick={() => pick(opt.value)}
            >
              <span className="apply-choice-text">
                <span className="apply-choice-label">{opt.label}</span>
                {opt.body && <span className="apply-choice-body">{opt.body}</span>}
              </span>
              {multi ? (
                <span className={`apply-check ${isSelected(opt.value) ? 'is-on' : ''}`} aria-hidden="true" />
              ) : (
                <span className="apply-choice-arrow" aria-hidden="true">→</span>
              )}
            </button>
          ))}
        </div>
      )}

      {config.note && <p className="apply-field-note">{config.note}</p>}
    </div>
  );
}
