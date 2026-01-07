import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Menü',
    description: 'NOCCA Coffee\'nin zengin menüsünü keşfedin. Taze kahveler, tatlılar ve özel içecekler sizi bekliyor.',
    alternates: {
        canonical: 'https://www.noccacoffee.com.tr/menu',
    },
};

export default function MenuLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
