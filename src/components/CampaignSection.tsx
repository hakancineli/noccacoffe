'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaCopy, FaCheck } from 'react-icons/fa';

export default function CampaignSection() {
    const [copied, setCopied] = useState(false);
    const campaignCode = 'KAHVE5';

    const handleCopy = () => {
        navigator.clipboard.writeText(campaignCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="py-16 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Main Campaign Card */}
                <div className="bg-[#E8F5E9] rounded-3xl overflow-hidden shadow-xl mb-20 flex flex-col md:flex-row">

                    {/* Text Content */}
                    <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">Özel Kampanya</h2>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center text-lg font-medium text-gray-700">
                                <span className="text-2xl mr-3">🎉</span>
                                6. Kahve Hediye!
                            </div>
                            <div className="flex items-center text-lg font-medium text-gray-700">
                                <span className="text-2xl mr-3">☕</span>
                                5 kahve alana 6. kahve ücretsiz
                            </div>
                            <div className="flex items-center text-lg font-medium text-gray-700">
                                <span className="text-2xl mr-3">🍰</span>
                                5. kahve + tatlı %20 indirim
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-8 italic">
                            Kampanya 31 Aralık 2024 tarihine kadar geçerlidir.
                        </p>

                        <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 w-full max-w-sm">
                            <p className="text-sm font-bold text-gray-900 mb-2">Kampanya Kodu:</p>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-gray-100 rounded-lg px-4 py-3 font-mono font-bold text-xl text-center tracking-widest text-nocca-green border border-gray-200">
                                    {campaignCode}
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="bg-gray-900 text-white px-6 rounded-lg font-bold hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center min-w-[100px]"
                                >
                                    {copied ? (
                                        <>
                                            <FaCheck className="mr-2" /> Kopyalandı
                                        </>
                                    ) : (
                                        <>
                                            <FaCopy className="mr-2" /> Kopyala
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <Link
                                href="/menu"
                                className="inline-block bg-[#1B3C35] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#142e28] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Kampanyayı Gör
                            </Link>
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="relative w-full md:w-1/2 min-h-[400px] md:min-h-full bg-[#D7E8D5]">
                        <Image
                            src="/images/products/brownie.jpg"
                            alt="Özel Kampanya"
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Overlay Gradient for better text integration if needed, usually clean looks better though */}
                    </div>
                </div>

                {/* How It Works Section */}
                <div className="text-center">
                    <h2 className="text-3xl font-black text-gray-900 mb-12">Nasıl Çalışır?</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connector Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-gray-100 z-0"></div>

                        {/* Step 1 */}
                        <div className="relative z-10 bg-white p-6 rounded-2xl hover:shadow-lg transition-shadow duration-300">
                            <div className="w-24 h-24 bg-[#E8F5E9] rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-black text-[#1B3C35] shadow-inner">
                                1
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Üye Ol</h3>
                            <p className="text-gray-500 leading-relaxed">
                                NOCCA REWARDS'a ücretsiz üye olun.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 bg-white p-6 rounded-2xl hover:shadow-lg transition-shadow duration-300">
                            <div className="w-24 h-24 bg-[#E8F5E9] rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-black text-[#1B3C35] shadow-inner">
                                2
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Puan Topla</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Her alışverişinizde puan kazanın.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 bg-white p-6 rounded-2xl hover:shadow-lg transition-shadow duration-300">
                            <div className="w-24 h-24 bg-[#E8F5E9] rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-black text-[#1B3C35] shadow-inner">
                                3
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Ödülleri Keşfet</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Kazandığınız puanlarla ödüllerinizi alın.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
