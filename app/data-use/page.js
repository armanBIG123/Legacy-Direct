import '../apply/apply.css';
import './data-use.css';
import Link from 'next/link';
import ApplyHeader from '@/components/apply/ApplyHeader';

export const metadata = {
  title: 'How application information is used — LegacyDirect',
};

export default function DataUsePage() {
  return (
    <div className="apply-page">
      <ApplyHeader />

      <main className="apply-main">
        <div className="data-use-layout">
          <Link href="/apply" className="data-use-back">
            ← Back to LegacyDirect
          </Link>

          <div className="apply-eyebrow">Data-use notice</div>
          <h1 className="data-use-title">How LegacyDirect uses your application information</h1>
          <p className="apply-subtitle">
            This is the notice referenced during the plan-preview flow.
          </p>

          <div className="data-use-callout">
            <strong>Application information is private.</strong> Access is separated by role. The
            insurer and its approved process control final underwriting, forms, and coverage
            decisions.
          </div>

          <section className="data-use-section">
            <h2>Information you provide</h2>
            <p>
              LegacyDirect may collect contact, identity, family, insurance, financial, lifestyle,
              and health information that you choose to enter while building and submitting a
              plan preview.
            </p>
            <p>
              A saved preview or application can also include your progress, acknowledgements, and
              the time and account connected to a submission.
            </p>
          </section>

          <section className="data-use-section">
            <h2>Why it&rsquo;s used</h2>
            <p>
              Information is used to save your work, prepare a planning request, support a
              licensed advisor, assemble an application, and help the insurer evaluate and
              administer the coverage you request.
            </p>
            <p>
              LegacyDirect does not use a plan preview as a carrier approval, a final rate, or a
              promise of coverage.
            </p>
          </section>

          <section className="data-use-section">
            <h2>Who may receive it</h2>
            <p>
              Information may be shared only as needed with your licensed advisor, the proposed
              insurer, authorized underwriting or evidence providers, and vendors that operate the
              protected application workflow.
            </p>
            <p>
              Medical answers are not shown to unrelated account holders, and LegacyDirect does not
              use application information for unrelated advertising.
            </p>
          </section>

          <section className="data-use-section">
            <h2>Your choices</h2>
            <p>
              Optional marketing or reminder permission is separate from communications needed to
              complete a request. You may decline optional outreach without affecting your ability
              to apply.
            </p>
            <p>
              Electronic-delivery consent includes paper-copy and withdrawal rights. Final carrier
              forms may provide additional rights and instructions.
            </p>
          </section>

          <div className="data-use-not-final">
            <strong>Not a final legal notice.</strong> This plain-language notice supports the plan
            preview workflow. Before real applications are accepted, approved carrier forms and
            legal, privacy, retention, and security review remain required.
          </div>
        </div>
      </main>

      <footer className="apply-footer">
        <div className="apply-footer-inner">
          <span>
            Applying here does not start coverage. Coverage starts only if and when the insurance
            company issues your policy.
          </span>
        </div>
      </footer>
    </div>
  );
}
