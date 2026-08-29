import Reveal from './Reveal';

export default function Segments() {
  return (
    <section className="segments" id="families">
      <div className="container">
        <Reveal className="section-head">
          <div className="eyebrow on-ink">Built for the people who keep things running</div>
          <h2>Coverage shaped around the work you do</h2>
          <p>Life insurance built around hardworking families and the people they&apos;re providing for.</p>
        </Reveal>

        <div className="segment-grid">
          <Reveal className="segment-card">
            <div className="segment-icon">
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                <path
                  d="M17 3l4 8 9 1-6.5 6 1.5 9-8-4.5L9 27l1.5-9L4 12l9-1 4-8z"
                  stroke="#E2C465"
                  strokeWidth="1.3"
                  fill="none"
                />
              </svg>
            </div>
            <h3>Planning for Legacy</h3>
            <p>
              Coverage built to leave something behind — a death benefit sized to cover final
              expenses and leave a lasting cushion for the family you&apos;re providing for.
            </p>
          </Reveal>

          <Reveal className="segment-card">
            <div className="segment-icon">
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                <path d="M2 22V11h16v11" stroke="#E2C465" strokeWidth="1.3" />
                <path d="M18 15h7l5 5v2h-2" stroke="#E2C465" strokeWidth="1.3" />
                <circle cx="9" cy="24" r="2.4" stroke="#E2C465" strokeWidth="1.3" />
                <circle cx="24" cy="24" r="2.4" stroke="#E2C465" strokeWidth="1.3" />
              </svg>
            </div>
            <h3>Planning for protection</h3>
            <p>
              Living benefits that let you access part of your coverage while you&apos;re still
              here, if a serious illness or injury keeps you from earning an income.
            </p>
          </Reveal>

          <Reveal className="segment-card">
            <div className="segment-icon">
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                <path d="M3 8c6-3 12-3 14 0v18c-2-3-8-3-14 0V8z" stroke="#E2C465" strokeWidth="1.3" />
                <path d="M31 8c-6-3-12-3-14 0v18c2-3 8-3 14 0V8z" stroke="#E2C465" strokeWidth="1.3" />
              </svg>
            </div>
            <h3>Planning for retirement</h3>
            <p>
              Built-in protection against market downturns, with the potential for tax-free
              income to supplement whatever you&apos;ve already saved.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
