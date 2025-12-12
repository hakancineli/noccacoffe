'use client';

import { useState } from 'react';

interface ProductStat {
    productName: string;
    quantity: number;
    revenue: number;
}

interface DailyStats {
    date: string;
    summary: {
        totalOrders: number;
        totalProductsSold: number;
        totalRevenue: number;
    };
    products: ProductStat[];
}

export default function DailySalesStats() {
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [stats, setStats] = useState<DailyStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchStats = async (date: string) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/admin/reports/daily-sales?date=${date}`);
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
            fetchStats(date);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Günlük Satış Raporu</h3>

                <div className="flex items-end gap-4 mb-6">
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
                    <button
                        onClick={() => fetchStats(selectedDate)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                    >
                        Raporu Getir
                    </button>
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
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <dt className="text-sm font-medium text-gray-500">Toplam Sipariş</dt>
                                <dd className="mt-1 text-2xl font-semibold text-gray-900">{stats.summary.totalOrders}</dd>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <dt className="text-sm font-medium text-gray-500">Satılan Ürün Adedi</dt>
                                <dd className="mt-1 text-2xl font-semibold text-gray-900">{stats.summary.totalProductsSold}</dd>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <dt className="text-sm font-medium text-gray-500">Günlük Ciro</dt>
                                <dd className="mt-1 text-2xl font-semibold text-green-600">₺{stats.summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
                            </div>
                        </div>

                        {/* Detailed Table */}
                        <div>
                            <h4 className="text-base font-medium text-gray-900 mb-3">Ürün Bazlı Satış Detayı</h4>
                            {stats.products.length > 0 ? (
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün Adı</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Satış Adedi</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam Tutar</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {stats.products.map((product, idx) => (
                                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.productName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{product.quantity}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">₺{product.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                </tr>
                                            ))}
                                        </tbody>
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
