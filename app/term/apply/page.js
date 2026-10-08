import '../../apply/apply.css';
import '../term.css';
import TermFlow from '@/components/term/TermFlow';

export const metadata = {
  title: 'See your term coverage — LegacyDirect',
  description: 'Seven quick questions to see your starting term life coverage. Call a licensed agent any time.',
};

export default function TermApplyPage() {
  return <TermFlow />;
}
