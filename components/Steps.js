import Reveal from './Reveal';

const steps = [
  {
    num: '01',
    title: 'Answer a few questions',
    body:
      "Help us understand what your goals are and where you currently stand. We'll let you know early on if any medical underwriting will be needed to get approved.",
  },
  {
    num: '02',
    title: 'Discover your direct option',
    body:
      'Once you have an idea of what plans are available to you, decide whether to continue on your own or pick up where you left off with a licensed agent to guide you the rest of the way.',
  },
  {
    num: '03',
    title: 'View the results',
    body:
      "Get a chance to follow along with the carrier's steps from submission to the final decision. Once approved, the finalized policy will be delivered directly to your home.",
  },
];

export default function Steps() {
  return (
    <section className="steps" id="how">
      <div className="container">
        <Reveal className="section-head">
          <div className="eyebrow">A more direct solution</div>
          <h2>Three steps, nothing hidden in between</h2>
          <p>
            Start with a guided questionnaire that helps you navigate what coverage best fits
            you and your family&apos;s needs.
          </p>
        </Reveal>

        <div className="step-list">
          {steps.map((s) => (
            <Reveal className="step" key={s.num}>
              <div className="step-num">{s.num}</div>
              <div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
