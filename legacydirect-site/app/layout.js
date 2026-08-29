import { Roboto_Slab, Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display-raw',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body-raw',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono-raw',
});

export const metadata = {
  title: 'LegacyDirect — Direct protection for you and your family',
  description:
    'See your coverage options for legacy, income protection, and retirement, and follow your application straight through to the insurer decision.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${robotoSlab.variable} ${inter.variable} ${plexMono.variable}`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
