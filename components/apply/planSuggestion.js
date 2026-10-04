// Maps a quiz answer to one of the two named LegacyDirect products already
// shown on the homepage, so the recap panel and review screen can point at
// something concrete instead of a generic "your plan" placeholder.
export function suggestedPlanName(goal) {
  if (goal === 'protect') return 'LegacyDirect Freedom IUL';
  if (goal === 'access') return 'LegacyDirect Gold IUL';
  if (goal === 'both') return 'LegacyDirect Gold IUL';
  return null;
}

export function formatDob(data) {
  if (!data.dobMonth || !data.dobDay || !data.dobYear) return null;
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const m = months[Number(data.dobMonth) - 1] || '';
  return `${m} ${data.dobDay}, ${data.dobYear}`;
}

export function formatHeightWeight(data) {
  if (data.heightFeet === '' || data.heightInches === '' || !data.weightLbs) return null;
  return `${data.heightFeet}'${data.heightInches}" · ${data.weightLbs} lb`;
}

export function goalLabel(goal) {
  if (goal === 'protect') return 'Protect the people I love';
  if (goal === 'access') return 'Build money I can access later';
  if (goal === 'both') return 'A bit of both';
  return null;
}

export function sexLabel(sex) {
  if (sex === 'female') return 'Female';
  if (sex === 'male') return 'Male';
  return null;
}
