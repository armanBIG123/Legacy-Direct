import Reveal from './Reveal';

const milestones = [
  { year: '1759', val: '~300', cap: 'families' },
  { year: '1875', val: '~1M', cap: 'policies' },
  { year: '1901', val: '~14M', cap: 'policies' },
  { year: '2010s', val: '~140M', cap: 'insured' },
  { year: '2026', val: '~260M', cap: 'policies' },
];

export default function Timeline() {
  return (
    <section className="timeline" id="history">
      <div className="container">
        <Reveal className="section-head">
          <div className="eyebrow on-ink">Track record</div>
          <h2>150 years of American life insurance</h2>
          <p>
            The category LegacyDirect was built to make simpler — from a handful of mutual
            societies to hundreds of millions of policyholders.
          </p>
        </Reveal>

        <Reveal className="chart-wrap">
          <svg viewBox="0 0 1000 260" width="100%" height="260" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C6A030" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#C6A030" stopOpacity="0" />
              </linearGradient>
            </defs>
            <g stroke="#3E2A5A" strokeWidth="1">
              <line x1="0" y1="20" x2="1000" y2="20" />
              <line x1="0" y1="90" x2="1000" y2="90" />
              <line x1="0" y1="160" x2="1000" y2="160" />
              <line x1="0" y1="230" x2="1000" y2="230" />
            </g>
            <path
              d="M20,225 C120,222 180,215 260,205 C360,192 420,150 520,120 C650,82 760,55 940,25 L940,230 L20,230 Z"
              fill="url(#areaFill)"
            />
            <path
              d="M20,225 C120,222 180,215 260,205 C360,192 420,150 520,120 C650,82 760,55 940,25"
              fill="none"
              stroke="#E2C465"
              strokeWidth="2.4"
            />
            <g fill="#E2C465">
              <circle cx="20" cy="225" r="4.5" />
              <circle cx="260" cy="205" r="4.5" />
              <circle cx="400" cy="165" r="4.5" />
              <circle cx="680" cy="70" r="4.5" />
              <circle cx="940" cy="25" r="4.5" />
            </g>
          </svg>

          <div className="chart-labels">
            {milestones.map((m) => (
              <div className="chart-label" key={m.year}>
                <div className="year">{m.year}</div>
                <div className="val">{m.val}</div>
                <div className="cap">{m.cap}</div>
              </div>
            ))}
          </div>

          <div className="chart-note">
            Sources: ACLI Life Insurers Fact Book and industry estimates. Figures are
            illustrative of long-term category growth, not LegacyDirect-specific data.
          </div>
        </Reveal>
      </div>
    </section>
  );
}
