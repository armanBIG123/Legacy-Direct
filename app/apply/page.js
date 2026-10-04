import './apply.css';
import ApplyFlow from '@/components/apply/ApplyFlow';

export const metadata = {
  title: 'Start your plan — LegacyDirect',
  description: 'A few quick questions to see what coverage could look like for you or someone you love.',
};

export default function ApplyPage() {
  return <ApplyFlow />;
}
