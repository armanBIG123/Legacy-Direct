import '../apply/apply.css';
import './data-use.css';
import LegalShell from '@/components/legal/LegalShell';
import PrivacyPolicy from '@/components/legal/PrivacyPolicy';

// Older links (including /data-use#term in the quizzes) land here. Same
// content as /privacy so there's only one policy to keep accurate.
export const metadata = {
  title: 'How your information is used — LegacyDirect',
  description: 'What LegacyDirect collects, how it’s used and shared, and how to opt out or delete your information.',
};

export default function DataUsePage() {
  return (
    <LegalShell eyebrow="Privacy" title="How your information is used" lede="This is our full Privacy Policy.">
      <PrivacyPolicy />
    </LegalShell>
  );
}
