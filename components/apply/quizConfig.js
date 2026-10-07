import ChoiceStep from './fields/ChoiceStep';
import StateStep, { stateIsValid } from './fields/StateStep';
import DobStep, { dobIsValid } from './fields/DobStep';
import SexStep, { sexIsValid } from './fields/SexStep';
import HeightWeightStep, { heightWeightIsValid } from './fields/HeightWeightStep';
import MortgageStep, { mortgageIsValid } from './fields/MortgageStep';
import { LABELS, who } from './planSuggestion';

// Every numbered quiz question, in order. Each entry has:
//   id        — unique key
//   Component — renders the question ({ data, update, onChoose })
//   isValid   — (data) => can the visitor continue?
//   auto      — true for single-pick questions: choosing an answer moves on
//   when      — optional (data) => boolean; the question is skipped if false
//   onLeave   — optional data patch applied when the visitor continues
// The progress bar, question count and intro copy all read from this list,
// so adding, removing or reordering a question only happens here.

const opts = (map, extra = {}) =>
  Object.entries(map).map(([value, label]) => ({ value, label, ...(extra[value] || {}) }));

const icon = (paths) => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.4">
    {paths}
  </svg>
);

const GOAL_EXTRAS = {
  legacy: {
    body: 'A death benefit that keeps your family secure — for life, not a set term.',
    icon: icon(
      <>
        <circle cx="10" cy="10" r="4" />
        <path d="M3 25c0-5 3-8 7-8s7 3 7 8" />
        <circle cx="21" cy="12" r="3.4" />
        <path d="M16 25c.3-4 2.6-6.6 5.6-6.6 2.8 0 5 2.1 5.6 5.4" />
      </>
    ),
  },
  retirement: {
    body: 'Cash value with growth potential and downside protection you can borrow against later.',
    icon: icon(
      <>
        <path d="M4 22l7-8 5 4 9-11" />
        <path d="M19 7h6v6" />
      </>
    ),
  },
  living: {
    body: 'Access part of your death benefit early for a qualifying chronic, critical or terminal illness.',
    icon: icon(
      <>
        <path d="M15 26s-10-6-10-13a5.5 5.5 0 0 1 10-3 5.5 5.5 0 0 1 10 3c0 7-10 13-10 13z" />
        <path d="M9 15h4l1.5-3 2 6 1.5-3h3" />
      </>
    ),
  },
  unsure: {
    body: "That's fine — we'll show you what fits based on the rest of your answers.",
    icon: icon(
      <>
        <circle cx="15" cy="15" r="11" />
        <path d="M11.5 11.5a3.5 3.5 0 1 1 4.5 3.4c-.6.2-1 .8-1 1.4V18" />
        <circle cx="15" cy="21.5" r=".6" fill="currentColor" />
      </>
    ),
  },
};

function choice(id, config) {
  const cfg = { field: id, ...config };
  function Step(props) {
    return <ChoiceStep config={cfg} {...props} />;
  }
  Step.displayName = `ChoiceStep_${id}`;
  const isValid = (data) => {
    const v = data[cfg.field];
    return cfg.multi ? Array.isArray(v) && v.length > 0 : v !== null && v !== undefined && v !== '';
  };
  return { id, Component: Step, isValid, auto: !cfg.multi, when: config.when };
}

export const QUESTION_STEPS = [
  choice('goals', {
    multi: true,
    exclusive: ['unsure'],
    layout: 'cards',
    eyebrow: 'Your goals',
    title: (d) => (who(d).isMe ? 'What do you want your coverage to do?' : `What should ${who(d).poss} coverage do?`),
    subtitle: 'Most people want a mix. Every plan we offer includes all three — this tells us what to lead with.',
    options: opts(LABELS.goals, GOAL_EXTRAS),
  }),
  choice('trigger', {
    eyebrow: 'Your why',
    title: 'What got you thinking about this now?',
    options: opts(LABELS.trigger),
  }),
  choice('dependents', {
    multi: true,
    exclusive: ['none'],
    eyebrow: 'Your people',
    title: (d) => `Who depends on ${who(d).isMe ? 'you' : who(d).subj} financially?`,
    options: opts(LABELS.dependents),
  }),
  choice('childrenCount', {
    eyebrow: 'Your people',
    title: 'How many of those children are under 18?',
    subtitle: 'This helps estimate how many years of support coverage should plan for.',
    options: opts(LABELS.childrenCount),
    when: (d) => (d.dependents || []).includes('children'),
  }),
  { id: 'mortgage', Component: MortgageStep, isValid: mortgageIsValid, onLeave: { mortgageTouched: true } },
  { id: 'state', Component: StateStep, isValid: stateIsValid },
  { id: 'dob', Component: DobStep, isValid: dobIsValid },
  { id: 'sex', Component: SexStep, isValid: sexIsValid },
  { id: 'heightWeight', Component: HeightWeightStep, isValid: heightWeightIsValid },
  choice('tobacco', {
    eyebrow: 'Health basics',
    title: (d) => `When did ${who(d).subj} last use tobacco or nicotine?`,
    subtitle: 'Includes cigarettes, vapes, cigars, chew and nicotine pouches. It’s one of the biggest factors in price.',
    options: [
      { value: 'never', label: 'Never, or not in the last 2 years' },
      { value: 'quit', label: 'Quit 1–2 years ago' },
      { value: 'current', label: 'Within the last 12 months' },
    ],
  }),
  choice('citizenship', {
    eyebrow: 'Residency',
    title: (d) => (who(d).isMe ? 'Are you a U.S. citizen or permanent resident?' : `Is ${who(d).subj} a U.S. citizen or permanent resident?`),
    subtitle: 'Either way you may qualify — it changes how much coverage is available without a medical exam.',
    options: [
      { value: 'citizen', label: 'U.S. citizen' },
      { value: 'resident', label: 'Permanent resident (green card)' },
      { value: 'other', label: 'Neither of these' },
    ],
  }),
  choice('budget', {
    eyebrow: 'Your budget',
    title: 'What could you comfortably put toward this each month?',
    subtitle: 'An IUL can be funded at different levels. More funding generally means more cash value potential — but protection works at every level.',
    options: opts(LABELS.budget),
  }),
  choice('timing', {
    eyebrow: 'Timing',
    title: 'When would you like coverage in place?',
    options: opts(LABELS.timing),
  }),
];

export function visibleSteps(data) {
  return QUESTION_STEPS.filter((s) => !s.when || s.when(data));
}
