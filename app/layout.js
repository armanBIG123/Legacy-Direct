import './globals.css';

// Fonts load from Google Fonts directly. next/font doesn't apply its CSS
// variables under the Cloudflare (vinext) build, which left every page in
// the browser's default Times New Roman.
const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&family=Roboto+Slab:wght@400;500;600;700&display=swap';

export const metadata = {
  title: 'LegacyDirect — Direct protection for you and your family',
  description:
    'See your life insurance options for legacy, income protection and retirement, then talk it through with a licensed agent.',
};

import MetaPixel from '@/components/tracking/MetaPixel';
import ConsentBanner from '@/components/tracking/ConsentBanner';

// The marketing header and footer live on the homepage itself, so the
// /apply flow gets a focused, distraction-free screen with its own header.
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS_URL} />
      </head>
      <body>
        {children}
        {/* Meta Pixel loads only after the visitor allows it in the banner. */}
        <MetaPixel />
        <ConsentBanner />
      </body>
    </html>
  );
}
