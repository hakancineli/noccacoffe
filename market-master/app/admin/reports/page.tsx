'use client';

import { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    ShoppingBag,
    PieChart,
    Calendar,
    Filter,
    ArrowRight,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RePieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';

export default function ReportsPage() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [range, setRange] = useState('7d');

    useEffect(() => {
        fetchReports();
    }, [range]);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/reports?range=${range}`);
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error('Reports fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !data) return (
        <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
            <RefreshCw className="w-10 h-10 text-accent animate-spin" />
            <p className="font-black uppercase tracking-[0.3em] text-[10px] text-muted">Veriler Analiz Ediliyor...</p>
        </div>
    );

    if (!data || data.error) return (
        <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-center p-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-[32px] flex items-center justify-center mb-4">
                <BarChart3 className="w-10 h-10 text-red-500 opacity-50" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tighter">Veri Yüklenemedi</h2>
            <p className="text-muted text-xs font-bold uppercase tracking-widest max-w-xs leading-relaxed">
                Raporlar hazırlanırken bir sorun oluştu veya henüz analiz edilecek satış verisi bulunmuyor.
            </p>
            <button
                onClick={fetchReports}
                className="mt-6 px-10 py-4 bg-secondary border border-border-color rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all"
            >
                Yeniden Dene
            </button>
        </div>
    );

    const COLORS = ['#14b8a6', '#38bdf8', '#6366f1', '#a855f7', '#ec4899'];

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/30 p-8 rounded-[40px] border border-border-color backdrop-blur-sm">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-accent" />
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter font-outfit">İşletme Analitiği</h1>
                    </div>
                    <p className="text-muted text-sm font-bold uppercase tracking-widest pl-1">Performans ve Kâr Raporları</p>
                </div>

                <div className="flex items-center bg-secondary p-1.5 rounded-2xl border border-border-color">
                    {['24h', '7d', '30d', 'all'].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${range === r ? 'bg-accent text-white shadow-lg shadow-accent-glow' : 'text-muted hover:text-foreground'
                                }`}
                        >
                            {r === '24h' ? 'Bugün' : r === '7d' ? '7 Gün' : r === '30d' ? '30 Gün' : 'Tümü'}
                        </button>
                    ))}
                </div>
            </header>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Toplam Ciro"
                    value={`₺${data?.summary?.revenue?.toLocaleString() || '0'}`}
                    trend="+12.5%"
                    isUp
                    icon={<DollarSign className="text-emerald-500" />}
                />
                <StatCard
                    label="Net Kâr"
                    value={`₺${data?.summary?.profit?.toLocaleString() || '0'}`}
                    trend="+8.2%"
                    isUp
                    icon={<TrendingUp className="text-accent" />}
                />
                <StatCard
                    label="Toplam Giderler"
                    value={`₺${data?.summary?.expenses?.toLocaleString() || '0'}`}
                    trend="-3.1%"
                    isUp={false}
                    icon={<ArrowDownRight className="text-red-500" />}
                />
                <StatCard
                    label="Sipariş Sayısı"
                    value={data?.summary?.orderCount || '0'}
                    trend="+50"
                    isUp
                    icon={<ShoppingBag className="text-blue-500" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 bg-card border border-border-color rounded-[40px] p-8 space-y-8"
                >
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-black uppercase tracking-tighter">Satış Trendi</h3>
                        <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest">
                            <div className="w-2 h-2 bg-accent rounded-full" /> Günlük Ciro (TRY)
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.charts?.dailyTrend || []}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: 'var(--text-secondary)' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: 'var(--text-secondary)' }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border-color)', fontWeight: 'black' }}
                                    itemStyle={{ color: 'var(--accent)' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Category Distribution */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card border border-border-color rounded-[40px] p-8 space-y-8 flex flex-col items-center"
                >
                    <h3 className="text-lg font-black uppercase tracking-tighter self-start">Kategori Dağılımı</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={data?.charts?.categoryDistribution || []}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {(data?.charts?.categoryDistribution || []).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full space-y-3">
                        {(data?.charts?.categoryDistribution || []).map((c: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <div className="flex items-center gap-2 text-muted">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    {c.name}
                                </div>
                                <span>₺{c.value?.toLocaleString() || '0'}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div className="bg-card border border-border-color rounded-[40px] p-8 space-y-6">
                    <h3 className="text-lg font-black uppercase tracking-tighter">En Çok Satan Ürünler</h3>
                    <div className="space-y-4">
                        {(data?.topProducts || []).map((p: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-5 bg-secondary/50 rounded-3xl border border-border-color group hover:border-accent/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center font-black text-accent text-xs">#{i + 1}</div>
                                    <div>
                                        <p className="font-black uppercase text-xs tracking-tight">{p.name}</p>
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{p.qty} Adet Satıldı</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-sm tracking-tighter text-accent">₺{p.revenue?.toLocaleString() || '0'}</p>
                                    <ArrowRight size={14} className="ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Performance Summary */}
                <motion.div className="bg-gradient-to-br from-accent/5 to-transparent border border-border-color rounded-[40px] p-10 flex flex-col justify-between">
                    <div className="space-y-4">
                        <p className="text-sm font-black uppercase tracking-[0.3em] text-accent">Verimlilik Analizi</p>
                        <h2 className="text-4xl font-black uppercase tracking-tighter leading-tight">
                            Ortalama Sepet Tutarınız <br />
                            <span className="text-accent underline decoration-accent-glow underline-offset-8">₺{data?.summary?.avgOrderValue?.toFixed(2) || '0.00'}</span>
                        </h2>
                    </div>

                    <div className="space-y-8 pt-10">
                        <MetricRow label="Tahmini Kâr Marjı" percentage={(data?.summary?.revenue && data.summary.revenue > 0) ? ((data.summary.profit / data.summary.revenue) * 100).toFixed(1) + '%' : '0%'} color="bg-accent" />
                        <MetricRow label="Gider Oranı" percentage={(data?.summary?.revenue && data.summary.revenue > 0) ? ((data.summary.expenses / data.summary.revenue) * 100).toFixed(1) + '%' : '0%'} color="bg-red-500" />
                        <MetricRow label="Müşteri Sadakati" percentage="84%" color="bg-blue-500" />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function StatCard({ label, value, trend, isUp, icon }: { label: string, value: any, trend: string, isUp: boolean, icon: React.ReactNode }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-card border border-border-color rounded-[32px] p-8 shadow-sm space-y-6 group hover:border-accent/20 transition-all"
        >
            <div className="flex justify-between items-start">
                <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {trend}
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted">{label}</p>
                <p className="text-3xl font-black font-outfit tracking-tighter">{value}</p>
            </div>
        </motion.div>
    );
}

function MetricRow({ label, percentage, color }: { label: string, percentage: string, color: string }) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-muted">{label}</span>
                <span>{percentage}</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden p-0.5 border border-border-color">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: percentage }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full rounded-full ${color} shadow-[0_0_10px_var(--accent-glow)]`}
                />
            </div>
        </div>
    );
}
