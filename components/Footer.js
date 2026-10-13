import { agencySentence, LegalLinks } from './legal/AgencyLine';
import {
  GENERAL_DISCLOSURE,
  COMPENSATION_DISCLOSURE,
  IUL_DISCLOSURE,
  LIVING_BENEFITS_DISCLOSURE,
  TERM_DISCLOSURE,
} from './legal/disclosures';
import { PLAN_NAME_NOTE } from './apply/planSuggestion';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">
              <svg width="30" height="26" viewBox="0 0 30 26" fill="none">
                <path d="M2 21H18" stroke="#E2C465" strokeWidth="1.4" strokeDasharray="3 3" />
                <circle cx="24" cy="21" r="3.4" fill="#C6A030" />
                <path d="M6 4V16" stroke="#EFEAE0" strokeWidth="1.6" />
                <path d="M6 4L14 4" stroke="#EFEAE0" strokeWidth="1.6" />
              </svg>
              <span className="logo-word">
                Legacy<b>Direct</b>
              </span>
            </div>
            <p>
              Designed to be a Direct Solution for Americans to protect their legacy, income,
              and retirement.
            </p>
          </div>

          <div className="footer-col">
            <h5>Coverage</h5>
            <ul>
              <li><a href="/apply">Comfort &amp; Peace IUL</a></li>
              <li><a href="/term">Term life coverage</a></li>
              <li><a href="/term#faq">Do I need a medical exam?</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Learn</h5>
            <ul>
              <li><a href="/#how">How it works</a></li>
              <li><a href="/#families">Who it&apos;s for</a></li>
              <li><a href="/#history">History</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Your information</h5>
            <ul>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Use</a></li>
              <li><a href="/privacy#choices">Opt out or delete my info</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-disclosures">
          <p><strong>{agencySentence()}</strong></p>
          <p>{GENERAL_DISCLOSURE}</p>
          <p><sup>1</sup> {IUL_DISCLOSURE}</p>
          <p><sup>2</sup> {LIVING_BENEFITS_DISCLOSURE}</p>
          <p>{TERM_DISCLOSURE}</p>
          <p>{PLAN_NAME_NOTE}</p>
          <p>{COMPENSATION_DISCLOSURE}</p>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} LegacyDirect. All rights reserved.</span>
          <LegalLinks />
        </div>
      </div>
    </footer>
  );
}
