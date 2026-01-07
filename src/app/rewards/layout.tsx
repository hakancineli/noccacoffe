import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Nocca Rewards',
    description: 'NOCCA REWARDS ile her kahvenizde yıldız kazanın. Size özel indirimler, hediyeler ve avantajlı kampanyaları kaçırmayın.',
    alternates: {
        canonical: 'https://www.noccacoffee.com.tr/rewards',
    },
};

export default function RewardsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
