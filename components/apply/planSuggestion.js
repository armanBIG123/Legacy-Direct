// Shared answer labels, formatting, and the plan-matching logic.
//
// COMPLIANCE NOTE: Comfort and Peace are LegacyDirect's names for two ways a
// licensed agent can DESIGN an indexed universal life (IUL) insurance policy.
// They are not insurance products and not tied to one insurer. Nothing in this
// flow names an insurer or quotes an insurer's rates (caps, participation
// rates, loan rates) — those stay with the licensed agent, and the issuing
// insurer is named on the illustration and application. Keep consumer copy
// generic IUL education (NAIC Advertising Model Reg. #570, sections 5–6).

export const PLANS = {
  comfort: {
    key: 'comfort',
    name: 'LegacyDirect Comfort IUL',
    short: 'Comfort IUL',
    type: 'An indexed universal life insurance design',
    tagline: 'Balanced protection with growth potential, at a lower price point.',
    bestFor: 'Families who want lasting protection first, with cash value building in the background.',
    ages: 'Typically birth to age 80 (varies by insurer)',
  },
  peace: {
    key: 'peace',
    name: 'LegacyDirect Peace IUL',
    short: 'Peace IUL',
    type: 'An indexed universal life insurance design',
    tagline: 'Designed to emphasize cash value growth for supplemental retirement income.',
    bestFor: 'People who want a supplemental, tax-advantaged income source later in life and can fund it consistently.',
    ages: 'Typically ages 18 to 80 (varies by insurer)',
  },
};

// Shown wherever the plan names appear prominently.
export const PLAN_NAME_NOTE =
  'Comfort IUL and Peace IUL are LegacyDirect’s names for two ways your agent can design an indexed universal life insurance policy. They are not insurance companies or insurer product names. Your policy is issued by an insurance company, which is named on your illustration and application.';

export const LABELS = {
  goals: {
    legacy: 'Leave a legacy',
    retirement: 'Grow money for retirement',
    living: 'Be ready if I get seriously ill',
    unsure: "I'm not sure yet",
  },
  trigger: {
    married: 'Getting married',
    child: 'Having a child',
    home: 'Buying a home',
    retirement: 'Planning for retirement',
    job: 'Leaving work coverage',
    health: 'A health scare',
    loss: 'Death of a loved one',
    proactive: 'Just being proactive',
  },
  dependents: {
    spouse: 'Spouse or partner',
    children: 'Children',
    parent: 'Parent',
    other: 'Someone else',
    none: 'No one',
  },
  childrenCount: { 0: '0', 1: '1', 2: '2', 3: '3', '4+': '4+' },
  tobacco: {
    never: 'No tobacco in 2+ years',
    quit: 'Quit 1–2 years ago',
    current: 'Used in the last 12 months',
  },
  citizenship: {
    citizen: 'U.S. citizen',
    resident: 'Permanent resident',
    other: 'Other status',
  },
  budget: {
    under100: 'Under $100 / mo',
    '100-250': '$100–$250 / mo',
    '250-500': '$250–$500 / mo',
    '500+': '$500+ / mo',
    unsure: 'Not sure yet',
  },
  timing: {
    today: 'Ready today',
    week: 'Within a week',
    months: 'In a few months',
    unsure: 'Not sure',
  },
};

// "you / your" when the visitor is covering themselves, the person's name otherwise.
export function who(data) {
  const isMe = data.coverageFor === 'me';
  const name = data.subjectFirstName || '';
  return {
    isMe,
    name,
    subj: isMe ? 'you' : name || 'they',
    poss: isMe ? 'your' : name ? `${name}'s` : 'their',
  };
}

export function ageFromDob(data) {
  if (!data.dobMonth || !data.dobDay || !data.dobYear) return null;
  const dob = new Date(Number(data.dobYear), Number(data.dobMonth) - 1, Number(data.dobDay));
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
}

export function formatMoney(n) {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

// Picks Comfort or Peace from the answers and explains why, in plain words.
// Comfort: balanced protection + accumulation, lower cost, juveniles welcome.
// Peace: cash-value/retirement focus, ages 18+, meant to be funded at or
// above target — so it needs both a retirement goal and room in the budget.
export function recommendPlan(data) {
  const goals = data.goals || [];
  if (goals.length === 0) return null;

  const age = ageFromDob(data);
  const wantsRetirement = goals.includes('retirement');
  const wantsLegacy = goals.includes('legacy');
  const budgetHigh = data.budget === '250-500' || data.budget === '500+';
  const budgetLow = data.budget === 'under100';
  const reasons = [];

  if (age !== null && age < 18) {
    reasons.push(`It can start in childhood — ${PLANS.comfort.ages.toLowerCase()}.`);
    reasons.push('Starting while they’re young and healthy can secure coverage early and gives cash value more time to grow.');
    return { plan: PLANS.comfort, reasons };
  }

  if (wantsRetirement && (budgetHigh || (!wantsLegacy && !budgetLow))) {
    reasons.push('You told us growing money for retirement is a priority.');
    if (budgetHigh) reasons.push('Your budget leaves room to fund the policy at the higher levels this plan is designed for.');
    if (data.trigger === 'retirement') reasons.push("You're already planning for retirement — cash value can add a supplemental, tax-advantaged income source alongside a 401(k) or IRA. It doesn't replace them.");
    reasons.push('You still get a death benefit that lasts as long as the policy stays in force, plus living benefit riders where available.');
    return { plan: PLANS.peace, reasons };
  }

  if (wantsLegacy || goals.includes('living')) reasons.push('Protecting the people who depend on you comes first in your answers.');
  if ((data.dependents || []).some((d) => d !== 'none')) reasons.push('People depend on your income — this is designed to keep them covered for life, not just a set term, as long as the policy stays in force.');
  if (budgetLow) reasons.push('It delivers permanent coverage at a lower price point than a cash-value-maximizing design.');
  if (wantsRetirement) reasons.push('Cash value still builds over time, so retirement access is there as a bonus.');
  if (reasons.length === 0) reasons.push('It balances lasting protection with growth potential — a strong default while you decide.');
  return { plan: PLANS.comfort, reasons };
}

// Back-compat helper used by the summary panel and review card.
export function suggestedPlanName(data) {
  const rec = recommendPlan(data);
  return rec ? rec.plan.name : null;
}

export function formatDob(data) {
  if (!data.dobMonth || !data.dobDay || !data.dobYear) return null;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const m = months[Number(data.dobMonth) - 1] || '';
  return `${m} ${data.dobDay}, ${data.dobYear}`;
}

export function formatHeightWeight(data) {
  if (data.heightFeet === '' || data.heightInches === '' || !data.weightLbs) return null;
  return `${data.heightFeet}'${data.heightInches}" · ${data.weightLbs} lb`;
}

export function sexLabel(sex) {
  if (sex === 'female') return 'Female';
  if (sex === 'male') return 'Male';
  return null;
}

function listLabel(map, values) {
  if (!values || values.length === 0) return null;
  return values.map((v) => map[v]).filter(Boolean).join(', ');
}

// Every answer as a label/value row, in quiz order. Rows with no answer
// come back with value null so callers can filter or show a dash.
export function answerRows(data) {
  const hasKids = (data.dependents || []).includes('children');
  return [
    { label: 'Goals', value: listLabel(LABELS.goals, data.goals) },
    { label: 'What prompted this', value: LABELS.trigger[data.trigger] || null },
    { label: 'Dependents', value: listLabel(LABELS.dependents, data.dependents) },
    hasKids ? { label: 'Children under 18', value: data.childrenCount != null ? LABELS.childrenCount[data.childrenCount] : null } : null,
    { label: 'Mortgage left', value: data.mortgageTouched ? (data.mortgage >= 1000000 ? '$1M+' : formatMoney(data.mortgage || 0)) : null },
    { label: 'State', value: data.state || null },
    { label: 'ZIP code', value: /^\d{5}$/.test(data.zip || '') ? data.zip : null },
    { label: 'Date of birth', value: formatDob(data) },
    { label: 'Sex on application', value: sexLabel(data.sex) },
    { label: 'Height & weight', value: data.hwTouched ? formatHeightWeight(data) : null },
    { label: 'Tobacco', value: LABELS.tobacco[data.tobacco] || null },
    { label: 'Residency', value: LABELS.citizenship[data.citizenship] || null },
    { label: 'Monthly budget', value: LABELS.budget[data.budget] || null },
    { label: 'Timing', value: LABELS.timing[data.timing] || null },
  ].filter(Boolean);
}
