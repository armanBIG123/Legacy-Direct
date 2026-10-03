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
              <li><a href="#">LegacyDirect Gold IUL</a></li>
              <li><a href="#">LegacyDirect Freedom IUL</a></li>
              <li><a href="#">Do I need a medical exam?</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Learn</h5>
            <ul>
              <li><a href="#">Insurance guide</a></li>
              <li><a href="#">Coverage options</a></li>
              <li><a href="#">FAQs</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Company</h5>
            <ul>
              <li><a href="#">About us</a></li>
              <li><a href="#">For agents</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-legal">
          LegacyDirect is an application and tracking service, not an insurance company.
          Starting a plan is not an offer or guarantee of coverage; coverage and pricing are
          determined by the underwriting insurer.
        </div>

        <div className="footer-bottom">
          <span>© 2026 LegacyDirect. All rights reserved.</span>
          <span>Template concept — not a licensed insurance offering.</span>
        </div>
      </div>
    </footer>
  );
}
