'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Search,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Plus,
    ArrowRight,
    History as HistoryIcon,
    Wallet,
    X,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CariPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentDesc, setPaymentDesc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/admin/cari');
            const data = await res.json();
            setCustomers(data);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (id: string) => {
        setHistoryLoading(true);
        try {
            const res = await fetch(`/api/admin/cari/${id}`);
            const data = await res.json();
            setHistory(data);
            setShowHistoryModal(true);
        } catch (error) {
            console.error('History fetch error:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentAmount || !selectedCustomer) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/admin/cari', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merchantId: 'test-merchant',
                    customerId: selectedCustomer.id,
                    amount: parseFloat(paymentAmount),
                    description: paymentDesc || 'Tahsilat',
                    type: 'PAYMENT'
                })
            });

            if (res.ok) {
                setShowPaymentModal(false);
                setPaymentAmount('');
                setPaymentDesc('');
                fetchCustomers();
            }
        } catch (error) {
            console.error('Payment error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalReceivables = customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0);
    const totalPayables = customers.reduce((sum, c) => sum + (c.balance < 0 ? Math.abs(c.balance) : 0), 0);

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search)
    );

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter font-outfit">Cari <span className="text-teal-400">Hesaplar</span></h1>
                    <p className="text-gray-500 mt-2 font-bold flex items-center gap-2 italic">
                        <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                        Toplam {customers.length} aktif cari hesap, ₺{totalReceivables.toLocaleString()} alacak mevcut.
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
                    label="Emanet / Avans"
                    value={`₺${totalPayables.toLocaleString()}`}
                    sub="Müşteri alacağı"
                />
                <StatCard
                    icon={<AlertCircle className="text-orange-400" />}
                    label="Limit Aşımı"
                    value={customers.filter(c => c.balance > c.limit && c.limit > 0).length.toString()}
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
                </div>

                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Veriler Yükleniyor...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5">
                        {filtered.map((c) => (
                            <motion.div
                                key={c.id}
                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                                className="bg-[#0d0d0f] p-8 flex flex-col justify-between group"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-4">
                                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-teal-500/30 transition-colors">
                                            <Users className="w-6 h-6 text-gray-500 group-hover:text-teal-400 transition-colors" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-teal-400 transition-colors">{c.name}</h3>
                                            <p className="text-xs text-gray-500 font-bold mt-1 tracking-widest uppercase">{c.phone || 'No Telefon'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedCustomer(c);
                                            fetchHistory(c.id);
                                        }}
                                        className="p-2 hover:bg-white/5 rounded-xl text-gray-700 hover:text-white transition-all"
                                    >
                                        <HistoryIcon size={20} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/40 rounded-3xl p-4 border border-white/5">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">GÜNCEL BAKİYE</p>
                                        <p className={`text-2xl font-black tracking-tighter ${c.balance > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                                            ₺{Math.abs(c.balance).toLocaleString()}
                                            <span className="text-[10px] ml-1 uppercase">{c.balance >= 0 ? 'BORÇ' : 'ALACAK'}</span>
                                        </p>
                                    </div>
                                    <div className="bg-black/40 rounded-3xl p-4 border border-white/5">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">VARLIK DURUMU</p>
                                        <div className="h-2 bg-white/5 rounded-full mt-2 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${c.limit > 0 && c.balance / c.limit > 0.8 ? 'bg-red-500' : 'bg-teal-500'}`}
                                                style={{ width: `${c.limit > 0 ? Math.min(100, (c.balance / c.limit) * 100) : 0}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase">Limit: ₺{(c.limit || 0).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/5 flex justify-end items-center gap-3">
                                    <button
                                        onClick={() => {
                                            setSelectedCustomer(c);
                                            setShowPaymentModal(true);
                                        }}
                                        className="bg-teal-500/10 text-teal-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-500 hover:text-white transition-all"
                                    >
                                        TAHSİLAT YAP
                                    </button>
                                    <button className="bg-white/5 text-white p-2 rounded-xl hover:bg-white/10 transition-all"><ArrowRight size={18} /></button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPaymentModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-[#0d0d0f] border border-white/10 w-full max-w-lg rounded-[40px] overflow-hidden"
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Tahsilat <span className="text-teal-400">Kaydı</span></h2>
                                    <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X size={20} /></button>
                                </div>

                                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 mb-8">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">MÜŞTERİ</p>
                                    <p className="text-xl font-black uppercase tracking-tight">{selectedCustomer?.name}</p>
                                </div>

                                <form onSubmit={handlePayment} className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 pl-4">ÖDEME TUTARI (₺)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-3xl font-black tracking-tighter text-teal-400 outline-none focus:border-teal-500/50 transition-all"
                                            placeholder="0.00"
                                            value={paymentAmount}
                                            onChange={e => setPaymentAmount(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 pl-4">AÇIKLAMA (OPSİYONEL)</label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-teal-500/50 transition-all"
                                            placeholder="Tahsilat açıklaması..."
                                            value={paymentDesc}
                                            onChange={e => setPaymentDesc(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        disabled={isSubmitting}
                                        className="w-full bg-teal-500 text-white p-6 rounded-3xl font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                                        Tahsilatı Kaydet
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* History Modal */}
            <AnimatePresence>
                {showHistoryModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHistoryModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: 50 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9, x: 50 }}
                            className="relative bg-[#0d0d0f] border border-white/10 w-full max-w-2xl h-[80vh] rounded-[40px] overflow-hidden flex flex-col"
                        >
                            <div className="p-10 border-b border-white/5">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight">Cari <span className="text-teal-400">Geçmiş</span></h2>
                                        <p className="text-xs text-gray-500 font-bold uppercase mt-1 tracking-widest">{selectedCustomer?.name}</p>
                                    </div>
                                    <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X size={20} /></button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-4">
                                {history.map((tx) => (
                                    <div key={tx.id} className="bg-white/5 border border-white/5 rounded-3xl p-6 flex justify-between items-center group hover:bg-white/10 transition-all">
                                        <div className="flex gap-4 items-center">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'PAYMENT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'
                                                }`}>
                                                {tx.type === 'PAYMENT' ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-black text-sm uppercase tracking-tight">{tx.description}</p>
                                                <p className="text-[10px] text-gray-600 font-black uppercase mt-1">{new Date(tx.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xl font-black tracking-tighter ${tx.type === 'PAYMENT' ? 'text-emerald-400' : 'text-orange-400'
                                                }`}>
                                                {tx.type === 'PAYMENT' ? '-' : '+'} ₺{tx.amount.toLocaleString()}
                                            </p>
                                            <p className="text-[10px] text-gray-600 font-black uppercase mt-1">{tx.type === 'PAYMENT' ? 'TAHSİLAT' : 'SATIŞ/BORÇ'}</p>
                                        </div>
                                    </div>
                                ))}
                                {history.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-700 py-20 grayscale opacity-20">
                                        <HistoryIcon size={60} strokeWidth={1} />
                                        <p className="text-sm font-black uppercase tracking-widest mt-4">İşlem Kaydı Bulunamadı</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode, label: string, value: string, sub: string }) {
    return (
        <div className="p-8 bg-[#0d0d0f] border border-white/5 rounded-[40px] relative overflow-hidden group hover:border-white/10 transition-all border-l-4 border-l-teal-500/20 shadow-xl shadow-black/20">
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
