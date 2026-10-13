import Reveal from './Reveal';

const values = [
  {
    title: 'Provide for the people who depend on you',
    body: 'Coverage sized to what your household would actually need to keep going.',
  },
  {
    title: 'Leave more behind, not less',
    body: 'A death benefit designed to be far larger than the premiums you pay, as long as the policy stays in force.',
  },
  {
    title: "Protect what you've already built",
    body: "A policy that backs up the years you've already put in, not just the years ahead.",
  },
  {
    title: "Keep the promises you've made",
    body: 'Debts, tuition, a mortgage — the obligations a policy is actually meant to cover.',
  },
  {
    title: "Rest easy knowing it's handled",
    body: "A licensed agent keeps you posted, so you're never wondering where an application stands.",
  },
];

export default function Values() {
  return (
    <section className="values" id="values">
      <div className="container values-grid">
        <Reveal>
          <div className="eyebrow">Old values, new paperwork</div>
          <h2>The same trust insurance was always meant to run on</h2>
          <div className="values-copy">
            <p>
              Newer technology, clear answers, and a much simpler start — built around what
              actually matters to families.
            </p>
          </div>
        </Reveal>

        <Reveal>
          {values.map((v) => (
            <div className="value-row" key={v.title}>
              <div className="value-mark">×</div>
              <div>
                <h4>{v.title}</h4>
                <p>{v.body}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
