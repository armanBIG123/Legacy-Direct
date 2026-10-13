// Who LegacyDirect legally is. Fill these in before running ads — insurance
// advertising has to identify the licensed agency behind it (NAIC Model
// Reg. #570 §4.S), and the privacy policy needs a real contact and address.
//
// Every page footer, the privacy policy and the terms read from here, so
// this is the only place to edit.
export const AGENCY = {
  brand: 'LegacyDirect',

  // The licensed agency that does business as LegacyDirect, exactly as it
  // appears on your agency license, e.g. 'Example Insurance Group LLC'.
  legalName: '',

  // Agency National Producer Number (NPN). Find it at nipr.com.
  npn: '',

  // Mailing address for privacy requests and marketing emails (CAN-SPAM).
  address: '',

  // Two-letter codes for every state where the AGENCY and its agents are
  // licensed for life insurance, e.g. ['AR', 'TX', 'NV'].
  licensedStates: [],

  // Where privacy, opt-out and deletion requests go. Create this address
  // (Cloudflare → Email → Email Routing can forward it to your inbox).
  privacyEmail: 'privacy@legacydirectplan.com',

  // State whose law governs the Terms of Use (usually the agency's home state).
  governingState: '',
};

export const agencyConfigured = !!(AGENCY.legalName && AGENCY.npn && AGENCY.address && AGENCY.licensedStates.length);

// When the notices on the privacy and terms pages last changed.
export const LEGAL_EFFECTIVE_DATE = 'October 13, 2026';
