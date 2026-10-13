import { AGENCY } from './agency';

// "LegacyDirect is a trade name of X, a licensed insurance agency (NPN …)."
// Falls back to a plain agency statement until agency.js is filled in.
export function agencySentence() {
  const a = AGENCY;
  if (!a.legalName) return `${a.brand} is an insurance agency, not an insurance company.`;
  const npn = a.npn ? ` (NPN ${a.npn})` : '';
  const states = a.licensedStates.length ? ` Licensed to sell life insurance in ${a.licensedStates.join(', ')}.` : '';
  const addr = a.address ? ` ${a.address}.` : '';
  return `${a.brand} is a trade name of ${a.legalName}, a licensed insurance agency${npn}, not an insurance company.${states}${addr}`;
}

export default function AgencyLine({ className }) {
  return <p className={className}>{agencySentence()}</p>;
}

// Privacy · Terms · Opt out — for every footer.
export function LegalLinks({ className, separator = ' · ' }) {
  const links = [
    ['/privacy', 'Privacy Policy'],
    ['/terms', 'Terms of Use'],
    ['/privacy#choices', 'Opt out or delete my info'],
  ];
  return (
    <span className={className}>
      {links.map(([href, label], i) => (
        <span key={href}>
          {i > 0 && separator}
          <a href={href}>{label}</a>
        </span>
      ))}
    </span>
  );
}

// "By continuing, you confirm you're 18 or older and agree to our Terms of Use and Privacy Policy."
export function AgreeLine({ className, action = 'continuing' }) {
  return (
    <p className={className}>
      By {action}, you confirm you&rsquo;re 18 or older and agree to our <a href="/terms">Terms of Use</a> and{' '}
      <a href="/privacy">Privacy Policy</a>.
    </p>
  );
}
