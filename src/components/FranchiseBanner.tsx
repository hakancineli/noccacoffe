'use client';

import Image from 'next/image';
import { FaWhatsapp, FaChartLine, FaCoffee, FaHandshake } from 'react-icons/fa';

export default function FranchiseBanner() {
    const whatsappNumber = '90554512034';
    const message = encodeURIComponent('Merhaba, NOCCA Coffee franchising hakkında bilgi almak istiyorum.');
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    return (
        <section id="franchising" className="relative py-24 overflow-hidden bg-[#1B3C35]">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl translate-x-1/2 translate-y-1/2"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Left Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white text-sm font-bold mb-6 border border-white/20">
                            <span className="mr-2">🚀</span> Büyüyen Ailemize Katılın
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 leading-tight">
                            Kendi <span className="text-[#D7E8D5]">NOCCA Coffee</span> Şubenizi Açın
                        </h2>
                        <p className="text-xl text-[#D7E8D5]/80 mb-10 max-w-2xl mx-auto lg:mx-0">
                            İstanbul'un en hızlı büyüyen kahve zincirlerinden biri olan NOCCA Coffee ile karlı ve sürdürülebilir bir iş modeline ortak olun.
                        </p>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                            <div className="flex items-center justify-center lg:justify-start gap-3 text-white">
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                    <FaChartLine className="text-lg" />
                                </div>
                                <span className="font-bold">Hızlı ROI</span>
                            </div>
                            <div className="flex items-center justify-center lg:justify-start gap-3 text-white">
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                    <FaCoffee className="text-lg" />
                                </div>
                                <span className="font-bold">Premium Kalite</span>
                            </div>
                            <div className="flex items-center justify-center lg:justify-start gap-3 text-white">
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                    <FaHandshake className="text-lg" />
                                </div>
                                <span className="font-bold">Tam Destek</span>
                            </div>
                        </div>

                        {/* WhatsApp Button */}
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 bg-[#25D366] text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-[#1fb355] transition-all transform hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(37,211,102,0.3)] group"
                        >
                            <FaWhatsapp className="text-3xl group-hover:rotate-12 transition-transform" />
                            <span>Franchise Başvurusu</span>
                        </a>
                        <p className="mt-4 text-[#D7E8D5]/60 text-sm">
                            Hemen WhatsApp üzerinden bizimle iletişime geçin.
                        </p>
                    </div>

                    {/* Right Image */}
                    <div className="flex-1 w-full max-w-xl lg:max-w-none">
                        <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl group border-8 border-white/5">
                            <Image
                                src="/images/franchise.jpg"
                                alt="NOCCA Coffee Franchise Opportunity"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1B3C35]/60 to-transparent"></div>

                            {/* Floating Card */}
                            <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#1B3C35] rounded-full flex items-center justify-center text-white text-xl">
                                        ✨
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 leading-none mb-1 text-lg">Başarıya Ortak Olun</h4>
                                        <p className="text-sm text-gray-500">Kendi işinizin patronu olmanın tam zamanı.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
