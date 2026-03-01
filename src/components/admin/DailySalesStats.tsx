'use client';

import { useState } from 'react';

interface ProductStat {
    productName: string;
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

    return (
        <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Günlük Satış Raporu</h3>

                <div className="flex flex-wrap items-end gap-4 mb-6">
                    <div>
                        <label htmlFor="report-date" className="block text-sm font-medium text-gray-700 mb-1">
                            Tarih Seçiniz
                        </label>
                        <input
                            type="date"
                            id="report-date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-2 border"
                        />
                    </div>
                    <div>
                        <label htmlFor="start-time" className="block text-sm font-medium text-gray-700 mb-1">
                            Başlangıç Saati
                        </label>
                        <input
                            type="time"
                            id="start-time"
                            value={startTime}
                            onChange={(e) => {
                                setStartTime(e.target.value);
                            }}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-2 border"
                        />
                    </div>
                    <div>
                        <label htmlFor="end-time" className="block text-sm font-medium text-gray-700 mb-1">
                            Bitiş Saati
                        </label>
                        <input
                            type="time"
                            id="end-time"
                            value={endTime}
                            onChange={(e) => {
                                setEndTime(e.target.value);
                            }}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-4 py-2 border"
                        />
                    </div>
                    <button
                        onClick={() => fetchStats(selectedDate, startTime, endTime)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                    >
                        Raporu Getir
                    </button>
                    {(startTime || endTime) && (
                        <button
                            onClick={() => {
                                setStartTime('');
                                setEndTime('');
                                fetchStats(selectedDate, '', '');
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm font-medium ml-2"
                        >
                            Filtreyi Temizle
                        </button>
                    )}
                </div>

                {loading && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Yükleniyor...</p>
                    </div>
                )}

                {error && (
                    <div className="text-red-600 text-sm p-4 bg-red-50 rounded-md">
                        {error}
                    </div>
                )}

                {stats && !loading && (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <dt className="text-xs font-medium text-gray-500">Toplam Sipariş</dt>
                                <dd className="mt-1 text-xl font-semibold text-gray-900">{stats.summary.totalOrders}</dd>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <dt className="text-xs font-medium text-gray-500">Satılan Ürün</dt>
                                <dd className="mt-1 text-xl font-semibold text-gray-900">{stats.summary.totalProductsSold}</dd>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg text-center">
                                <dt className="text-xs font-medium text-green-700">Günlük Ciro</dt>
                                <dd className="mt-1 text-xl font-bold text-green-600">₺{stats.summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg text-center">
                                <dt className="text-xs font-medium text-orange-700">Hammadde Maliyeti</dt>
                                <dd className="mt-1 text-xl font-bold text-orange-600">₺{stats.summary.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg text-center">
                                <dt className="text-xs font-medium text-blue-700">Brüt Kâr</dt>
                                <dd className={`mt-1 text-xl font-bold ${stats.summary.totalProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>₺{stats.summary.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg text-center">
                                <dt className="text-xs font-medium text-purple-700">Kâr Marjı</dt>
                                <dd className="mt-1 text-xl font-bold text-purple-600">%{stats.summary.profitMargin}</dd>
                            </div>
                        </div>

                        {/* Detailed Table */}
                        <div>
                            <h4 className="text-base font-medium text-gray-900 mb-3">Ürün Bazlı Satış & Karlılık Detayı</h4>
                            {stats.products.length > 0 ? (
                                <div className="border rounded-lg overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün Adı</th>
                                                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Adet</th>
                                                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ciro</th>
                                                <th className="px-3 py-3 text-right text-xs font-medium text-orange-600 uppercase tracking-wider">Birim Maliyet</th>
                                                <th className="px-3 py-3 text-right text-xs font-medium text-orange-600 uppercase tracking-wider">Top. Maliyet</th>
                                                <th className="px-3 py-3 text-right text-xs font-medium text-blue-600 uppercase tracking-wider">Birim Kâr</th>
                                                <th className="px-3 py-3 text-right text-xs font-medium text-blue-600 uppercase tracking-wider">Top. Kâr</th>
                                                <th className="px-3 py-3 text-right text-xs font-medium text-purple-600 uppercase tracking-wider">Marj</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {stats.products.map((product, idx) => (
                                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{product.productName}</td>
                                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 text-right">{product.quantity}</td>
                                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-green-600 font-medium text-right">₺{product.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-orange-600 text-right">₺{product.unitCost.toFixed(2)}</td>
                                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-orange-600 text-right">₺{product.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    <td className={`px-3 py-3 whitespace-nowrap text-sm font-medium text-right ${product.unitProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>₺{product.unitProfit.toFixed(2)}</td>
                                                    <td className={`px-3 py-3 whitespace-nowrap text-sm font-bold text-right ${product.totalProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>₺{product.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-3 py-3 whitespace-nowrap text-right">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${product.margin >= 70 ? 'bg-green-100 text-green-800' :
                                                                product.margin >= 50 ? 'bg-blue-100 text-blue-800' :
                                                                    product.margin >= 30 ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-red-100 text-red-800'
                                                            }`}>
                                                            %{product.margin}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-100 font-bold">
                                            <tr>
                                                <td className="px-4 py-3 text-sm text-gray-900">TOPLAM</td>
                                                <td className="px-3 py-3 text-sm text-gray-900 text-right">{stats.summary.totalProductsSold}</td>
                                                <td className="px-3 py-3 text-sm text-green-700 text-right">₺{stats.summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td className="px-3 py-3 text-sm text-right"></td>
                                                <td className="px-3 py-3 text-sm text-orange-700 text-right">₺{stats.summary.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td className="px-3 py-3 text-sm text-right"></td>
                                                <td className={`px-3 py-3 text-sm text-right ${stats.summary.totalProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>₺{stats.summary.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td className="px-3 py-3 text-sm text-purple-700 text-right">%{stats.summary.profitMargin}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                                    Seçilen tarihte satış bulunmamaktadır.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
