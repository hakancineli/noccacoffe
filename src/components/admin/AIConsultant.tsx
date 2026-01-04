import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertCircle, Coffee, Loader2, RefreshCw, Wallet, ShoppingBag, TrendingDown, Calendar, Star } from 'lucide-react';

interface Stat {
    name: string;
    quantity: number;
}

interface DayStat {
    date: string;
    count: number;
}

interface AIResponse {
    summary: string;
    recommendations: string[];
    mood: 'positive' | 'neutral' | 'warning';
    stats?: {
        revenue: number;
        expenses: number;
        profit: number;
        topProducts: Stat[];
        busiestDay: DayStat | null;
        quietestDay: DayStat | null;
    };
}

export default function AIConsultant() {
    const [data, setData] = useState<AIResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const fetchAnalysis = async (m = month, y = year) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/ai-consultant?month=${m}&year=${y}`);
            const result = await res.json();
            if (result.error && !result.summary) throw new Error(result.error);
            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysis();
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
    };

    const moodConfig = {
        positive: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <TrendingUp className="w-5 h-5 text-emerald-500" /> },
        neutral: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: <Coffee className="w-5 h-5 text-blue-500" /> },
        warning: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: <AlertCircle className="w-5 h-5 text-orange-500" /> }
    };

    const currentMood = data?.mood ? moodConfig[data.mood] : moodConfig.neutral;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-8">
            {/* Header */}
            <div className="p-6 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center sm:flex-row flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-black rounded-lg">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-none">Nocca AI Danışman</h3>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">Performans Verileri & Analiz</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <select
                            value={month}
                            onChange={(e) => {
                                const newMonth = parseInt(e.target.value);
                                setMonth(newMonth);
                                fetchAnalysis(newMonth, year);
                            }}
                            className="bg-white border border-gray-200 rounded-lg text-xs font-bold px-2 py-1 outline-none hover:border-black transition-colors"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(2000, i, 1).toLocaleDateString('tr-TR', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                        <select
                            value={year}
                            onChange={(e) => {
                                const newYear = parseInt(e.target.value);
                                setYear(newYear);
                                fetchAnalysis(month, newYear);
                            }}
                            className="bg-white border border-gray-200 rounded-lg text-xs font-bold px-2 py-1 outline-none hover:border-black transition-colors"
                        >
                            {[2024, 2025, 2026].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => fetchAnalysis(month, year)}
                        disabled={loading}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-900"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="p-6">
                {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 text-black animate-spin" />
                        <p className="text-sm font-medium text-gray-500 animate-pulse">Veriler derinlemesine analiz ediliyor...</p>
                    </div>
                ) : error && !data?.summary ? (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                        <AlertCircle className="w-5 h-5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                ) : data ? (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        {data.stats && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-emerald-50 border border-emerald-100/50 rounded-2xl">
                                    <div className="flex items-center gap-2 text-emerald-600 mb-1">
                                        <Wallet className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Toplam Gelir</span>
                                    </div>
                                    <div className="text-xl font-black text-emerald-900">{formatCurrency(data.stats.revenue)}</div>
                                </div>
                                <div className="p-4 bg-orange-50 border border-orange-100/50 rounded-2xl">
                                    <div className="flex items-center gap-2 text-orange-600 mb-1">
                                        <TrendingDown className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Toplam Gider</span>
                                    </div>
                                    <div className="text-xl font-black text-orange-900">{formatCurrency(data.stats.expenses)}</div>
                                </div>
                                <div className="p-4 bg-blue-50 border border-blue-100/50 rounded-2xl text-blue-900">
                                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                                        <ShoppingBag className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Net Kar</span>
                                    </div>
                                    <div className="text-xl font-black">{formatCurrency(data.stats.profit)}</div>
                                </div>
                            </div>
                        )}

                        {/* Analysis Box */}
                        <div className={`p-5 rounded-2xl border ${currentMood.bg} ${currentMood.border} flex gap-4 items-start`}>
                            <div className="mt-1">{currentMood.icon}</div>
                            <p className="text-sm font-semibold leading-relaxed text-gray-800">
                                {data.summary}
                            </p>
                        </div>

                        {/* Secondary Stats: Top Products & Traffic */}
                        {data.stats && (
                            <div className="grid grid-cols-1 gap-8">
                                {/* Top Products */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 px-1">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Favori Ürünler</h4>
                                    </div>
                                    <div className="bg-gray-50/50 rounded-2xl p-2 border border-gray-100 flex flex-col gap-1">
                                        {data.stats.topProducts.map((p, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-50">
                                                <span className="text-sm font-bold text-gray-700">{p.name}</span>
                                                <span className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-600">{p.quantity} Adet</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Peak Hours / Days */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 px-1">
                                        <Calendar className="w-4 h-4 text-purple-500" />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Trafik Durumu</h4>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {data.stats.busiestDay && (
                                            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100/50 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-purple-400 uppercase">En Yoğun Gün</p>
                                                    <p className="text-sm font-black text-purple-900">{formatDate(data.stats.busiestDay.date)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xl font-black text-purple-900">{data.stats.busiestDay.count}</span>
                                                    <span className="text-[10px] font-bold text-purple-400 ml-1">SİP.</span>
                                                </div>
                                            </div>
                                        )}
                                        {data.stats.quietestDay && (
                                            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">En Sakin Gün</p>
                                                    <p className="text-sm font-black text-slate-900">{formatDate(data.stats.quietestDay.date)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xl font-black text-slate-900">{data.stats.quietestDay.count}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 ml-1">SİP.</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 italic">Nocca Profesyonel Önerileri</h4>
                            <div className="grid grid-cols-1 gap-3">
                                {data.recommendations.map((rec, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start gap-4 p-4 bg-gray-50/80 rounded-2xl transition-all border border-transparent hover:border-gray-200 hover:bg-white hover:shadow-md group"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-xs font-black text-gray-400 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all flex-shrink-0">
                                            {idx + 1}
                                        </div>
                                        <p className="text-sm text-gray-600 font-medium leading-relaxed">{rec}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Gemini 2.0 Flash Destekli Canlı Analiz</span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">
                                {new Date(year, month - 1).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <Coffee className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Analiz Zamanı Geldi mi?</h4>
                        <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">İşletme verileriniz AI tarafından derinlemesine incelenecek ve karlılığınız için somut öneriler sunulacak.</p>
                        <button
                            onClick={() => fetchAnalysis()}
                            className="px-10 py-3 bg-black text-white rounded-2xl text-sm font-black hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 active:scale-95"
                        >
                            ANALİZİ BAŞLAT
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
