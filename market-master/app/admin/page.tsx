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
                <Loader2 className="w-12 h-12 text-accent animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted">Dashboard Hazırlanıyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 transition-colors duration-300">
            {/* Welcome Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter font-outfit text-foreground">İşletme <span className="text-accent">Genel Bakış</span></h1>
                    <p className="text-muted mt-2 font-bold flex items-center gap-2 italic">
                        Bugün, 30 Aralık 2025 • Merhaba Ahmet! İşler yolunda görünüyor.
                    </p>
                </div>
                <div className="bg-card border border-border-color rounded-2xl px-6 py-3 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted" />
                    <span className="text-sm font-black uppercase tracking-widest text-muted">Son 30 Gün</span>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Aylık Ciro"
                    value={`₺${stats.totalSales.toLocaleString()}`}
                    trend="+12.5%"
                    positive
                    icon={<DollarSign className="text-emerald-500" />}
                />
                <StatCard
                    label="Net Kar"
                    value={`₺${stats.netProfit.toLocaleString()}`}
                    trend="+8.2%"
                    positive
                    icon={<TrendingUp className="text-accent" />}
                />
                <StatCard
                    label="Alacaklar (Cari)"
                    value={`₺${stats.totalReceivables.toLocaleString()}`}
                    trend="+420₺ bugün"
                    icon={<Users className="text-orange-500" />}
                />
                <StatCard
                    label="Kar Marjı"
                    value={`%${stats.margin.toFixed(1)}`}
                    trend="-2.1% v.geçen ay"
                    icon={<Activity className="text-purple-500" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Transactions / Expenses */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Hızlı <span className="text-accent">İşlemler</span></h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <QuickAction icon={<Package />} label="Yeni Ürün Kaydı" desc="Stoklara yeni giriş yap" href="/admin/inventory" />
                        <QuickAction icon={<CreditCard />} label="Tahsilat Gir" desc="Müşteriden ödeme al" href="/admin/cari" color="text-emerald-500" />
                        <QuickAction icon={<DollarSign />} label="Gider Kaydet" desc="Fatura, maaş veya kira girişi" href="/admin/financials" color="text-red-500" />
                        <QuickAction icon={<Users />} label="Yeni Müşteri" desc="Cari hesabı oluştur" href="/admin/cari" color="text-blue-500" />
                    </div>
                </div>

                {/* Business Health & Low Stock Card */}
                <div className="space-y-8">
                    {/* Low Stock Alerts */}
                    <div className="bg-card border border-border-color rounded-[40px] p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-black uppercase tracking-tighter">Kritik Stoklar</h3>
                            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg">
                                {stats?.lowStockCount || 0} UYARI
                            </span>
                        </div>

                        <div className="space-y-4">
                            {stats?.lowStockItems?.length > 0 ? (
                                stats.lowStockItems.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-2xl border border-border-color">
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-black uppercase tracking-tight">{item.productName}</p>
                                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{item.branchName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-red-500">{item.quantity} {item.unit || 'adet'}</p>
                                            <p className="text-[9px] font-bold text-muted uppercase">Limit: {item.minStock}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-6 text-center text-[10px] font-black uppercase text-muted italic">
                                    Kritik stok bulunmuyor.
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => window.location.href = '/admin/inventory'}
                            className="w-full py-4 bg-secondary border border-border-color rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all"
                        >
                            Envanteri Yönet <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Business Health Card */}
                    <div className="bg-card border border-border-color rounded-[40px] p-8 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute -top-20 -right-20 w-60 h-60 bg-accent/5 blur-[100px] group-hover:bg-accent/10 transition-all"></div>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-6">İşletme Sağlığı</p>
                            <div className="space-y-6">
                                <HealthBar label="Stok Devir Hızı" value={85} color="bg-blue-500" />
                                <HealthBar label="Tahsilat Performansı" value={72} color="bg-teal-500" />
                                <HealthBar label="Müşteri Sadakati" value={94} color="bg-purple-500" />
                            </div>
                        </div>

                        <button className="mt-12 w-full py-4 bg-secondary border border-border-color rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] text-foreground hover:bg-accent hover:text-white hover:border-accent transition-all group">
                            Detaylı Raporu Gör
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, trend, positive, icon }: { label: string, value: string, trend: string, positive?: boolean, icon: React.ReactNode }) {
    return (
        <div className="bg-card border border-border-color rounded-[40px] p-8 hover:border-accent/30 transition-all group relative overflow-hidden shadow-sm">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div className="p-3 bg-secondary rounded-2xl group-hover:scale-110 transition-transform">
                        {icon}
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${positive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {trend}
                    </div>
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">{label}</p>
                    <h3 className="text-3xl font-black tracking-tighter font-outfit uppercase text-foreground">{value}</h3>
                </div>
            </div>
        </div>
    );
}

function QuickAction({ icon, label, desc, href, color = "text-accent" }: { icon: React.ReactNode, label: string, desc: string, href: string, color?: string }) {
    return (
        <a href={href} className="bg-card border border-border-color rounded-3xl p-6 hover:bg-secondary hover:border-accent/20 transition-all flex items-center gap-4 group">
            <div className={`p-4 bg-secondary rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div>
                <p className="font-black uppercase text-xs tracking-tight text-foreground">{label}</p>
                <p className="text-[10px] text-muted font-bold mt-0.5">{desc}</p>
            </div>
        </a>
    );
}

function HealthBar({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between">
                <span className="text-[10px] font-black uppercase text-muted">{label}</span>
                <span className="text-[10px] font-black text-foreground">%{value}</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
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
