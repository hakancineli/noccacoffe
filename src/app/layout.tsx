import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'NOCCA Coffee - En İyi Kahve Deneyimi',
  description: 'NOCCA Coffee ile taze kavrulmuş kahvelerin tadını çıkarın. Geniş menümüz, lezzetli tatlılarımız ve özel kahve çeşitlerimizle hizmetinizdeyiz.',
  keywords: ['kahve', 'nocca coffee', 'istanbul kahve', 'latte', 'espresso', 'taze kahve', 'kahve siparişi'],
  metadataBase: new URL('https://noccacoffee.com'), // Replace with actual domain
  openGraph: {
    title: 'NOCCA Coffee',
    description: 'En iyi kahve deneyimi NOCCA Coffee\'de.',
    url: 'https://noccacoffee.com',
    siteName: 'NOCCA Coffee',
    locale: 'tr_TR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

import Providers from '@/components/Providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-white">
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
