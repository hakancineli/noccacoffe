'use client';

import { useState } from 'react';
import { FaPaperPlane, FaSmile, FaFrown, FaLightbulb, FaCommentDots, FaCheckCircle } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

const FeedbackType = {
    COMPLAINT: { label: 'Şikayet', icon: FaFrown, color: 'text-red-500', bg: 'bg-red-50' },
    SUGGESTION: { label: 'Öneri', icon: FaLightbulb, color: 'text-amber-500', bg: 'bg-amber-50' },
    REQUEST: { label: 'Dilekçe/İstek', icon: FaCommentDots, color: 'text-blue-500', bg: 'bg-blue-50' },
    OTHER: { label: 'Diğer', icon: FaSmile, color: 'text-green-500', bg: 'bg-green-50' },
};

export default function FeedbackPage() {
    const [type, setType] = useState('SUGGESTION');
    const [content, setContent] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerContact, setCustomerContact] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) {
            setError('Lütfen mesajınızı yazın.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    content,
                    customerName,
                    customerContact,
                }),
            });

            if (response.ok) {
                setSubmitted(true);
            } else {
                const data = await response.json();
                setError(data.error || 'Bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } catch (err) {
            setError('Bağlantı hatası. Lütfen internetinizi kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full animate-bounce-in">
                    <FaCheckCircle className="text-green-500 text-7xl mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Teşekkür Ederiz!</h1>
                    <p className="text-gray-600 mb-8">
                        Geri bildiriminiz başarıyla alındı. Nocca Coffee deneyimini geliştirmemize yardımcı olduğunuz için teşekkürler.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 bg-[#704d39] text-white rounded-xl font-bold shadow-lg hover:bg-[#5a3d2a] transition-all"
                    >
                        Yeni Geri Bildirim Gönder
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f8f9fa] to-[#e8f5ea] py-12 px-4 sm:px-6">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-[#704d39] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mx-auto mb-4">
                        ☕
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Nocca Coffee</h1>
                    <p className="mt-2 text-gray-600 font-medium">Geri Bildirim Formu</p>

                    <div className="mt-6">
                        <Link href="/menu" className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#704d39] text-[#704d39] rounded-2xl font-bold text-sm shadow-sm hover:bg-[#704d39] hover:text-white transition-all transform active:scale-95">
                            <span>📖 DİJİTAL MENÜMÜZ</span>
                        </Link>
                    </div>

                    <p className="text-sm text-gray-500 mt-4">Sizden gelen her fikir bizim için değerlidir.</p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="p-1 bg-[#704d39]"></div>
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Type Selection */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Geri Bildirim Türü</label>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(FeedbackType).map(([key, config]) => {
                                    const Icon = config.icon;
                                    const isSelected = type === key;
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setType(key)}
                                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${isSelected
                                                ? `border-[#704d39] ${config.bg} scale-105 shadow-sm`
                                                : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                                                }`}
                                        >
                                            <Icon className={`text-xl mb-1 ${isSelected ? config.color : 'text-gray-400'}`} />
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-gray-800' : 'text-gray-500'}`}>
                                                {config.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <label htmlFor="content" className="block text-sm font-bold text-gray-700 mb-2">
                                Mesajınız <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="content"
                                rows={5}
                                required
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#704d39] focus:border-transparent transition-all outline-none resize-none placeholder-gray-400"
                                placeholder="Şikayet, öneri veya düşüncelerinizi buraya yazabilirsiniz..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            ></textarea>
                        </div>

                        {/* Personal Info (Optional) */}
                        <div className="space-y-4 pt-2">
                            <p className="text-xs text-gray-400 font-medium italic">
                                * Bu alanlar opsiyoneldir. Size dönüş yapmamızı isterseniz doldurabilirsiniz.
                            </p>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Adınız Soyadınız (Opsiyonel)"
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#704d39] focus:border-transparent transition-all outline-none text-sm"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="E-posta veya Telefon (Opsiyonel)"
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#704d39] focus:border-transparent transition-all outline-none text-sm"
                                    value={customerContact}
                                    onChange={(e) => setCustomerContact(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[#704d39] text-white rounded-2xl font-bold shadow-xl hover:bg-[#5a3d2a] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <FaPaperPlane />
                                    GÖNDER
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-gray-400 text-xs font-medium">
                    © {new Date().getFullYear()} Nocca Coffee & Roastery. Tüm hakları saklıdır.
                </p>
            </div>
        </div>
    );
}
