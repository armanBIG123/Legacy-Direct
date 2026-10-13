import Reveal from './Reveal';

const steps = [
  {
    num: '01',
    title: 'Answer a few questions',
    body:
      "Tell us what you want your coverage to do and where you stand today. Your agent will tell you early on whether the insurer is likely to need medical underwriting.",
  },
  {
    num: '02',
    title: 'Discover your direct option',
    body:
      'See a starting point built from your answers, then talk it through with a licensed agent who compares options with you and helps you apply — only if you decide to.',
  },
  {
    num: '03',
    title: 'Stay in the loop',
    body:
      "Your agent keeps you updated from application to the insurer's decision. If you're approved, you'll get your policy to review, with a free-look period to cancel for a refund.",
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
