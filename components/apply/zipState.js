// First three digits of a ZIP code → state, from the USPS prefix ranges.
// Returns the full state name (matching usStates.js) or null when the ZIP
// isn't a U.S. state (territories, military mail, unused prefixes).
const RANGES = [
  [5, 5, 'New York'],
  [10, 27, 'Massachusetts'], [28, 29, 'Rhode Island'], [30, 38, 'New Hampshire'],
  [39, 49, 'Maine'], [50, 54, 'Vermont'], [55, 55, 'Massachusetts'], [56, 59, 'Vermont'],
  [60, 69, 'Connecticut'], [70, 89, 'New Jersey'], [100, 149, 'New York'],
  [150, 196, 'Pennsylvania'], [197, 199, 'Delaware'],
  [200, 200, 'District of Columbia'], [201, 201, 'Virginia'], [202, 205, 'District of Columbia'],
  [206, 219, 'Maryland'], [220, 246, 'Virginia'], [247, 268, 'West Virginia'],
  [270, 289, 'North Carolina'], [290, 299, 'South Carolina'],
  [300, 319, 'Georgia'], [320, 339, 'Florida'], [341, 349, 'Florida'],
  [350, 369, 'Alabama'], [370, 385, 'Tennessee'], [386, 397, 'Mississippi'], [398, 399, 'Georgia'],
  [400, 427, 'Kentucky'], [430, 459, 'Ohio'], [460, 479, 'Indiana'], [480, 499, 'Michigan'],
  [500, 528, 'Iowa'], [530, 549, 'Wisconsin'], [550, 567, 'Minnesota'], [569, 569, 'District of Columbia'],
  [570, 577, 'South Dakota'], [580, 588, 'North Dakota'], [590, 599, 'Montana'],
  [600, 629, 'Illinois'], [630, 658, 'Missouri'], [660, 679, 'Kansas'], [680, 693, 'Nebraska'],
  [700, 714, 'Louisiana'], [716, 729, 'Arkansas'], [730, 732, 'Oklahoma'], [733, 733, 'Texas'],
  [734, 749, 'Oklahoma'], [750, 799, 'Texas'],
  [800, 816, 'Colorado'], [820, 831, 'Wyoming'], [832, 838, 'Idaho'], [840, 847, 'Utah'],
  [850, 865, 'Arizona'], [870, 884, 'New Mexico'], [885, 885, 'Texas'], [889, 898, 'Nevada'],
  [900, 961, 'California'], [967, 968, 'Hawaii'], [970, 979, 'Oregon'], [980, 994, 'Washington'],
  [995, 999, 'Alaska'],
];

export function stateFromZip(zip) {
  if (!/^\d{5}$/.test(zip || '')) return null;
  const p = Number(zip.slice(0, 3));
  const hit = RANGES.find(([lo, hi]) => p >= lo && p <= hi);
  return hit ? hit[2] : null;
}
