import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CampaignSection from '@/components/CampaignSection';

export const metadata: Metadata = {
    title: 'Kampanyalar',
    description: 'NOCCA Coffee dünyasındaki en güncel fırsatlar, indirimler ve size özel sürpriz kampanyaları keşfedin.',
    alternates: {
        canonical: 'https://www.noccacoffee.com.tr/campaigns',
    },
};

export default function CampaignsPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="bg-gray-50 py-16 text-center border-b">
                <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">KAMPANYALAR</h1>
                <p className="text-gray-500 max-w-xl mx-auto italic">"NOCCA Coffee dünyasındaki en güncel fırsatları ve sürprizleri takip edin."</p>
            </div>

            <div className="py-20">
                <CampaignSection />
            </div>

            <section className="max-w-4xl mx-auto px-4 pb-20">
                <div className="bg-nocca-green text-white p-12 rounded-[2rem] text-center shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-all duration-500" />
                    <h2 className="text-3xl font-bold mb-4">Rewards Avantajlarını Kaçırmayın!</h2>
                    <p className="opacity-90 mb-8 max-w-lg mx-auto">Hemen üye olun, her siparişinizde yıldız kazanın ve size özel fırsatlardan yararlanın.</p>
                    <a href="/login" className="inline-block bg-white text-nocca-green px-10 py-4 rounded-xl font-black hover:scale-105 transition-all shadow-xl uppercase tracking-wider text-sm">
                        Hemen Üye Ol
                    </a>
                </div>
            </section>

            <Footer />
        </main>
    );
}
