'use client';

import { useState, useEffect } from 'react';
import {
    TrendingUp,
    Package,
    Users,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Activity,
    Calendar,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/dashboard')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
                <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Dashboard Hazırlanıyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Welcome Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter font-outfit">İşletme <span className="text-teal-400">Genel Bakış</span></h1>
                    <p className="text-gray-500 mt-2 font-bold flex items-center gap-2 italic">
                        Bugün, 30 Aralık 2025 • Merhaba Ahmet! İşler yolunda görünüyor.
                    </p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl px-6 py-3 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-black uppercase tracking-widest text-gray-400">Son 30 Gün</span>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Aylık Ciro"
                    value={`₺${stats.totalSales.toLocaleString()}`}
                    trend="+12.5%"
                    positive
                    icon={<DollarSign className="text-emerald-400" />}
                />
                <StatCard
                    label="Net Kar"
                    value={`₺${stats.netProfit.toLocaleString()}`}
                    trend="+8.2%"
                    positive
                    icon={<TrendingUp className="text-blue-400" />}
                />
                <StatCard
                    label="Alacaklar (Cari)"
                    value={`₺${stats.totalReceivables.toLocaleString()}`}
                    trend="+420₺ bugün"
                    icon={<Users className="text-orange-400" />}
                />
                <StatCard
                    label="Kar Marjı"
                    value={`%${stats.margin.toFixed(1)}`}
                    trend="-2.1% v.geçen ay"
                    icon={<Activity className="text-purple-400" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Transactions / Expenses */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black uppercase tracking-tight">Hızlı <span className="text-teal-400">İşlemler</span></h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <QuickAction icon={<Package />} label="Yeni Ürün Kaydı" desc="Stoklara yeni giriş yap" href="/admin/inventory" />
                        <QuickAction icon={<CreditCard />} label="Tahsilat Gir" desc="Müşteriden ödeme al" href="/admin/cari" color="text-emerald-400" />
                        <QuickAction icon={<DollarSign />} label="Gider Kaydet" desc="Fatura, maaş veya kira girişi" href="/admin/financials" color="text-red-400" />
                        <QuickAction icon={<Users />} label="Yeni Müşteri" desc="Cari hesabı oluştur" href="/admin/cari" color="text-blue-400" />
                    </div>
                </div>

                {/* Business Health Card */}
                <div className="bg-[#0d0d0f] border border-white/5 rounded-[40px] p-8 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-teal-500/5 blur-[100px] group-hover:bg-teal-500/10 transition-all"></div>

                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-6">İşletme Sağlığı</p>
                        <div className="space-y-6">
                            <HealthBar label="Stok Devir Hızı" value={85} color="bg-blue-500" />
                            <HealthBar label="Tahsilat Performansı" value={72} color="bg-teal-500" />
                            <HealthBar label="Müşteri Sadakati" value={94} color="bg-purple-500" />
                        </div>
                    </div>

                    <button className="mt-12 w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all group">
                        Detaylı Raporu Gör
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, trend, positive, icon }: { label: string, value: string, trend: string, positive?: boolean, icon: React.ReactNode }) {
    return (
        <div className="bg-[#0d0d0f] border border-white/5 rounded-[40px] p-8 hover:border-white/10 transition-all group relative overflow-hidden">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                        {icon}
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-500'}`}>
                        {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {trend}
                    </div>
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">{label}</p>
                    <h3 className="text-3xl font-black tracking-tighter font-outfit uppercase">{value}</h3>
                </div>
            </div>
        </div>
    );
}

function QuickAction({ icon, label, desc, href, color = "text-teal-400" }: { icon: React.ReactNode, label: string, desc: string, href: string, color?: string }) {
    return (
        <a href={href} className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/10 hover:border-white/10 transition-all flex items-center gap-4 group">
            <div className={`p-4 bg-black/40 rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div>
                <p className="font-black uppercase text-xs tracking-tight">{label}</p>
                <p className="text-[10px] text-gray-600 font-bold mt-0.5">{desc}</p>
            </div>
        </a>
    );
}

function HealthBar({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between">
                <span className="text-[10px] font-black uppercase text-gray-500">{label}</span>
                <span className="text-[10px] font-black text-white">%{value}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${color}`}
                />
            </div>
        </div>
    );
}
