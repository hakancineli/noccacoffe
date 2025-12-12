import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'NOCCA Coffee',
  description: 'NOCCA Coffee - Kaliteli Kahve Deneyimi',
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
