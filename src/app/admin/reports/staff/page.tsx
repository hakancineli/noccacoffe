'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaChartLine, FaCoffee, FaMoneyBillWave, FaArrowLeft, FaCalendarAlt, FaStar, FaListUl } from 'react-icons/fa';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface StaffStats {
    totalOrders: number;
    totalRevenue: number;
    totalItems: number;
    averageOrderValue: number;
    productStats: { name: string, quantity: number, revenue: number }[];
    topProduct: { name: string, quantity: number, revenue: number } | null;
    recentSales: any[];
    pos?: {
        totalOrders: number;
        totalRevenue: number;
        totalItems: number;
        averageOrderValue: number;
        productStats: { name: string, quantity: number, revenue: number }[];
        topProduct: { name: string, quantity: number, revenue: number } | null;
        recentSales: any[];
    };
    kitchen?: {
        totalOrders: number;
        totalItems: number;
        productStats: { name: string, quantity: number }[];
        topProduct: { name: string, quantity: number } | null;
        recentPrepared: any[];
    };
    combined?: {
        totalOrders: number;
        totalItemsHandled: number;
    };
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

    const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444'];

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <Link href="/admin/staff" className="flex items-center text-nocca-green hover:underline mb-6 font-bold">
                    <FaArrowLeft className="mr-2" /> Personel Listesine Dön
                </Link>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-gray-100">
                    <div className="bg-gradient-to-r from-nocca-green to-green-800 p-8 text-white flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-widest opacity-80 mb-1 font-bold">Personel Performans Analizi</p>
                            <h1 className="text-4xl font-black tracking-tight">{staffName || 'Yükleniyor...'}</h1>
                        </div>
                        <div className="flex bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
                            {[
                                { id: 'daily', label: 'Günlük' },
                                { id: 'weekly', label: 'Haftalık' },
                                { id: 'monthly', label: 'Aylık' }
                            ].map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => setPeriod(p.id)}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all duration-300 ${period === p.id
                                        ? 'bg-white text-nocca-green shadow-xl scale-105'
                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-20 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-nocca-green border-t-transparent mx-auto mb-4"></div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Veriler Hesaplanıyor...</p>
                        </div>
                    ) : stats ? (
                        <div className="p-6 md:p-10">
                            {/* Key Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <FaCoffee className="text-xl" />
                                        </div>
                                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Sipariş</span>
                                    </div>
                                    <div className="text-3xl font-black text-gray-900">{stats.totalOrders}</div>
                                    <p className="text-xs text-gray-400 font-bold mt-1">Tamamlanan İşlem</p>
                                </div>

                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-green-50 text-green-600 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                                            <FaMoneyBillWave className="text-xl" />
                                        </div>
                                        <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Hasılat</span>
                                    </div>
                                    <div className="text-3xl font-black text-gray-900">₺{stats.totalRevenue.toLocaleString()}</div>
                                    <p className="text-xs text-gray-400 font-bold mt-1">Toplam Ciro</p>
                                </div>

                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                            <FaChartLine className="text-xl" />
                                        </div>
                                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Sepet</span>
                                    </div>
                                    <div className="text-3xl font-black text-gray-900">₺{stats.averageOrderValue.toFixed(1)}</div>
                                    <p className="text-xs text-gray-400 font-bold mt-1">Ortalama Tutar</p>
                                </div>

                                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-3xl shadow-lg shadow-amber-200 text-white relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <FaStar className="text-amber-200 text-xl" />
                                            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Favori Ürün</span>
                                        </div>
                                        <div className="text-xl font-black truncate">{stats.topProduct?.name || 'Yok'}</div>
                                        <p className="text-xs text-white/80 font-bold mt-1">{stats.topProduct?.quantity || 0} Adet Satış</p>
                                    </div>
                                    <FaCoffee className="absolute -right-4 -bottom-4 text-white/10 text-8xl rotate-12 group-hover:scale-110 transition-transform" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* Product Breakdown Table */}
                                <div>
                                    <h3 className="text-sm font-black uppercase text-gray-400 tracking-[0.2em] mb-6 flex items-center gap-3">
                                        <FaListUl className="text-nocca-green" /> Ürün Satış Detayları
                                    </h3>
                                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100">
                                                    <th className="px-6 py-5">Ürün</th>
                                                    <th className="px-6 py-5 text-center">Adet</th>
                                                    <th className="px-6 py-5 text-right">Ciro</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {stats.productStats.map((item, index) => (
                                                    <tr key={item.name} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-gray-700">{item.name}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-black text-gray-600">
                                                                {item.quantity}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-black text-nocca-green">₺{item.revenue.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                                {stats.productStats.length === 0 && (
                                                    <tr>
                                                        <td colSpan={3} className="px-6 py-20 text-center text-gray-400 font-bold text-sm uppercase tracking-widest">Veri Bulunamadı</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Graphical Analysis */}
                                <div>
                                    <h3 className="text-sm font-black uppercase text-gray-400 tracking-[0.2em] mb-6 flex items-center gap-3">
                                        <FaChartLine className="text-blue-500" /> Satış Dağılım Grafiği
                                    </h3>
                                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stats.productStats.slice(0, 8)} layout="vertical" margin={{ left: 30 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                                <XAxis type="number" hide />
                                                <YAxis
                                                    dataKey="name"
                                                    type="category"
                                                    width={100}
                                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <Tooltip
                                                    cursor={{ fill: '#f8fafc' }}
                                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 900 }}
                                                    labelStyle={{ color: '#10b981', marginBottom: '4px' }}
                                                />
                                                <Bar dataKey="quantity" radius={[0, 8, 8, 0]} barSize={24} name="Satış Adedi">
                                                    {stats.productStats.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Recent Activity Mini List */}
                                    <div className="mt-8">
                                        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-4">Son Operasyonlar</h3>
                                        <div className="space-y-2">
                                            {stats.recentSales.slice(0, 5).map(sale => (
                                                <div key={sale.id} className="bg-white p-3 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                                                    <span className="text-xs font-black text-gray-500">#{sale.orderNumber}</span>
                                                    <span className="text-xs font-black text-nocca-green">₺{sale.amount.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* KITCHEN PERFORMANCE SECTION */}
                            {stats.kitchen && stats.kitchen.totalOrders > 0 && (
                                <div className="mt-12">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-200 to-transparent"></div>
                                        <h2 className="text-sm font-black uppercase text-orange-500 tracking-[0.2em] flex items-center gap-2">
                                            🔥 Mutfak Performansı
                                        </h2>
                                        <div className="h-px flex-1 bg-gradient-to-r from-orange-200 via-transparent to-transparent"></div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm hover:shadow-md transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                                    <FaCoffee className="text-xl" />
                                                </div>
                                                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Hazırlanan</span>
                                            </div>
                                            <div className="text-3xl font-black text-gray-900">{stats.kitchen.totalOrders}</div>
                                            <p className="text-xs text-gray-400 font-bold mt-1">Sipariş Hazırlandı</p>
                                        </div>

                                        <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm hover:shadow-md transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                                    <FaChartLine className="text-xl" />
                                                </div>
                                                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Bardak</span>
                                            </div>
                                            <div className="text-3xl font-black text-gray-900">{stats.kitchen.totalItems}</div>
                                            <p className="text-xs text-gray-400 font-bold mt-1">Toplam Ürün/Bardak</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-3xl shadow-lg shadow-orange-200 text-white relative overflow-hidden group">
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-4">
                                                    <FaStar className="text-orange-200 text-xl" />
                                                    <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">En Çok Hazırlanan</span>
                                                </div>
                                                <div className="text-xl font-black truncate">{stats.kitchen.topProduct?.name || 'Yok'}</div>
                                                <p className="text-xs text-white/80 font-bold mt-1">{stats.kitchen.topProduct?.quantity || 0} Adet</p>
                                            </div>
                                            <FaCoffee className="absolute -right-4 -bottom-4 text-white/10 text-8xl rotate-12 group-hover:scale-110 transition-transform" />
                                        </div>
                                    </div>

                                    {/* Kitchen Product Breakdown */}
                                    <div className="bg-white rounded-3xl border border-orange-100 overflow-hidden shadow-sm">
                                        <div className="px-6 py-4 bg-orange-50/50 border-b border-orange-100">
                                            <h3 className="text-xs font-black uppercase text-orange-500 tracking-[0.2em] flex items-center gap-2">
                                                <FaListUl /> Mutfak Ürün Detayları
                                            </h3>
                                        </div>
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100">
                                                    <th className="px-6 py-4">Ürün</th>
                                                    <th className="px-6 py-4 text-center">Hazırlanan Adet</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {stats.kitchen.productStats.map((item) => (
                                                    <tr key={item.name} className="hover:bg-orange-50/30 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-gray-700">{item.name}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="px-3 py-1 bg-orange-100 rounded-full text-xs font-black text-orange-700">
                                                                {item.quantity}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {stats.kitchen.productStats.length === 0 && (
                                                    <tr>
                                                        <td colSpan={2} className="px-6 py-12 text-center text-gray-400 font-bold text-sm uppercase tracking-widest">Veri Bulunamadı</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Recent Kitchen Activity */}
                                    {stats.kitchen.recentPrepared && stats.kitchen.recentPrepared.length > 0 && (
                                        <div className="mt-6">
                                            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-4">Son Hazırlanan Siparişler</h3>
                                            <div className="space-y-2">
                                                {stats.kitchen.recentPrepared.slice(0, 5).map((item: any) => (
                                                    <div key={item.id} className="bg-white p-3 rounded-2xl border border-orange-100 flex justify-between items-center shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-black text-gray-500">#{item.orderNumber}</span>
                                                            <span className="text-[10px] text-gray-400">{item.customerName}</span>
                                                        </div>
                                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-black">{item.itemCount} ürün</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
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
