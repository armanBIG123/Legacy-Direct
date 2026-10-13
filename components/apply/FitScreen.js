'use client';

import { PLANS, PLAN_NAME_NOTE, recommendPlan, who } from './planSuggestion';
import { IUL_DISCLOSURE, LIVING_BENEFITS_DISCLOSURE } from '../legal/disclosures';

// Hypothetical index years used only to show how a floor and a cap shape
// what's credited. Deliberately generic: not a carrier's actual rates and
// not a projection.
const EXAMPLE_YEARS = [14, -9, 6, 21, -3, 9];
const EXAMPLE_CAP = 10;
const EXAMPLE_FLOOR = 0;

function CreditingChart() {
  const W = 580;
  const H = 210;
  const left = 44; // gutter for the cap / floor labels
  const zeroY = 140;
  const scale = 4.2; // px per percentage point
  const colW = (W - left) / EXAMPLE_YEARS.length;
  const barW = 22;

  return (
    <figure className="fit-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Hypothetical example: index returns compared with what a policy with a 0% floor and 10% cap would credit">
        <line x1={left - 6} x2={W} y1={zeroY} y2={zeroY} className="fit-chart-zero" />
        <line x1={left - 6} x2={W} y1={zeroY - EXAMPLE_CAP * scale} y2={zeroY - EXAMPLE_CAP * scale} className="fit-chart-cap" />
        <text x="0" y={zeroY - EXAMPLE_CAP * scale + 3} className="fit-chart-capl">cap</text>
        <text x="0" y={zeroY + 3} className="fit-chart-capl">floor</text>
        {EXAMPLE_YEARS.map((r, i) => {
          const credited = Math.min(Math.max(r, EXAMPLE_FLOOR), EXAMPLE_CAP);
          const cx = left + colW * i + colW / 2;
          const idxH = Math.abs(r) * scale;
          const crH = Math.max(credited * scale, 2);
          return (
            <g key={i}>
              <rect
                x={cx - barW - 2}
                y={r >= 0 ? zeroY - idxH : zeroY}
                width={barW}
                height={idxH}
                className={r >= 0 ? 'fit-bar-index' : 'fit-bar-loss'}
              />
              <rect x={cx + 2} y={zeroY - crH} width={barW} height={crH} className="fit-bar-credit" />
              <text x={cx - barW / 2 - 2} y={r >= 0 ? zeroY - idxH - 5 : zeroY + idxH + 13} textAnchor="middle" className="fit-chart-val">
                {r > 0 ? `+${r}` : r}%
              </text>
              <text x={cx + barW / 2 + 2} y={zeroY - crH - 5} textAnchor="middle" className="fit-chart-val fit-chart-val-strong">
                {credited}%
              </text>
              <text x={cx} y={H - 4} textAnchor="middle" className="fit-chart-year">Yr {i + 1}</text>
            </g>
          );
        })}
      </svg>
      <figcaption>
        <span className="fit-key fit-key-index" /> Market index
        <span className="fit-key fit-key-credit" /> Credited to cash value
      </figcaption>
    </figure>
  );
}

const BENEFITS = [
  {
    title: 'Protection for life',
    body: 'A death benefit, generally income-tax-free to your beneficiaries, that lasts as long as the policy stays in force — not just 10, 20 or 30 years.',
  },
  {
    title: 'Living benefits',
    body: 'Riders that can let you use part of your death benefit early if you’re diagnosed with a qualifying chronic, critical or terminal illness. Using them lowers the death benefit. Availability varies by insurer and state.',
  },
  {
    title: 'Cash value you can borrow against',
    body: 'Policy loans are generally income-tax-free while the policy stays in force and isn’t a modified endowment contract (MEC). Loans accrue interest and reduce the death benefit. Use them for retirement, college or anything else.',
  },
];

export default function FitScreen({ data, onBack, onContinue }) {
  const rec = recommendPlan(data);
  if (!rec) return null;
  const { plan, reasons } = rec;
  const other = plan.key === 'comfort' ? PLANS.peace : PLANS.comfort;
  const w = who(data);

  return (
    <div className="fit">
      <div className="apply-eyebrow">{w.isMe ? 'Your starting point' : `Starting point for ${w.name}`}</div>
      <h1 className="fit-title">
        {plan.name} looks like the right place to start.
      </h1>
      <p className="fit-lede">{plan.tagline}</p>
      <p className="fit-type">{plan.type} that your licensed agent builds with you.</p>

      <div className="fit-why">
        <div className="fit-why-label">Why we suggest starting here</div>
        <ul>
          {reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>

      <section className="fit-section">
        <h2>How your cash value grows</h2>
        <p>
          Your cash value earns interest linked to a market index, but it’s never invested in the
          market directly. When the index has a down year, a floor keeps your credited rate from
          going below 0%. When it’s up, you share in the gain up to a cap. Policy charges are
          deducted every month either way, so cash value can still go down.
        </p>
        <CreditingChart />
        <p className="fit-fine">
          Hypothetical example for illustration only — not a policy illustration or a projection
          of any policy’s performance, and it doesn’t show policy charges. Actual caps, floors and
          participation rates vary by policy, are set by the insurer and can change. Your agent
          can provide an insurer illustration showing guaranteed and non-guaranteed values.
        </p>
      </section>

      <section className="fit-section">
        <h2>What these designs can include</h2>
        <div className="fit-benefits">
          {BENEFITS.map((b) => (
            <div className="fit-benefit" key={b.title}>
              <div className="fit-benefit-title">{b.title}</div>
              <p>{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="fit-section">
        <h2>Two ways to build it</h2>
        <div className="fit-compare">
          {[plan, other].map((p) => (
            <div className={`fit-plan ${p.key === plan.key ? 'is-match' : ''}`} key={p.key}>
              {p.key === plan.key && <div className="fit-plan-badge">Your starting point</div>}
              <div className="fit-plan-name">{p.name}</div>
              <p className="fit-plan-tag">{p.tagline}</p>
              <div className="fit-plan-row"><span>Best for</span><span>{p.bestFor}</span></div>
              <div className="fit-plan-row"><span>Issue ages</span><span>{p.ages}</span></div>
            </div>
          ))}
        </div>
        <p className="fit-fine">
          This is a starting point from your answers, not a recommendation. Your licensed agent
          reviews your needs and confirms the right design, coverage amount and funding level with
          you before anything is submitted. {PLAN_NAME_NOTE}
        </p>
      </section>

      <div className="fit-disclosure">
        <p>{IUL_DISCLOSURE}</p>
        <p>{LIVING_BENEFITS_DISCLOSURE}</p>
        <p>This is general education, not tax, legal or investment advice. Talk to a tax professional about your situation.</p>
      </div>

      <div className="apply-nav">
        <button type="button" className="apply-nav-back" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn btn-brass" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}
