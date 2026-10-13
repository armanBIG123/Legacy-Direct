import '../apply/apply.css';
import '../data-use/data-use.css';
import LegalShell from '@/components/legal/LegalShell';
import PrivacyPolicy from '@/components/legal/PrivacyPolicy';

export const metadata = {
  title: 'Privacy Policy — LegacyDirect',
  description: 'What LegacyDirect collects, how it’s used and shared, and how to opt out or delete your information.',
};

export default function PrivacyPage() {
  return (
    <LegalShell eyebrow="Privacy" title="Privacy Policy" lede="Plain-language answers about your information.">
      <PrivacyPolicy />
    </LegalShell>
  );
}
