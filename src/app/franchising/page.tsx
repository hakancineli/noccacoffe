import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FranchiseBanner from '@/components/FranchiseBanner';
import Image from 'next/image';
import { FaChartPie, FaUsers, FaStore, FaGraduationCap } from 'react-icons/fa';

export const metadata: Metadata = {
    title: 'Franchising | NOCCA Coffee İş Ortaklığı',
    description: 'Kendi kahve dükkanınızı açın. NOCCA Coffee franchising sistemi ile profesyonel destek ve karlı bir iş modeli sizi bekliyor.',
};

export default function FranchisingPage() {
    return (
        <main className="bg-white">
            <Navbar />

            {/* Hero Section for Franchise Page */}
            <section className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
                <Image
                    src="/images/franchise.jpg"
                    alt="Franchise Opportunity"
                    fill
                    className="object-cover brightness-[0.4]"
                    priority
                />
                <div className="relative z-10 text-center px-6">
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-6 animate-slide-up leading-tight">
                        Geleceği Birlikte <br className="hidden sm:block" /> <span className="text-[#D7E8D5]">Demleyelim</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-medium leading-relaxed">
                        NOCCA Coffee ailesinin bir parçası olun, global standartlarda bir işletme sahibi olma fırsatını yakalayın.
                    </p>
                </div>
            </section>

            {/* Why Nocca Section */}
            <section className="py-16 md:py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 uppercase tracking-tight">Neden NOCCA Coffee?</h2>
                        <div className="w-20 h-1.5 bg-[#1B3C35] mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-[#E8F5E9] rounded-2xl flex items-center justify-center text-[#1B3C35] text-2xl md:text-3xl mb-6 group-hover:scale-110 transition-transform">
                                <FaChartPie />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold bg-[#1B3C35] text-white inline-block px-3 py-1 rounded-lg mb-4">Karlı Model</h3>
                            <p className="text-sm md:text-base text-gray-600 leading-relaxed">Düşük işletme maliyetleri ve yüksek kar marjı ile hızlı geri dönüş sağlayan sürdürülebilir bir sistem.</p>
                        </div>

                        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-[#E8F5E9] rounded-2xl flex items-center justify-center text-[#1B3C35] text-2xl md:text-3xl mb-6 group-hover:scale-110 transition-transform">
                                <FaStore />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold bg-[#1B3C35] text-white inline-block px-3 py-1 rounded-lg mb-4">Konsept Destek</h3>
                            <p className="text-sm md:text-base text-gray-600 leading-relaxed">Mimari proje, dekorasyon ve uygulama süreçlerinde imza konseptimize uygun tam profesyonel destek.</p>
                        </div>

                        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-[#E8F5E9] rounded-2xl flex items-center justify-center text-[#1B3C35] text-2xl md:text-3xl mb-6 group-hover:scale-110 transition-transform">
                                <FaGraduationCap />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold bg-[#1B3C35] text-white inline-block px-3 py-1 rounded-lg mb-4">Eğitim Akademi</h3>
                            <p className="text-sm md:text-base text-gray-600 leading-relaxed">Barista eğitimi, işletme yönetimi ve müşteri ilişkileri konularında uygulamalı ve teorik akademi desteği.</p>
                        </div>

                        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-[#E8F5E9] rounded-2xl flex items-center justify-center text-[#1B3C35] text-2xl md:text-3xl mb-6 group-hover:scale-110 transition-transform">
                                <FaUsers />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold bg-[#1B3C35] text-white inline-block px-3 py-1 rounded-lg mb-4">Güçlü Marka</h3>
                            <p className="text-sm md:text-base text-gray-600 leading-relaxed">Sadık müşteri kitlesi ve güçlü sosyal medya varlığı ile pazarlama yükünüzü üzerinden alıyoruz.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Banner with WhatsApp */}
            <FranchiseBanner />

            <Footer />
        </main>
    );
}
