import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Hakkımızda',
    description: 'NOCCA Coffee\'nin hikayesi, misyonu ve vizyonu. Kahve tutkumuzu ve kalite standartlarımızı keşfedin.',
    alternates: {
        canonical: 'https://www.noccacoffee.com.tr/about',
    },
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black/50 z-10" />
                <Image
                    src="/images/logo/noccacoffee.jpeg"
                    alt="NOCCA Coffee"
                    fill
                    className="object-cover scale-110 blur-sm opacity-60"
                    priority
                />
                <div className="relative z-20 text-center px-4">
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">HAKKIMIZDA</h1>
                    <div className="w-24 h-2 bg-nocca-green mx-auto rounded-full" />
                </div>
            </section>

            {/* Content Section */}
            <section className="max-w-4xl mx-auto px-4 py-20">
                <div className="prose prose-lg prose-nocca mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nocca Coffee-nin Hikayesi</h2>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        NOCCA Coffee, kahve tutkusunu profesyonellikle birleştiren, misafirlerine sadece bir fincan kahve değil, unutulmaz bir deneyim sunmayı hedefleyen modern bir kahve zinciridir.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 my-16">
                        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-bold text-nocca-green mb-4">Misyonumuz</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Dünyanın en seçkin kahve çekirdeklerini, en doğru kavurma teknikleri ve özenli hazırlık süreçleriyle harmanlayarak her yudumda mükemmelliği sunmak.
                            </p>
                        </div>
                        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-bold text-nocca-green mb-4">Vizyonumuz</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Yenilikçi yaklaşımlarımız ve ödün vermediğimiz kalite standartlarımızla, Türkiye-nin ve dünyanın en çok tercih edilen kahve destinasyonlarından biri olmak.
                            </p>
                        </div>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        Her bir çekirdeğin arkasındaki emeğe saygı duyuyor, çiftçiden fincana kadar uzanan bu eşsiz yolculuğu şeffaf ve sürdürülebilir bir şekilde yönetiyoruz. Baristalarımızın uzmanlığı ve misafirperverlik anlayışımızla, NOCCA Coffee-yi sadece bir durak değil, bir yaşam alanı haline getiriyoruz.
                    </p>

                    <div className="mt-20 p-10 bg-nocca-light-green rounded-3xl text-white text-center">
                        <h3 className="text-2xl font-bold mb-4">Tutkuyla Kavruldu, Sevgiyle Sunuldu.</h3>
                        <p className="opacity-90 max-w-xl mx-auto italic">
                            "NOCCA Coffee ailesi olarak, her sabah aynı heyecanla kapılarımızı açıyor ve sizleri en taze aromalarla buluşturuyoruz."
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
