'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
    FaRocket,
    FaChartLine,
    FaQrcode,
    FaConciergeBell,
    FaTabletAlt,
    FaShieldAlt,
    FaMagic,
    FaCheckCircle,
    FaCoffee,
    FaArrowRight
} from 'react-icons/fa';
import Link from 'next/link';

export default function SolutionsPage() {
    const [formStatus, setFormStatus] = useState<'idle' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('success');
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-[#E5D9C8]/30 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center">
                        <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tight">
                            Kafenizi <span className="text-[#3E2723]">Geleceğe</span> Taşıyın
                        </h1>
                        <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                            Pahalı ve eski POS sistemlerini unutun. Bulut tabanlı, akıllı ve tamamen işletmenize özel tasarlanmış yeni nesil kafe yönetim sistemini keşfedin.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <a
                                href="#demo-form"
                                className="px-8 py-4 bg-[#3E2723] text-white font-bold rounded-full hover:bg-[#5D4037] transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-xl shadow-[#3E2723]/20"
                            >
                                Ücretsiz Demo İste <FaArrowRight />
                            </a>
                            <Link
                                href="/menu"
                                className="px-8 py-4 bg-white text-[#3E2723] font-bold rounded-full border-2 border-[#3E2723]/10 hover:border-[#3E2723] transition-all flex items-center justify-center"
                            >
                                Örnek Menüyü Gör
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#3E2723]/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-nocca-green/5 rounded-full blur-3xl"></div>
            </section>

            {/* Stats / Quick Info */}
            <section className="py-12 bg-white border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-3xl font-black text-[#3E2723] mb-1">%40</div>
                            <div className="text-sm text-gray-500 font-medium">Verimlilik Artışı</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-[#3E2723] mb-1">15dk</div>
                            <div className="text-sm text-gray-500 font-medium">Kurulum Süresi</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-[#3E2723] mb-1">Sıfır</div>
                            <div className="text-sm text-gray-500 font-medium">Donanım Yatırımı</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-[#3E2723] mb-1">7/24</div>
                            <div className="text-sm text-gray-500 font-medium">Her Yerden Erişim</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Features */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black text-gray-900 mb-4">Tek Ekran, Tam Kontrol</h2>
                        <div className="w-20 h-1.5 bg-nocca-green mx-auto rounded-full mb-6"></div>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            İşletmenizin tüm departmanlarını birbirine bağlayan, veri kaybını önleyen akıllı katmanlar.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Feature 1 */}
                        <div className="group p-8 bg-gray-50 rounded-3xl hover:bg-[#3E2723] transition-all duration-500 shadow-sm border border-gray-100">
                            <div className="w-16 h-16 bg-[#3E2723]/10 group-hover:bg-white/20 rounded-2xl flex items-center justify-center text-3xl text-[#3E2723] group-hover:text-white mb-6 transition-colors">
                                <FaConciergeBell />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white mb-4 transition-colors">Mutfak Bildirim Sistemi</h3>
                            <p className="text-gray-600 group-hover:text-gray-300 transition-colors">
                                Özel senfonik bildirim sesleri ve gerçek zamanlı takip ekranı ile sipariş hazırlama hızını %30 artırın.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group p-8 bg-gray-50 rounded-3xl hover:bg-[#3E2723] transition-all duration-500 shadow-sm border border-gray-100">
                            <div className="w-16 h-16 bg-[#3E2723]/10 group-hover:bg-white/20 rounded-2xl flex items-center justify-center text-3xl text-[#3E2723] group-hover:text-white mb-6 transition-colors">
                                <FaQrcode />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white mb-4 transition-colors">Akıllı QR Menü</h3>
                            <p className="text-gray-600 group-hover:text-gray-300 transition-colors">
                                Müşterileriniz telefonlarından menüyü incelesin, garson beklemeden siparişini versin. İşçilik maliyetinden tasarruf edin.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group p-8 bg-gray-50 rounded-3xl hover:bg-[#3E2723] transition-all duration-500 shadow-sm border border-gray-100">
                            <div className="w-16 h-16 bg-[#3E2723]/10 group-hover:bg-white/20 rounded-2xl flex items-center justify-center text-3xl text-[#3E2723] group-hover:text-white mb-6 transition-colors">
                                <FaChartLine />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white mb-4 transition-colors">Gelişmiş Analizler</h3>
                            <p className="text-gray-600 group-hover:text-gray-300 transition-colors">
                                En çok satan ürünler, saatlik ciro grafikleri ve stok kaçaklarını anında tespit eden yapay zeka destekli raporlar.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Case Study / NOCCA Showcase */}
            <section className="py-24 bg-[#3E2723] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 text-nocca-green font-bold mb-4 uppercase tracking-widest text-sm">
                                <FaCoffee className="text-xl" /> BAŞARI HİKAYESİ: NOCCA COFFEE
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-black mb-8 leading-tight text-[#EAD8C0]">
                                Geleneksel Kafe Ruhunu, Teknolojinin Gücüyle Birleştirdik.
                            </h2>
                            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                                NOCCA Coffee, bu sistemi kullanarak sadece sipariş akışını hızlandırmakla kalmadı; aynı zamanda müşterilerine özel sadakat programı (Nocca Rewards) ile geri dönüş oranlarını %25 artırdı.
                            </p>
                            <ul className="space-y-4 mb-10">
                                <li className="flex items-center gap-3">
                                    <FaCheckCircle className="text-nocca-green text-xl" /> Trendyol Go Entegrasyonu ile tek panel yönetimi
                                </li>
                                <li className="flex items-center gap-3">
                                    <FaCheckCircle className="text-nocca-green text-xl" /> Günlük 500+ siparişin hatasız mutfağa iletimi
                                </li>
                                <li className="flex items-center gap-3">
                                    <FaCheckCircle className="text-nocca-green text-xl" /> Kağıt menü ve fiş maliyetinde %15 tasarruf
                                </li>
                            </ul>
                            <Link
                                href="/about"
                                className="inline-flex items-center gap-2 text-white font-bold hover:text-nocca-green transition-colors"
                            >
                                NOCCA Hikayesini Oku <FaArrowRight />
                            </Link>
                        </div>
                        <div className="flex-1 w-full flex justify-center">
                            <div className="relative w-full max-w-md aspect-[9/16] bg-gray-800 rounded-[3rem] border-[12px] border-gray-900 shadow-2xl overflow-hidden shadow-black/50">
                                {/* Mockup Content */}
                                <div className="absolute inset-0 bg-white p-6 overflow-hidden">
                                    <div className="h-6 w-32 bg-gray-100 rounded-lg mb-8"></div>
                                    <div className="space-y-4">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                                                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                                                    <div className="h-2 w-16 bg-gray-100 rounded"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Glass Header */}
                                <div className="absolute top-0 w-full h-16 bg-gradient-to-b from-white to-transparent pointer-events-none"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing / Offer */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-block px-4 py-2 bg-nocca-green/10 text-nocca-green font-bold text-sm rounded-full mb-6">
                        Lansman Fırsatı
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-8">
                        Pioneer Programına Katılın
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
                        Sistemi kullanan ilk 10 dükkandan biri olun, ömür boyu indirimli fiyat ve ücretsiz kurulum desteği kazanın.
                    </p>

                    <div className="max-w-md mx-auto bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="text-gray-500 mb-2 uppercase font-bold text-sm">Aylık Sadece</div>
                            <div className="text-6xl font-black text-[#3E2723] mb-8">₺1.499<span className="text-xl text-gray-400 font-normal">/ay*</span></div>
                            <ul className="text-left space-y-4 mb-10">
                                <li className="flex items-center gap-3 text-gray-600"><FaCheckCircle className="text-green-500" /> Sınırsız Ürün ve Kategori</li>
                                <li className="flex items-center gap-3 text-gray-600"><FaCheckCircle className="text-green-500" /> Akıllı Mutfak Ekranı</li>
                                <li className="flex items-center gap-3 text-gray-600"><FaCheckCircle className="text-green-500" /> QR Menü Entegrasyonu</li>
                                <li className="flex items-center gap-3 text-gray-600"><FaCheckCircle className="text-green-500" /> 7/24 Teknik Destek</li>
                                <li className="flex items-center gap-3 text-gray-600"><FaCheckCircle className="text-green-500" /> Ücretsiz Başlangıç Kurulumu</li>
                            </ul>
                            <a href="#demo-form" className="block w-full py-4 bg-[#3E2723] text-white font-bold rounded-2xl hover:bg-[#5D4037] transition-all">
                                Hemen Kayıt Ol
                            </a>
                            <p className="mt-4 text-xs text-gray-400 italic">*İlk 10 müşteri için geçerli fiyattır.</p>
                        </div>
                        {/* Decoration */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-nocca-green/10 rounded-full"></div>
                    </div>
                </div>
            </section>

            {/* Form Section */}
            <section id="demo-form" className="py-24 bg-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white border-2 border-[#3E2723]/5 p-8 lg:p-12 rounded-[3.5rem] shadow-sm">
                        <h2 className="text-3xl font-black text-center mb-4 text-[#3E2723]">Ücretsiz Demo Talebi</h2>
                        <p className="text-center text-gray-600 mb-10">
                            Sistemi dükkanınızda nasıl uygulayabileceğimizi konuşmak için formu doldurun, 24 saat içinde sizi arayalım.
                        </p>

                        {formStatus === 'success' ? (
                            <div className="text-center py-10">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                                    <FaCheckCircle />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Talebiniz Alındı!</h3>
                                <p className="text-gray-600">Danışmanımız en kısa sürede sizinle iletişime geçecektir.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Ad Soyad</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 focus:border-[#3E2723] rounded-2xl outline-none transition-all"
                                            placeholder="Hakan Cineli"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">İşletme Adı</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 focus:border-[#3E2723] rounded-2xl outline-none transition-all"
                                            placeholder="X Cafe & Bakery"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">E-posta Adresi</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 focus:border-[#3E2723] rounded-2xl outline-none transition-all"
                                        placeholder="hakan@nocca.com.tr"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Telefon Numarası</label>
                                    <input
                                        required
                                        type="tel"
                                        className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 focus:border-[#3E2723] rounded-2xl outline-none transition-all"
                                        placeholder="05..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Mesajınız (Opsiyonel)</label>
                                    <textarea
                                        className="w-full px-5 py-4 bg-gray-50 border-transparent border-2 focus:border-[#3E2723] rounded-2xl outline-none transition-all"
                                        rows={4}
                                        placeholder="Dükkanım için özel çözüm istiyoruz..."
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-5 bg-[#3E2723] text-white font-black text-lg rounded-2xl hover:bg-[#5D4037] transition-all transform hover:shadow-xl shadow-[#3E2723]/30"
                                >
                                    DEMO TALEBİ GÖNDER
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
