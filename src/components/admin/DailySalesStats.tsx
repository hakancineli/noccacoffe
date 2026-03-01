'use client';

import { useState, useMemo } from 'react';

interface ProductStat {
    productName: string;
    category: string;
    quantity: number;
    revenue: number;
    unitCost: number;
    totalCost: number;
    unitProfit: number;
    totalProfit: number;
    margin: number;
}

interface DailyStats {
    date: string;
    summary: {
        totalOrders: number;
        totalProductsSold: number;
        totalRevenue: number;
        totalCost: number;
        totalProfit: number;
        profitMargin: number;
    };
    products: ProductStat[];
}

export default function DailySalesStats() {
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [startTime, setStartTime] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [stats, setStats] = useState<DailyStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchStats = async (date: string, start?: string, end?: string) => {
        setLoading(true);
        setError('');
        try {
            let url = `/api/admin/reports/daily-sales?date=${date}`;
            if (start) url += `&startTime=${start}`;
            if (end) url += `&endTime=${end}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Rapor alınamadı');
            }
            const data = await response.json();
            setStats(data);
            setSelectedCategory('all'); // Reset category when new report is fetched
        } catch (err) {
            console.error(err);
            setError('Veriler yüklenirken bir hata oluştu');
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = e.target.value;
        setSelectedDate(date);
        if (date) {
            fetchStats(date, startTime, endTime);
        }
    };

    const categories = useMemo(() => {
        if (!stats) return [];
        const cats = new Set(stats.products.map(p => p.category));
        return Array.from(cats).sort();
    }, [stats]);

    const filteredProducts = useMemo(() => {
        if (!stats) return [];
        if (selectedCategory === 'all') return stats.products;
        return stats.products.filter(p => p.category === selectedCategory);
    }, [stats, selectedCategory]);

    const filteredSummary = useMemo(() => {
        if (!stats || selectedCategory === 'all') return stats?.summary;

        const products = stats.products.filter(p => p.category === selectedCategory);
        const qty = products.reduce((sum, p) => sum + p.quantity, 0);
        const rev = products.reduce((sum, p) => sum + p.revenue, 0);
        const cost = products.reduce((sum, p) => sum + p.totalCost, 0);
        const profit = rev - cost;

        return {
            ...stats.summary,
            totalProductsSold: qty,
            totalRevenue: rev,
            totalCost: cost,
            totalProfit: profit,
            profitMargin: rev > 0 ? Math.round((profit / rev) * 1000) / 10 : 0
        };
    }, [stats, selectedCategory]);

    return (
        <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Günlük Satış Raporu</h3>

                <div className="flex flex-wrap items-end gap-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex-1 min-w-[150px]">
                        <label htmlFor="report-date" className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                            Tarih
                        </label>
                        <input
                            type="date"
                            id="report-date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
                        />
                    </div>
                    <div>
                        <label htmlFor="start-time" className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                            Başlangıç
                        </label>
                        <input
                            type="time"
                            id="start-time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
                        />
                    </div>
                    <div>
                        <label htmlFor="end-time" className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                            Bitiş
                        </label>
                        <input
                            type="time"
                            id="end-time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border"
                        />
                    </div>
                    <button
                        onClick={() => fetchStats(selectedDate, startTime, endTime)}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-bold transition shadow-sm"
                    >
                        Filtrele
                    </button>
                    {(startTime || endTime) && (
                        <button
                            onClick={() => {
                                setStartTime('');
                                setEndTime('');
                                fetchStats(selectedDate, '', '');
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 text-sm font-medium transition"
                        >
                            Sıfırla
                        </button>
                    )}
                </div>

                {loading && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-4 font-medium italic">Veriler işleniyor...</p>
                    </div>
                )}

                {error && (
                    <div className="text-red-600 text-sm p-4 bg-red-50 rounded-lg border border-red-100 flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {stats && !loading && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                                <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Toplam Sipariş</dt>
                                <dd className="text-xl font-bold text-gray-900">{stats.summary.totalOrders}</dd>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                                <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Filtreli Ürün</dt>
                                <dd className="text-xl font-bold text-gray-900">{filteredSummary?.totalProductsSold}</dd>
                            </div>
                            <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 shadow-sm text-center">
                                <dt className="text-[10px] font-bold text-green-600/70 uppercase tracking-widest mb-1">Filtreli Ciro</dt>
                                <dd className="text-xl font-black text-green-600">₺{filteredSummary?.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</dd>
                            </div>
                            <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 shadow-sm text-center">
                                <dt className="text-[10px] font-bold text-orange-600/70 uppercase tracking-widest mb-1">Hammadde Maliyeti</dt>
                                <dd className="text-xl font-black text-orange-600">₺{filteredSummary?.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</dd>
                            </div>
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-sm text-center">
                                <dt className="text-[10px] font-bold text-blue-600/70 uppercase tracking-widest mb-1">Brüt Kâr</dt>
                                <dd className={`text-xl font-black ${filteredSummary!.totalProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    ₺{filteredSummary?.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </dd>
                            </div>
                            <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 shadow-sm text-center">
                                <dt className="text-[10px] font-bold text-purple-600/70 uppercase tracking-widest mb-1">Kâr Marjı</dt>
                                <dd className="text-xl font-black text-purple-600">%{filteredSummary?.profitMargin}</dd>
                            </div>
                        </div>

                        {/* Detailed Table Header with Category Filter */}
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100 gap-4">
                            <h4 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                <span className="bg-green-600 w-2 h-6 rounded-full"></span>
                                Satış & Karlılık Analizi
                            </h4>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-gray-400 uppercase">Kategori:</span>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="rounded-lg border-gray-200 text-sm font-bold text-gray-700 px-4 py-1.5 focus:ring-green-500 focus:border-green-500 border bg-white shadow-sm cursor-pointer"
                                >
                                    <option value="all">Tüm Kategoriler</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Detailed Table */}
                        <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Ürün Bilgisi</th>
                                        <th className="px-4 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Adet</th>
                                        <th className="px-4 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Ciro</th>
                                        <th className="px-4 py-4 text-right text-[10px] font-black text-orange-400 uppercase tracking-widest">Maliyet</th>
                                        <th className="px-4 py-4 text-right text-[10px] font-black text-blue-400 uppercase tracking-widest">Kâr</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Marj</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredProducts.map((product, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition duration-150 group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-800 group-hover:text-green-700 transition">{product.productName}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter opacity-70">{product.category}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right whitespace-nowrap">
                                                <span className="text-sm font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">{product.quantity}</span>
                                            </td>
                                            <td className="px-4 py-4 text-right whitespace-nowrap">
                                                <span className="text-sm font-bold text-green-600">₺{product.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </td>
                                            <td className="px-4 py-4 text-right whitespace-nowrap group-hover:scale-105 transition origin-right">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-orange-600">₺{product.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                    <span className="text-[10px] text-orange-400 italic">Birim: ₺{product.unitCost.toFixed(2)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right whitespace-nowrap group-hover:scale-105 transition origin-right">
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-black ${product.totalProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                                        ₺{product.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                    <span className={`text-[10px] italic ${product.unitProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                                                        Birim: ₺{product.unitProfit.toFixed(2)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black shadow-sm ${product.margin >= 70 ? 'bg-green-100 text-green-700' :
                                                        product.margin >= 50 ? 'bg-blue-100 text-blue-700' :
                                                            product.margin >= 30 ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                    }`}>
                                                    %{product.margin}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-100/50 backdrop-blur-sm sticky bottom-0">
                                    <tr className="font-extrabold border-t-2 border-gray-200">
                                        <td className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest italic">
                                            {selectedCategory === 'all' ? 'GENEL TOPLAM' : `${selectedCategory.toUpperCase()} TOPLAMI`}
                                        </td>
                                        <td className="px-4 py-4 text-right text-sm text-gray-900">
                                            <span className="bg-gray-200 px-2 py-1 rounded-md">{filteredSummary?.totalProductsSold}</span>
                                        </td>
                                        <td className="px-4 py-4 text-right text-base text-green-700 font-black">
                                            ₺{filteredSummary?.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-4 py-4 text-right text-sm text-orange-700">
                                            ₺{filteredSummary?.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className={`px-4 py-4 text-right text-base font-black ${filteredSummary!.totalProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                                            ₺{filteredSummary?.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-right text-purple-700 font-black">
                                            <span className="bg-purple-100 px-3 py-1 rounded-full">%{filteredSummary?.profitMargin}</span>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
