'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaChartLine, FaCoffee, FaMoneyBillWave, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import Link from 'next/link';

interface StaffStats {
    totalOrders: number;
    totalRevenue: number;
    totalItems: number;
    averageOrderValue: number;
    recentSales: any[];
}

function StaffPerformanceContent() {
    const searchParams = useSearchParams();
    const staffId = searchParams.get('id');
    const [period, setPeriod] = useState('daily');
    const [stats, setStats] = useState<StaffStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [staffName, setStaffName] = useState('');

    useEffect(() => {
        if (staffId) {
            fetchStats();
            fetchStaffDetail();
        }
    }, [staffId, period]);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/reports/staff/${staffId}?period=${period}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStaffDetail = async () => {
        try {
            const res = await fetch('/api/admin/staff');
            if (res.ok) {
                const list = await res.json();
                const found = list.find((s: any) => s.id === staffId);
                if (found) setStaffName(found.name);
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (!staffId) return <div className="p-8 text-center text-red-500">Personel ID bulunamadı.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/admin/staff" className="flex items-center text-nocca-green hover:underline mb-6 font-bold">
                    <FaArrowLeft className="mr-2" /> Personel Listesine Dön
                </Link>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
                    <div className="bg-nocca-green p-8 text-white flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Personel Performans Analizi</p>
                            <h1 className="text-3xl font-black">{staffName || 'Yükleniyor...'}</h1>
                        </div>
                        <div className="flex bg-white/20 p-1 rounded-xl">
                            {['daily', 'weekly', 'monthly'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${period === p ? 'bg-white text-nocca-green shadow-lg' : 'hover:bg-white/10'
                                        }`}
                                >
                                    {p === 'daily' ? 'Günlük' : p === 'weekly' ? 'Haftalık' : 'Aylık'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-20 text-center text-gray-400 font-medium">Veriler Hesaplanıyor...</div>
                    ) : stats ? (
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <FaCoffee className="text-blue-500 text-xl" />
                                        <span className="text-[10px] uppercase font-black text-blue-400">Satış Adedi</span>
                                    </div>
                                    <div className="text-3xl font-black text-blue-900">{stats.totalOrders}</div>
                                </div>
                                <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <FaMoneyBillWave className="text-green-500 text-xl" />
                                        <span className="text-[10px] uppercase font-black text-green-400">Toplam Ciro</span>
                                    </div>
                                    <div className="text-3xl font-black text-green-900">₺{stats.totalRevenue.toLocaleString()}</div>
                                </div>
                                <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <FaChartLine className="text-purple-500 text-xl" />
                                        <span className="text-[10px] uppercase font-black text-purple-400">Ort. Sepet</span>
                                    </div>
                                    <div className="text-3xl font-black text-purple-900">₺{stats.averageOrderValue.toFixed(1)}</div>
                                </div>
                                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <FaCalendarAlt className="text-amber-500 text-xl" />
                                        <span className="text-[10px] uppercase font-black text-amber-400">Toplam Ürün</span>
                                    </div>
                                    <div className="text-3xl font-black text-amber-900">{stats.totalItems}</div>
                                </div>
                            </div>

                            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-nocca-green rounded-full"></span>
                                Son Satışlar
                            </h3>
                            <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] uppercase font-black text-gray-400 border-b border-gray-200">
                                            <th className="px-6 py-4">Fiş No</th>
                                            <th className="px-6 py-4">Zaman</th>
                                            <th className="px-6 py-4 text-right">Tutar</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {stats.recentSales.map((sale) => (
                                            <tr key={sale.id} className="hover:bg-white transition-colors">
                                                <td className="px-6 py-4 font-mono font-bold text-gray-600">{sale.orderNumber}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(sale.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-6 py-4 text-right font-black text-nocca-green">₺{sale.amount.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                        {stats.recentSales.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-10 text-center text-gray-400">Bu dönemde henüz satış yapılmamış.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default function StaffPerformancePage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-400">Sayfa Yükleniyor...</div>}>
            <StaffPerformanceContent />
        </Suspense>
    );
}
