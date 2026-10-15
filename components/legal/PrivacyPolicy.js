import { AGENCY, LEGAL_EFFECTIVE_DATE } from './agency';
import { agencySentence } from './AgencyLine';
import { COMPENSATION_DISCLOSURE } from './disclosures';
import { AGENT_PHONE_DISPLAY, phoneConfigured } from '../term/termConfig';
import { CONSENT_WORDING, DISCLOSURE_VERSION } from '../term/disclosures';
import AdChoicesLink from '../tracking/AdChoicesLink';

// The full privacy policy. Rendered at /privacy and /data-use (older links
// point there, including /data-use#term), so section ids must stay stable.
//
// Written to cover: California Online Privacy Protection Act (CalOPPA,
// Bus. & Prof. Code §22575) elements, carrier A2P 10DLC texting rules (no
// sharing of mobile numbers or opt-in data), the FCC opt-out rule (any
// reasonable means, honored within 10 business days), and insurance
// privacy basics. Have counsel review before relying on it.

function Section({ id, title, children }) {
  return (
    <section className="data-use-section" id={id}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function PrivacyPolicy() {
  const name = AGENCY.legalName ? `${AGENCY.brand} (${AGENCY.legalName})` : AGENCY.brand;
  const phone = phoneConfigured ? AGENT_PHONE_DISPLAY : null;
  const contact = (
    <>
      email <a href={`mailto:${AGENCY.privacyEmail}`}>{AGENCY.privacyEmail}</a>
      {phone ? <> or call {phone}</> : null}
    </>
  );

  return (
    <>
      <p className="data-use-effective">Effective {LEGAL_EFFECTIVE_DATE}</p>

      <nav className="data-use-toc" aria-label="On this page">
        <a href="#collect">What we collect</a>
        <a href="#term">Saved as you go</a>
        <a href="#call">When you tap Call</a>
        <a href="#use">How we use it</a>
        <a href="#share">Who we share it with</a>
        <a href="#tracking">Ad tracking</a>
        <a href="#contact">Calls, texts and email</a>
        <a href="#choices">Your choices</a>
        <a href="#retention">How long we keep it</a>
        <a href="#contact-us">Contact us</a>
      </nav>

      <Section id="who" title="Who we are">
        <p>
          {agencySentence()} This policy explains what {name} (&ldquo;we&rdquo;) collects through
          legacydirectplan.com, our coverage questionnaires and our phone line, and what we do with it.
        </p>
      </Section>

      <Section id="collect" title="Information we collect">
        <p>
          <strong>What you enter.</strong> Depending on the questionnaire: your name and the name of
          the person to be covered, email, mobile number, date of birth, ZIP code and state, who the
          coverage is for, your coverage goals, income or mortgage balance, people who depend on you,
          tobacco use, height, weight, sex as listed on an application, U.S. citizenship or residency
          status, budget, timing, and the choices you make about calls, texts and email. If you enter
          information about someone else, please make sure they&rsquo;re okay with you sharing it.
        </p>
        <p>
          <strong>Collected automatically.</strong> Your IP address, browser and device type, the page
          address you used, the site that referred you, any ad-campaign tags or click IDs in the link
          you followed (for example utm_campaign, gclid or fbclid), and the time of each save. Campaign
          details are kept in your browser&rsquo;s session storage, which clears when you close the
          tab. We don&rsquo;t use session-recording tools.
        </p>
        <p>
          <strong>Meta Pixel, only if you allow it.</strong> If you tap &ldquo;Allow&rdquo; in our
          ad-tracking banner, the Meta Pixel (from Meta Platforms, which runs Facebook and Instagram)
          loads and uses cookies to collect information about your visit — the pages you view, the
          address of each page, your browser, device and IP address, and three events: viewing a page,
          finishing a questionnaire, and tapping Call. Meta may connect this with information it
          already has about you to measure our ads and decide who sees them. We don&rsquo;t send Meta
          your answers, name, email or phone number. If you choose &ldquo;No thanks,&rdquo; or your
          browser sends a Global Privacy Control signal, the pixel doesn&rsquo;t load.
        </p>
        <p>
          <strong>When you call us.</strong> Your phone number and notes the agent takes about your
          request. If a call is ever recorded, we&rsquo;ll tell you at the start of the call.
        </p>
        <p>We don&rsquo;t ask for your Social Security number online.</p>
      </Section>

      <Section id="term" title="Your answers are saved as you go">
        <p>
          When you answer questions in our questionnaires, your answers are saved as you enter them —
          even if you don&rsquo;t finish or don&rsquo;t press the final button. That includes contact
          details once you type them. We do this so a licensed agent can help with the request you
          started and so you don&rsquo;t have to start over. A licensed agent may contact you about
          that request at the email or phone number you entered.
        </p>
        <p>
          Automated or prerecorded calls and texts are only used if you check the optional consent
          box, which reads: &ldquo;{CONSENT_WORDING}&rdquo; Checking it is never required to get help
          or buy anything.
        </p>
      </Section>

      <Section id="call" title="When you tap “Call”">
        <p>
          Tapping a Call button connects you to a licensed {AGENCY.brand} agent. At that moment we save
          the answers you&rsquo;ve given so far, and the agent who takes your call can see them, so you
          don&rsquo;t have to repeat yourself. They aren&rsquo;t shared with anyone else by tapping
          Call.
        </p>
      </Section>

      <Section id="use" title="How we use your information">
        <p>
          To respond to your request; to contact you about it by phone, text or email as described
          below; to compare coverage options and prepare quotes and applications with you; to keep
          records of what you agreed to and when (including the notices you were shown — currently
          version {DISCLOSURE_VERSION}); to keep the site secure and block automated abuse; to see
          which ads and pages bring people to us; and to meet legal and regulatory duties.
        </p>
      </Section>

      <Section id="share" title="Who we share it with">
        <p>
          <strong>Our licensed agents</strong>, so they can help you.
        </p>
        <p>
          <strong>Insurance companies</strong>, only when you decide to apply with one. The insurer
          (and the underwriting services it uses, with your authorization on its application) then
          handles your information under its own privacy notice.
        </p>
        <p>
          <strong>Service providers</strong> that run the site for us under contract and only on our
          instructions: Cloudflare (website hosting and the security check that blocks bots),
          Supabase (secure database), Resend (delivers new-request alerts to our team), and Google
          Fonts (delivers the site&rsquo;s typefaces, which shares your IP address with Google).
        </p>
        <p>
          <strong>Meta, only if you allow it</strong>, through the Meta Pixel described above. Meta
          uses that information under its own privacy policy, including to measure and target ads.
        </p>
        <p>
          <strong>When the law requires it</strong> — for example, to respond to a regulator, a court
          order or to protect against fraud — or as part of a sale or merger of our business, in which
          case this policy continues to apply.
        </p>
        <p>
          <strong>We do not sell your personal information.</strong> Some state laws treat the Meta
          Pixel as &ldquo;sharing&rdquo; for targeted advertising; it only runs if you allow it, and you
          can turn it off at any time (see <a href="#tracking">Ad tracking</a>). We don&rsquo;t share
          your information with other companies for their own marketing. No mobile information will
          be shared with third parties or affiliates for marketing or promotional purposes.
          Text-message opt-in data and consent are never shared with any third party.
        </p>
      </Section>

      <Section id="contact" title="Calls, texts and email">
        <p>
          A licensed agent may call, text or email you about the request you started. We only use
          automated technology or prerecorded or artificial voice messages if you gave consent by
          checking the optional box. Consent isn&rsquo;t a condition of buying anything.
        </p>
        <p>
          <strong>Text messages:</strong> messages are about your coverage request (follow-ups,
          appointment reminders and the information you asked for). Message frequency varies. Message
          and data rates may apply. Reply <strong>STOP</strong> to stop texts or <strong>HELP</strong>{' '}
          for help. Carriers aren&rsquo;t liable for delayed or undelivered messages.
        </p>
        <p>
          <strong>Email:</strong> every marketing email includes a way to unsubscribe. We&rsquo;ll still
          send messages you need about a request or policy you have with us.
        </p>
      </Section>

      <Section id="choices" title="Your choices">
        <p>
          <strong>Stop calls or texts</strong> any reasonable way — reply STOP, tell your agent, or{' '}
          {contact}. We act on these requests right away, and always within 10 business days, and we
          add your number to our internal do-not-call list.
        </p>
        <p>
          <strong>See, correct or delete your information:</strong> {contact}. We&rsquo;ll confirm
          it&rsquo;s you, then respond within 45 days. We may keep records the law requires us to keep
          (such as consent and do-not-call records, and records about policies you applied for).
        </p>
        <p>
          <strong>State privacy rights.</strong> Depending on where you live, state law may give you
          additional rights, such as the right to know, correct or delete personal information, or to
          opt out of its sale or use for targeted advertising. We don&rsquo;t sell personal
          information. To opt out of targeted advertising, choose &ldquo;No thanks&rdquo; in our banner,
          use the <AdChoicesLink label="Ad tracking choices" /> link at the bottom of any page, or turn
          on Global Privacy Control in your browser — we treat it as an opt-out. To use any other right
          available to you, {contact}; you may appeal a decision by replying to our response. California residents: we don&rsquo;t share
          personal information with third parties for their direct-marketing purposes. Nevada
          residents: we don&rsquo;t sell covered information.
        </p>
      </Section>

      <Section id="tracking" title="Ad tracking, Do Not Track and Global Privacy Control">
        <p>
          The only third-party tracking on this site is the Meta Pixel, and it loads only if you tap
          &ldquo;Allow&rdquo; in our banner. When it runs, Meta can collect information about your
          activity on our site over time and connect it with your activity on other sites and apps.
          Your choice is saved in this browser; change it any time with the{' '}
          <AdChoicesLink label="Ad tracking choices" /> link at the bottom of every page.
        </p>
        <p>
          We treat a browser&rsquo;s Global Privacy Control signal as &ldquo;No&rdquo; — the pixel
          won&rsquo;t load. Our site doesn&rsquo;t otherwise respond to &ldquo;Do Not Track&rdquo;
          signals, because there&rsquo;s no common standard for them. You can also manage how Meta uses
          information for ads in your Facebook or Instagram ad settings.
        </p>
      </Section>

      <Section id="security" title="How we protect it">
        <p>
          Information is encrypted in transit (HTTPS) and stored with a hosting provider that encrypts
          data at rest. Only people who need it to help you can see it, and a security check blocks
          automated submissions. No system is perfectly secure; if a breach affects your information,
          we&rsquo;ll notify you and regulators as the law requires.
        </p>
      </Section>

      <Section id="retention" title="How long we keep it">
        <p>
          We keep your information while we&rsquo;re working on your request and for as long as needed
          to meet insurance and telemarketing record-keeping rules, which can require keeping records
          such as consent for several years. Unfinished requests that never included an email or phone
          number are deleted after 30 days.
        </p>
      </Section>

      <Section id="children" title="Children">
        <p>
          This site isn&rsquo;t directed to children, and you must be 18 or older to use our forms. We
          don&rsquo;t knowingly collect information from children under 13. A parent or guardian may
          provide information about a child to ask about coverage for that child.
        </p>
      </Section>

      <Section id="insurers" title="Insurance company notices">
        <p>
          If you apply for coverage, the insurance company will give you its own privacy notice and,
          where state law requires, a notice of its insurance information practices. State insurance
          privacy laws also apply to how we and the insurer handle your application information.
        </p>
      </Section>

      <Section id="compensation" title="How we’re paid">
        <p>{COMPENSATION_DISCLOSURE.replace('How we’re paid: ', '')}</p>
      </Section>

      <Section id="changes" title="Changes to this policy">
        <p>
          When we change this policy we&rsquo;ll post the new version here with a new effective date.
          If a change materially affects how we use information we already have, we&rsquo;ll give
          notice on this site before it takes effect and ask for consent where the law requires.
        </p>
      </Section>

      <Section id="contact-us" title="Contact us">
        <p>
          Questions or requests: {contact}.
          {AGENCY.address ? <> Mail: {AGENCY.legalName || AGENCY.brand}, {AGENCY.address}.</> : null}
        </p>
      </Section>
    </>
  );
}
