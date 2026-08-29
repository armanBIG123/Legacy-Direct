import Reveal from './Reveal';

export default function Hero() {
  return (
    <section className="hero" id="start">
      <div className="container hero-grid">
        <Reveal>
          <div className="eyebrow on-ink">Direct Protection for you and your Family</div>
          <h1>
            Coverage your family can count on — <em>explained before you sign, not after.</em>
          </h1>
          <p className="lede">
            Discover your options whether it comes to protecting your legacy, income, or
            retirement. The insurer makes the final decision — LegacyDirect lets you see your
            options directly.
          </p>
          <div className="hero-ctas">
            <a href="#" className="btn btn-brass">Start my plan</a>
            <a href="#how" className="btn btn-outline">See how it works</a>
          </div>
          <div className="trust-row">
            <div className="trust-item">
              <svg width="14" height="14" viewBox="0 0 14 14">
                <path d="M1 7l4 4 8-8" stroke="#E2C465" strokeWidth="1.6" fill="none" />
              </svg>
              Look around before signing in
            </div>
            <div className="trust-item">
              <svg width="14" height="14" viewBox="0 0 14 14">
                <path d="M1 7l4 4 8-8" stroke="#E2C465" strokeWidth="1.6" fill="none" />
              </svg>
              Exam-free may be an option
            </div>
            <div className="trust-item">
              <svg width="14" height="14" viewBox="0 0 14 14">
                <path d="M1 7l4 4 8-8" stroke="#E2C465" strokeWidth="1.6" fill="none" />
              </svg>
              Nothing to pay today
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="policy-card">
            <div className="policy-card-tab">
              <span>Policy Preview</span>
              <span>Sample</span>
            </div>
            <div className="policy-card-body">
              <div className="label">Requested coverage</div>
              <div className="amount">$500,000</div>
              <div className="plan-name">LegacyDirect Gold IUL</div>
              <div className="policy-rows">
                <div className="policy-row"><span>Planned budget</span><span>$3,600 / yr</span></div>
                <div className="policy-row"><span>Medical exam</span><span>Exam-free possible</span></div>
                <div className="policy-row"><span>Next action</span><span>Review your plan</span></div>
              </div>
              <div className="policy-foot">
                Example only — final price and eligibility are confirmed by the insurer.
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
