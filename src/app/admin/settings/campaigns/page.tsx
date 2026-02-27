'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { FaTag, FaClock, FaCheckCircle, FaTimesCircle, FaSave } from 'react-icons/fa';

export default function CampaignSettingsPage() {
    const [settings, setSettings] = useState({
        loyaltyCampaignActive: false,
        loyaltyDiscountRate: 50
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings/system');
                if (res.ok) {
                    const data = await res.json();
                    setSettings({
                        loyaltyCampaignActive: data.loyaltyCampaignActive,
                        loyaltyDiscountRate: data.loyaltyDiscountRate
                    });
                }
            } catch (error) {
                console.error('Fetch settings error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async () => {
        try {
            const res = await fetch('/api/admin/settings/system', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                toast.success('Kampanya ayarları güncellendi');
            } else {
                toast.error('Ayarlar kaydedilemedi');
            }
        } catch (error) {
            console.error('Save settings error:', error);
            toast.error('Bir hata oluştu');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nocca-green"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link href="/admin" className="mr-4 text-gray-400 hover:text-gray-600">
                                ←
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">Kampanya ve Sadakat Yönetimi</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8">

                    {/* Loyalty Campaign Card */}
                    <div className="bg-white shadow rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-nocca-green bg-opacity-10 rounded-lg">
                                    <FaTag className="text-nocca-green w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Günün İkinci İçeceği Kampanyası</h2>
                                    <p className="text-sm text-gray-500">Müdavimlerinizi ödüllendirin ve geri dönüşleri artırın.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.loyaltyCampaignActive}
                                    onChange={(e) => setSettings({ ...settings, loyaltyCampaignActive: e.target.checked })}
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none ring-0 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-nocca-green"></div>
                                <span className={`ml-3 text-sm font-bold ${settings.loyaltyCampaignActive ? 'text-nocca-green' : 'text-gray-400'}`}>
                                    {settings.loyaltyCampaignActive ? 'AKTİF' : 'PASİF'}
                                </span>
                            </label>
                        </div>

                        <div className="p-6 space-y-8">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Discount Rate */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">İndirim Oranı</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">%</span>
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={settings.loyaltyDiscountRate}
                                                onChange={(e) => setSettings({ ...settings, loyaltyDiscountRate: parseInt(e.target.value) })}
                                                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-nocca-green focus:border-transparent outline-none font-bold text-lg"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            {[25, 50, 75].map(v => (
                                                <button
                                                    key={v}
                                                    onClick={() => setSettings({ ...settings, loyaltyDiscountRate: v })}
                                                    className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${settings.loyaltyDiscountRate === v ? 'bg-nocca-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                >
                                                    %{v}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 italic">2. ürüne uygulanacak indirim yüzdesi.</p>
                                </div>

                                {/* Rule Summary */}
                                <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                                    <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-3">
                                        <FaClock className="w-4 h-4" /> Sabit Kampanya Kuralları
                                    </h3>
                                    <ul className="space-y-2">
                                        <li className="text-xs text-amber-700 flex items-start gap-2">
                                            <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                            İndirim sadece <strong>İçecekler</strong> kategorisinde geçerlidir.
                                        </li>
                                        <li className="text-xs text-amber-700 flex items-start gap-2">
                                            <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                            Uygulanması için ilk siparişten sonra en az <strong>1 saat</strong> geçmiş olmalıdır.
                                        </li>
                                        <li className="text-xs text-amber-700 flex items-start gap-2">
                                            <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                            İndirim süresi ilk siparişten itibaren <strong>12 saattir.</strong>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center text-center gap-4">
                                <div className="text-nocca-green font-bold text-sm uppercase tracking-widest bg-white px-4 py-1.5 rounded-full shadow-sm">
                                    Müşteri Gösterge (Display) Mesajı
                                </div>
                                <div className="bg-nocca-green text-white p-6 rounded-2xl shadow-xl max-w-lg w-full">
                                    <div className="text-xs opacity-75 mb-2 flex items-center justify-center gap-1">
                                        <FaCheckCircle className="w-3 h-3" /> Kampanya Aktifken Örnek Mesaj
                                    </div>
                                    <div className="text-lg font-bold">
                                        "Hoş geldiniz Ahmet Bey! Bugünün 2. kahvesi bizden, %{settings.loyaltyDiscountRate} indiriminiz hazır!"
                                    </div>
                                </div>
                                <div className="bg-amber-500 text-white p-6 rounded-2xl shadow-xl max-w-lg w-full opacity-80">
                                    <div className="text-xs opacity-75 mb-2 flex items-center justify-center gap-1">
                                        <FaClock className="w-3 h-3" /> Cooldown Süresindeyken Örnek Mesaj
                                    </div>
                                    <div className="text-lg font-bold">
                                        "Hoş geldiniz Ahmet Bey! İndirim hakkınız için son 22 dakikanız, beklemeye değer!"
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="p-6 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                            <button
                                onClick={handleSave}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-nocca-green text-white font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-lg hover:shadow-nocca-green/20"
                            >
                                <FaSave className="w-4 h-4" /> Ayarları Kaydet
                            </button>
                        </div>
                    </div>

                    {/* Report Placeholders */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                        <div className="bg-white p-6 rounded-xl shadow border border-gray-100 italic text-gray-400 text-center">
                            "En Çok Gelen Müdavimler" raporu yakında burada görünecek...
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow border border-gray-100 italic text-gray-400 text-center">
                            "Barista Sadakat Performansı" raporu yakında burada görünecek...
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
