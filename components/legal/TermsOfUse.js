import { AGENCY, LEGAL_EFFECTIVE_DATE } from './agency';
import { agencySentence } from './AgencyLine';
import { COMPENSATION_DISCLOSURE } from './disclosures';
import { AGENT_PHONE_DISPLAY, phoneConfigured } from '../term/termConfig';

// Terms of Use, including the text-message program terms that carriers
// require for A2P 10DLC registration. Draft for counsel review.

function Section({ id, title, children }) {
  return (
    <section className="data-use-section" id={id}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function TermsOfUse() {
  const who = AGENCY.legalName ? `${AGENCY.brand} (${AGENCY.legalName})` : AGENCY.brand;
  const law = AGENCY.governingState
    ? `the laws of ${AGENCY.governingState}`
    : 'the laws of the state where our agency is based';

  return (
    <>
      <p className="data-use-effective">Effective {LEGAL_EFFECTIVE_DATE}</p>

      <Section id="agreement" title="Using this site">
        <p>
          These terms apply to legacydirectplan.com and our coverage questionnaires, run by {who}. By
          using the site you agree to them and to our <a href="/privacy">Privacy Policy</a>. You must be
          18 or older and in the United States to use our forms.
        </p>
      </Section>

      <Section id="who" title="Who we are">
        <p>
          {agencySentence()} Our agents can only discuss and sell insurance in states where they hold a
          license, so coverage through us may not be available where you live.
        </p>
        <p>{COMPENSATION_DISCLOSURE}</p>
      </Section>

      <Section id="not-an-offer" title="Estimates, not offers">
        <p>
          Coverage amounts, plan matches, examples and charts on this site are general education and
          starting points based on what you tell us. They are not quotes, offers, recommendations,
          illustrations or promises of coverage, and they aren&rsquo;t tax, legal or investment advice.
          Only the insurance company can decide whether to offer coverage and at what price, after you
          apply. If a policy is issued, you&rsquo;ll have a free-look period (its length varies by state)
          to review it and cancel for a refund.
        </p>
      </Section>

      <Section id="your-info" title="Information you give us">
        <p>
          Please give accurate information. Answers are saved as you go, as described in our{' '}
          <a href="/privacy#term">Privacy Policy</a>. If you enter information about another person, you
          confirm they&rsquo;ve agreed to you sharing it with us for this request.
        </p>
      </Section>

      <Section id="sms" title="Text message terms">
        <p>
          If you check the optional consent box, {AGENCY.brand} and its licensed agents may send you text
          messages about your coverage request — follow-ups, appointment reminders and information you
          asked for. Consent isn&rsquo;t a condition of buying anything.
        </p>
        <p>
          Message frequency varies. Message and data rates may apply. Reply <strong>STOP</strong> at
          any time to stop; you&rsquo;ll get one message confirming you&rsquo;re unsubscribed. Reply{' '}
          <strong>HELP</strong> for help, or email{' '}
          <a href={`mailto:${AGENCY.privacyEmail}`}>{AGENCY.privacyEmail}</a>
          {phoneConfigured ? <> or call {AGENT_PHONE_DISPLAY}</> : null}. Carriers aren&rsquo;t liable
          for delayed or undelivered messages. We don&rsquo;t share your mobile number or text consent
          with anyone for marketing.
        </p>
      </Section>

      <Section id="calls" title="Phone calls">
        <p>
          Tapping a Call button opens your phone&rsquo;s dialer to reach a licensed agent. Your call
          provider&rsquo;s normal rates apply. If a call is recorded, we&rsquo;ll tell you at the start.
        </p>
      </Section>

      <Section id="acceptable-use" title="Acceptable use">
        <p>
          Don&rsquo;t use bots or scripts on the site, submit false information or someone else&rsquo;s
          information without permission, try to get around our security checks, or interfere with how
          the site works.
        </p>
      </Section>

      <Section id="ownership" title="Our content">
        <p>
          The site&rsquo;s text, design and logos belong to {AGENCY.brand} or its licensors. You may view
          and print pages for your own personal use.
        </p>
      </Section>

      <Section id="liability" title="Disclaimers and limits">
        <p>
          We work to keep the site accurate and available, but it&rsquo;s provided &ldquo;as is.&rdquo;
          To the extent the law allows, we aren&rsquo;t liable for indirect or consequential losses from
          using the site. Nothing in these terms limits rights you have under insurance or
          consumer-protection laws that can&rsquo;t be waived.
        </p>
      </Section>

      <Section id="law" title="Governing law and changes">
        <p>
          These terms are governed by {law}, except where your state&rsquo;s insurance laws apply. We may
          update these terms by posting a new version here with a new effective date.
        </p>
      </Section>
    </>
  );
}
