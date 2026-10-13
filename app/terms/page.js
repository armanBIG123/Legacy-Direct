import '../apply/apply.css';
import '../data-use/data-use.css';
import LegalShell from '@/components/legal/LegalShell';
import TermsOfUse from '@/components/legal/TermsOfUse';

export const metadata = {
  title: 'Terms of Use — LegacyDirect',
  description: 'Terms for using LegacyDirect, including text-message terms.',
};

export default function TermsPage() {
  return (
    <LegalShell eyebrow="Terms" title="Terms of Use">
      <TermsOfUse />
    </LegalShell>
  );
}
