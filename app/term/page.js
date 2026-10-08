import '../apply/apply.css';
import './term.css';
import TermLanding from '@/components/term/TermLanding';

export const metadata = {
  title: 'Term life coverage — LegacyDirect',
  description:
    'Affordable term life coverage to replace your income, protect your family, or pay off your mortgage. See your starting coverage in two minutes or call a licensed agent.',
};

export default function TermPage() {
  return <TermLanding />;
}
