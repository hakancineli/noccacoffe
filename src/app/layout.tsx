import './globals.css';
import { Inter } from 'next/font/google';
import JsonLd from '@/components/JsonLd';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'NOCCA Coffee | En İyi Kahve Deneyimi',
    template: '%s | NOCCA Coffee'
  },
  description: 'NOCCA Coffee ile taze kavrulmuş kahvelerin tadını çıkarın. İstanbul Bahçelievler\'de geniş menümüz, lezzetli tatlılarımız ve özel kahve çeşitlerimizle hizmetinizdeyiz.',
  keywords: ['kahve', 'nocca coffee', 'istanbul kahve', 'bahçelievler kahve', 'taze kahve', 'kahve siparişi', 'üçüncü nesil kahve'],
  metadataBase: new URL('https://www.noccacoffee.com.tr'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'NOCCA Coffee | En İyi Kahve Deneyimi',
    description: 'Taze kavrulmuş kahveler ve lezzetli tatlılar NOCCA Coffee\'de.',
    url: 'https://www.noccacoffee.com.tr',
    siteName: 'NOCCA Coffee',
    images: [
      {
        url: '/images/logo/noccacoffee.jpeg',
        width: 800,
        height: 600,
        alt: 'NOCCA Coffee Logo',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NOCCA Coffee',
    description: 'En iyi kahve deneyimi NOCCA Coffee\'de.',
    images: ['/images/logo/noccacoffee.jpeg'],
    site: '@noccacoffee',
    creator: '@hakancineli',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'njMLsBUiooD33t3RaH3zniJG28vFVkHY2Qjm3yDXl-A',
  },
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <JsonLd />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered: ', registration);
                  }, function(err) {
                    console.log('SW registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
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
