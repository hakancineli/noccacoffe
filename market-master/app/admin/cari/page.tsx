'use client';

import { useState } from 'react';
import {
    Users,
    Search,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Plus,
    ArrowRight,
    History,
    Wallet
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Data
const MOCK_CUSTOMERS = [
    { id: '1', name: 'Ahmet Yılmaz', phone: '0555 111 22 33', balance: 14250.50, limit: 25000, lastActivity: '2 saat önce' },
    { id: '2', name: 'Mehmet Demir', phone: '0542 333 44 55', balance: 2840.00, limit: 10000, lastActivity: 'Dün' },
    { id: '3', name: 'Ayşe Kaya (İnşaat Ltd. Şti.)', phone: '0212 555 66 77', balance: 85900.00, limit: 100000, lastActivity: '3 gün önce' },
    { id: '4', name: 'Caner Özcan', phone: '0530 999 88 77', balance: -450.00, limit: 5000, lastActivity: '1 hafta önce' },
];

export default function CariPage() {
    const [search, setSearch] = useState('');

    const totalReceivables = MOCK_CUSTOMERS.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0);
    const totalPayables = MOCK_CUSTOMERS.reduce((sum, c) => sum + (c.balance < 0 ? Math.abs(c.balance) : 0), 0);

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter font-outfit">Cari <span className="text-teal-400">Hesaplar</span></h1>
                    <p className="text-gray-500 mt-2 font-bold flex items-center gap-2 italic">
                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                        Toplam 152 aktif cari hesap, ₺{totalReceivables.toLocaleString()} alacak mevcut.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                        <Plus size={22} className="stroke-[3]" />
                        Yeni Müşteri
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon={<TrendingUp className="text-emerald-400" />}
                    label="Toplam Alacak"
                    value={`₺${totalReceivables.toLocaleString()}`}
                    sub="Müşterilerden beklenen"
                />
                <StatCard
                    icon={<TrendingDown className="text-red-400" />}
                    label="Müşteri Alacağı (Ön Ödeme)"
                    value={`₺${totalPayables.toLocaleString()}`}
                    sub="Emanet / Avans bakiye"
                />
                <StatCard
                    icon={<AlertCircle className="text-orange-400" />}
                    label="Limit Aşımı"
                    value="5"
                    sub="Riskli hesap sayısı"
                />
            </div>

            {/* Search & List */}
            <div className="bg-[#0d0d0f] border border-white/5 rounded-[40px] overflow-hidden">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div className="relative group w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-teal-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Müşteri adı veya telefon ara..."
                            className="bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-3 w-full outline-none focus:border-teal-500/50 transition-all font-medium"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sıralama:</span>
                        <button className="text-[10px] font-black uppercase tracking-widest text-teal-400 underline underline-offset-4">Borç Miktarı</button>
                        <button className="text-[10px] font-black uppercase tracking-widest text-gray-600">İsim (A-Z)</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5">
                    {MOCK_CUSTOMERS.map((c) => (
                        <motion.div
                            key={c.id}
                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                            className="bg-[#0d0d0f] p-8 flex flex-col justify-between group cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex gap-4">
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-teal-500/30 transition-colors">
                                        <Users className="w-6 h-6 text-gray-500 group-hover:text-teal-400 transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-teal-400 transition-colors">{c.name}</h3>
                                        <p className="text-xs text-gray-500 font-bold mt-1 tracking-widest uppercase">{c.phone}</p>
                                    </div>
                                </div>
                                <button className="p-2 hover:bg-white/5 rounded-xl text-gray-700 hover:text-white transition-all">
                                    <History size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/40 rounded-3xl p-4 border border-white/5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">GÜNCEL BAKİYE</p>
                                    <p className={`text-2xl font-black tracking-tighter ${c.balance > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                                        ₺{Math.abs(c.balance).toLocaleString()}
                                        <span className="text-[10px] ml-1 uppercase">{c.balance > 0 ? 'BORÇ' : 'ALACAK'}</span>
                                    </p>
                                </div>
                                <div className="bg-black/40 rounded-3xl p-4 border border-white/5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">VARLIK DURUMU</p>
                                    <div className="h-2 bg-white/5 rounded-full mt-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${c.balance / c.limit > 0.8 ? 'bg-red-500' : 'bg-teal-500'}`}
                                            style={{ width: `${Math.min(100, (c.balance / c.limit) * 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase">Limit: ₺{c.limit.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                                <span className="text-[10px] text-gray-600 font-bold italic">Son işlem: {c.lastActivity}</span>
                                <div className="flex gap-2">
                                    <button className="bg-teal-500/10 text-teal-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-500 hover:text-white transition-all">TAHSİLAT YAP</button>
                                    <button className="bg-white/5 text-white p-2 rounded-xl hover:bg-white/10 transition-all"><ArrowRight size={18} /></button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode, label: string, value: string, sub: string }) {
    return (
        <div className="p-8 bg-[#0d0d0f] border border-white/5 rounded-[40px] relative overflow-hidden group hover:border-white/10 transition-all border-l-4 border-l-teal-500/20">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                {icon}
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">{label}</p>
                <h3 className="text-3xl font-black tracking-tighter uppercase font-outfit">{value}</h3>
                <p className="text-[10px] font-bold text-gray-500 mt-1 italic">{sub}</p>
            </div>
        </div>
    );
}
