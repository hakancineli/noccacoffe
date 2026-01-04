import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertCircle, Coffee, Loader2, RefreshCw, Wallet, ShoppingBag, TrendingDown, Target, Package, Users, BarChart3, ChevronRight, Clock, CalendarDays } from 'lucide-react';

interface MenuStat {
    name: string;
    sold: number;
    profit: number;
    margin: number;
}

interface AIResponse {
    summary: string;
    insights: {
        finance: string;
        menu: string;
        stock: string;
        loyalty: string;
        staff?: string;
    };
    mood: 'positive' | 'neutral' | 'warning';
    advancedStats?: {
        menuEngineering: MenuStat[];
        ingredientUsage: Record<string, number>;
        churnCount: number;
        financials: { revenue: number, expenses: number, profit: number };
        shiftInsights?: {
            busiestHour: string;
            busiestDay: string;
            avgOrdersPerDay: number;
            hoursDistribution: number[];
            daysDistribution: number[];
        };
    };
    error?: string;
    details?: string;
}

export default function AIConsultant() {
    const [data, setData] = useState<AIResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'stock' | 'customers' | 'shifts'>('overview');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const fetchAnalysis = async (m = month, y = year) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/ai-consultant?month=${m}&year=${y}`);
            const result = await res.json();
            setData(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAnalysis(); }, []);

    const formatCurrency = (val: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);

    if (loading && !data) {
        return (
            <div className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center border border-gray-100 shadow-xl mt-8">
                <Loader2 className="w-12 h-12 text-black animate-spin mb-4" />
                <p className="text-gray-500 font-medium animate-pulse">Nocca Strateji Merkezi Hazırlanıyor...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden mt-8 transition-all duration-500">
            {/* Header: Neumorphic / Premium Style */}
            <div className="p-8 bg-gradient-to-br from-gray-900 to-black text-white">
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg shadow-orange-500/20">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black tracking-tight">Nocca Premium AI Insights</h3>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mt-1">Stratejik Karar Destek Sistemi</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10">
                        <select
                            value={month}
                            onChange={(e) => {
                                const m = Number(e.target.value);
                                setMonth(m);
                                fetchAnalysis(m, year);
                            }}
                            className="bg-transparent text-xs font-black px-2 py-1 outline-none cursor-pointer"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1} className="text-black">
                                    {new Date(2000, i, 1).toLocaleDateString('tr-TR', { month: 'long' })}
                                </option>
                            ))}
                        </select>

                        <div className="w-px h-3 bg-white/20"></div>

                        <select
                            value={year}
                            onChange={(e) => {
                                const y = Number(e.target.value);
                                setYear(y);
                                fetchAnalysis(month, y);
                            }}
                            className="bg-transparent text-xs font-black px-2 py-1 outline-none cursor-pointer"
                        >
                            {[2024, 2025, 2026].map(y => (
                                <option key={y} value={y} className="text-black">{y}</option>
                            ))}
                        </select>

                        <button onClick={() => fetchAnalysis(month, year)} className="p-2 hover:bg-white/10 rounded-lg transition-all ml-1">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Main Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {[
                        { id: 'overview', label: 'Dashboard', icon: BarChart3 },
                        { id: 'menu', label: 'Menü Analizi', icon: Target },
                        { id: 'stock', label: 'Stok Tahmini', icon: Package },
                        { id: 'customers', label: 'Müşteri Hub', icon: Users },
                        { id: 'shifts', label: 'Vardiya & Ekip', icon: Clock },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-black shadow-xl shadow-white/10' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-8">
                {/* Content Sections */}
                {data?.error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 mb-6 animate-pulse">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <div className="text-xs font-bold leading-tight">
                            <p className="uppercase tracking-widest mb-1 font-black">Sistem Analiz Hatası</p>
                            <p className="font-medium opacity-80">{data.error}</p>
                        </div>
                    </div>
                )}
                {activeTab === 'overview' && data?.advancedStats && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 group hover:shadow-lg transition-all">
                                <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">Net Ciro</p>
                                <h4 className="text-3xl font-black text-emerald-900">{formatCurrency(data.advancedStats.financials.revenue)}</h4>
                            </div>
                            <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100">
                                <p className="text-[10px] font-black text-orange-600 uppercase mb-2">Giderr</p>
                                <h4 className="text-3xl font-black text-orange-900">{formatCurrency(data.advancedStats.financials.expenses)}</h4>
                            </div>
                            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                                <p className="text-[10px] font-black text-blue-600 uppercase mb-2">Net Kar</p>
                                <h4 className="text-3xl font-black text-blue-900">{formatCurrency(data.advancedStats.financials.profit)}</h4>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex gap-6 items-start">
                            <div className="p-4 bg-black rounded-2xl shadow-xl">
                                <TrendingUp className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div>
                                <h5 className="font-black text-gray-900 text-lg mb-1">AI Strateji Özeti</h5>
                                <p className="text-gray-600 text-sm leading-relaxed font-medium">{data.summary}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'menu' && data?.advancedStats && (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-black text-gray-900">Karlılık & Popülarite Matrisi</h4>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded-full">En Karlı</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-full">En Popüler</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {data.advancedStats.menuEngineering.sort((a, b) => b.profit - a.profit).slice(0, 5).map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-black transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-gray-400 group-hover:bg-black group-hover:text-white transition-all">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{p.name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{p.sold} Sipariş</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-emerald-600">+{formatCurrency(p.profit)} Kar</p>
                                        <p className="text-[10px] font-bold text-gray-400 italic">%{p.margin.toFixed(1)} Marj</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-5 bg-yellow-50 rounded-2xl border border-yellow-100/50 flex gap-4 mt-8">
                            <Target className="w-5 h-5 text-yellow-600 shrink-0" />
                            <p className="text-sm text-yellow-800 font-medium">{data.insights.menu}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'stock' && data?.advancedStats && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <h4 className="text-lg font-black text-gray-900">Aylık Hammadde Tahmini</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(data.advancedStats.ingredientUsage).slice(0, 6).map(([name, amount], i) => (
                                <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">{name}</p>
                                        <p className="text-xl font-black text-slate-900">{amount.toLocaleString()} <span className="text-sm font-bold text-slate-400">birim</span></p>
                                    </div>
                                    <div className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-900" style={{ width: '70%' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100/50 flex gap-4">
                            <Package className="w-5 h-5 text-purple-600 shrink-0" />
                            <p className="text-sm text-purple-800 font-medium">{data.insights.stock}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'customers' && data?.advancedStats && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 bg-black rounded-[2.5rem] text-white flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                                    <Users className="w-8 h-8 text-yellow-400" />
                                </div>
                                <h4 className="text-4xl font-black mb-1">{data.advancedStats.churnCount}</h4>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Riskli Müşteri</p>
                                <p className="text-[10px] text-gray-500 mt-4 leading-relaxed">Son 14 gündür dükkana uğramamış sadık müşterilerin sayısı.</p>
                            </div>
                            <div className="space-y-4">
                                <h5 className="font-black text-gray-900 text-sm px-2 uppercase tracking-widest text-gray-400">Geri Kazanım Önerisi</h5>
                                <div className="p-6 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 relative overflow-hidden group">
                                    <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-emerald-500/10 rotate-12" />
                                    <p className="text-emerald-900 font-bold leading-relaxed relative z-10">{data.insights.loyalty}</p>
                                    <button className="mt-6 flex items-center gap-2 text-xs font-black text-emerald-600 hover:gap-3 transition-all">
                                        KAMPANYA OLUŞTUR <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'shifts' && data?.advancedStats?.shiftInsights && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Hero Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 relative overflow-hidden group">
                                <Clock className="absolute right-4 top-4 w-12 h-12 text-indigo-200 group-hover:scale-110 transition-transform" />
                                <p className="text-[10px] font-black text-indigo-600 uppercase mb-2">En Yoğun Saatler</p>
                                <h4 className="text-2xl font-black text-indigo-900">{data.advancedStats.shiftInsights.busiestHour}</h4>
                                <p className="text-xs text-indigo-600/80 font-bold mt-1">Ekstra Barista Önerilir</p>
                            </div>
                            <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100 relative overflow-hidden">
                                <CalendarDays className="absolute right-4 top-4 w-12 h-12 text-rose-200" />
                                <p className="text-[10px] font-black text-rose-600 uppercase mb-2">En Yoğun Gün</p>
                                <h4 className="text-2xl font-black text-rose-900">{data.advancedStats.shiftInsights.busiestDay}</h4>
                            </div>
                            <div className="p-6 bg-teal-50 rounded-3xl border border-teal-100 relative overflow-hidden">
                                <Users className="absolute right-4 top-4 w-12 h-12 text-teal-200" />
                                <p className="text-[10px] font-black text-teal-600 uppercase mb-2">Günlük Ort. Sipariş</p>
                                <h4 className="text-2xl font-black text-teal-900">{data.advancedStats.shiftInsights.avgOrdersPerDay}</h4>
                            </div>
                        </div>

                        {/* Hourly Heatmap */}
                        <div>
                            <h4 className="text-lg font-black text-gray-900 mb-6">Saatlik Yoğunluk Haritası</h4>
                            <div className="h-32 flex items-end gap-1 sm:gap-2">
                                {data.advancedStats.shiftInsights.hoursDistribution.map((count, i) => {
                                    const max = Math.max(...data!.advancedStats!.shiftInsights!.hoursDistribution);
                                    const height = max > 0 ? (count / max) * 100 : 0;
                                    const isPeak = height > 70;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                                            <div
                                                className={`w-full rounded-t-lg transition-all duration-500 ${isPeak ? 'bg-indigo-500' : 'bg-gray-200 group-hover:bg-indigo-300'}`}
                                                style={{ height: `${Math.max(height, 5)}%` }}
                                            ></div>
                                            <span className="text-[9px] font-bold text-gray-400 absolute -bottom-5 transform -rotate-45 sm:rotate-0">{i}:00</span>
                                            {/* Tooltip */}
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                {count} Sipariş
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* AI Insight */}
                        <div className="p-6 bg-indigo-900 rounded-[2rem] border border-indigo-800 flex gap-6 items-start shadow-xl shadow-indigo-900/20 text-white mt-12">
                            <div className="p-3 bg-white/10 rounded-2xl">
                                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                            </div>
                            <div>
                                <h5 className="font-black text-white text-lg mb-2">Yapay Zeka Vardiya Tavsiyesi</h5>
                                <p className="text-indigo-100 text-sm leading-relaxed font-medium">
                                    {data.insights.staff || "Veriler analiz ediliyor..."}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Footer */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">AI Modeli: Gemini 2.0 Flash • Gerçek Zamanlı Analiz Aktif</span>
                </div>
                <div className="text-[10px] font-black text-gray-400">
                    NOCCA STRATEGY HUB &copy; {new Date().getFullYear()}
                </div>
            </div>
        </div>
    );
}
