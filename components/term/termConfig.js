// Term coverage settings. Change the phone number here and every Call
// button on the term pages updates.
export const AGENT_PHONE_DISPLAY = '(000) 000-0000';
export const AGENT_PHONE_TEL = '+10000000000'; // digits only, with +1

export const phoneConfigured = !AGENT_PHONE_TEL.startsWith('+1000');

// Income multiple used for income-based coverage estimates.
export const INCOME_MULTIPLE = 10;

export const NEEDS = {
  living: {
    key: 'living',
    title: 'Living benefits',
    tag: 'Income replacement',
    short: 'Protect your paycheck',
    body: 'If a serious illness or injury keeps you from working, living benefits let you use part of your coverage while you’re alive — to keep the bills paid.',
    basis: 'income',
  },
  temporary: {
    key: 'temporary',
    title: 'Temporary coverage',
    tag: '10× your income',
    short: 'Cover your family’s years',
    body: 'Affordable coverage for the years your family depends on you most, sized at about 10 times your yearly income.',
    basis: 'income',
  },
  mortgage: {
    key: 'mortgage',
    title: 'Mortgage protection',
    tag: 'Pays off the house',
    short: 'Keep the house',
    body: 'Coverage matched to what you owe on your home, so your family can stay in it no matter what.',
    basis: 'mortgage',
  },
};

// Starting coverage for the chosen need. Rounded to the nearest $10,000.
export function suggestedCoverage(data) {
  const need = NEEDS[data.need];
  if (!need) return null;
  const raw = need.basis === 'mortgage' ? Number(data.mortgage) || 0 : (Number(data.income) || 0) * INCOME_MULTIPLE;
  if (!raw) return null;
  return Math.round(raw / 10000) * 10000;
}

export function formatMoney(n) {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

// Compact money: $500K, $1.2M
export function shortMoney(n) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
}
