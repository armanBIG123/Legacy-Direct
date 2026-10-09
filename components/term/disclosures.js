// Every consumer-facing disclosure on the term funnel lives here, so
// compliance can review one file. When any wording changes, bump
// DISCLOSURE_VERSION — it's saved with each lead as proof of exactly what
// the person was shown.
export const DISCLOSURE_VERSION = 'term-2026-10-09';

// Shown before they start answering (landing hero + first question).
export const SAVE_NOTICE =
  'Your answers are saved as you go — even if you don’t finish — so a licensed agent can help with your request.';

// Shown on the contact screen, above the fields.
export const CONTACT_NOTICE =
  'What you type here is saved as you enter it, even if you don’t tap the button. A licensed LegacyDirect agent may contact you at the email or phone number you provide about this coverage request.';

// Shown next to Call buttons inside the quiz.
export const CALL_NOTICE =
  'When you call, the licensed agent who answers can see the answers you’ve already given, so you don’t have to repeat them.';

// Optional, unchecked by default. Required before any automated or
// prerecorded calls or texts. Manual calls by an agent don't use it.
export const CONSENT_WORDING =
  'I agree that LegacyDirect and its licensed agents may call and text me at the number above about my coverage request, including using automated technology and prerecorded or artificial voice messages. Consent isn’t a condition of buying anything. Message and data rates may apply. Reply STOP to opt out.';
