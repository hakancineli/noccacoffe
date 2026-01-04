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
        <div className="space-y-8 pb-10 transition-colors duration-300">
            {/* Page Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter font-outfit text-foreground">Cari <span className="text-accent">Hesaplar</span></h1>
                    <p className="text-muted mt-2 font-bold flex items-center gap-2 italic">
                        <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                        Toplam {customers.length} aktif cari hesap, ₺{totalReceivables.toLocaleString()} alacak mevcut.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-card border border-border-color px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-foreground hover:bg-accent hover:text-white hover:border-accent transition-all flex items-center gap-3 shadow-sm">
                        <Plus size={22} className="stroke-[3]" />
                        Yeni Müşteri
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon={<TrendingUp className="text-emerald-500" />}
                    label="Toplam Alacak"
                    value={`₺${totalReceivables.toLocaleString()}`}
                    sub="Müşterilerden beklenen"
                />
                <StatCard
                    icon={<TrendingDown className="text-red-500" />}
                    label="Emanet / Avans"
                    value={`₺${totalPayables.toLocaleString()}`}
                    sub="Müşteri alacağı"
                />
                <StatCard
                    icon={<AlertCircle className="text-orange-500" />}
                    label="Limit Aşımı"
                    value={customers.filter(c => c.balance > c.limit && c.limit > 0).length.toString()}
                    sub="Riskli hesap sayısı"
                />
            </div>

            {/* Search & List */}
            <div className="bg-card border border-border-color rounded-[40px] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-border-color flex justify-between items-center bg-foreground/[0.02]">
                    <div className="relative group w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-accent transition-colors" />
                        <input
                            type="text"
                            placeholder="Müşteri adı veya telefon ara..."
                            className="bg-secondary border border-border-color rounded-2xl pl-12 pr-6 py-3 w-full outline-none focus:border-accent/50 transition-all font-medium text-foreground"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 text-accent animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted">Veriler Yükleniyor...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border-color">
                        {filtered.map((c) => (
                            <motion.div
                                key={c.id}
                                whileHover={{ backgroundColor: 'var(--bg-secondary)' }}
                                className="bg-card p-8 flex flex-col justify-between group transition-colors"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-4">
                                        <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center border border-border-color group-hover:border-accent/30 transition-colors shadow-inner">
                                            <Users className="w-6 h-6 text-muted group-hover:text-accent transition-colors" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black uppercase tracking-tight text-foreground group-hover:text-accent transition-colors">{c.name}</h3>
                                            <p className="text-xs text-muted font-bold mt-1 tracking-widest uppercase">{c.phone || 'No Telefon'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedCustomer(c);
                                            fetchHistory(c.id);
                                        }}
                                        className="p-2 hover:bg-secondary rounded-xl text-muted hover:text-foreground transition-all"
                                    >
                                        <HistoryIcon size={20} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-secondary rounded-3xl p-4 border border-border-color shadow-inner">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">GÜNCEL BAKİYE</p>
                                        <p className={`text-2xl font-black tracking-tighter ${c.balance > 0 ? 'text-orange-500' : 'text-emerald-500'}`}>
                                            ₺{Math.abs(c.balance).toLocaleString()}
                                            <span className="text-[10px] ml-1 uppercase">{c.balance >= 0 ? 'BORÇ' : 'ALACAK'}</span>
                                        </p>
                                    </div>
                                    <div className="bg-secondary rounded-3xl p-4 border border-border-color shadow-inner">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">VARLIK DURUMU</p>
                                        <div className="h-2 bg-background/20 rounded-full mt-2 overflow-hidden shadow-inner">
                                            <div
                                                className={`h-full rounded-full ${c.limit > 0 && c.balance / c.limit > 0.8 ? 'bg-red-500' : 'bg-accent'}`}
                                                style={{ width: `${c.limit > 0 ? Math.min(100, (c.balance / c.limit) * 100) : 0}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] font-bold text-muted mt-2 uppercase">Limit: ₺{(c.limit || 0).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-border-color flex justify-end items-center gap-3">
                                    <button
                                        onClick={() => {
                                            setSelectedCustomer(c);
                                            setShowPaymentModal(true);
                                        }}
                                        className="bg-accent/10 text-accent px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all border border-accent/20"
                                    >
                                        TAHSİLAT YAP
                                    </button>
                                    <button className="bg-secondary text-foreground p-2 rounded-xl hover:bg-accent transition-all group-hover:shadow-sm shadow-accent-glow"><ArrowRight size={18} /></button>
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
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPaymentModal(false)} className="absolute inset-0 bg-background/80 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-card border border-border-color w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl"
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">Tahsilat <span className="text-accent">Kaydı</span></h2>
                                    <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-secondary rounded-xl transition-colors text-foreground"><X size={20} /></button>
                                </div>

                                <div className="bg-secondary p-6 rounded-3xl border border-border-color mb-8 shadow-inner">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">MÜŞTERİ</p>
                                    <p className="text-xl font-black uppercase tracking-tight text-foreground">{selectedCustomer?.name}</p>
                                </div>

                                <form onSubmit={handlePayment} className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2 pl-4">ÖDEME TUTARI (₺)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            className="w-full bg-secondary border border-border-color rounded-2xl p-6 text-3xl font-black tracking-tighter text-accent outline-none focus:border-accent/50 transition-all shadow-inner"
                                            placeholder="0.00"
                                            value={paymentAmount}
                                            onChange={e => setPaymentAmount(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2 pl-4">AÇIKLAMA (OPSİYONEL)</label>
                                        <input
                                            type="text"
                                            className="w-full bg-secondary border border-border-color rounded-2xl p-4 text-sm font-bold outline-none focus:border-accent/50 transition-all text-foreground shadow-sm"
                                            placeholder="Tahsilat açıklaması..."
                                            value={paymentDesc}
                                            onChange={e => setPaymentDesc(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        onClick={handlePayment}
                                        disabled={isSubmitting}
                                        className="w-full bg-accent text-white p-6 rounded-3xl font-black uppercase tracking-widest shadow-lg shadow-accent-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
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
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHistoryModal(false)} className="absolute inset-0 bg-background/80 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: 50 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9, x: 50 }}
                            className="relative bg-card border border-border-color w-full max-w-2xl h-[80vh] rounded-[40px] overflow-hidden flex flex-col shadow-2xl"
                        >
                            <div className="p-10 border-b border-border-color bg-foreground/[0.02]">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">Cari <span className="text-accent">Geçmiş</span></h2>
                                        <p className="text-xs text-muted font-bold uppercase mt-1 tracking-widest">{selectedCustomer?.name}</p>
                                    </div>
                                    <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-secondary rounded-xl transition-colors text-foreground"><X size={20} /></button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-4">
                                {history.map((tx) => (
                                    <div key={tx.id} className="bg-secondary border border-border-color rounded-3xl p-6 flex justify-between items-center group hover:bg-background/20 transition-all shadow-sm">
                                        <div className="flex gap-4 items-center">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${tx.type === 'PAYMENT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                                                }`}>
                                                {tx.type === 'PAYMENT' ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-black text-sm uppercase tracking-tight text-foreground">{tx.description}</p>
                                                <p className="text-[10px] text-muted font-black uppercase mt-1">{new Date(tx.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xl font-black tracking-tighter ${tx.type === 'PAYMENT' ? 'text-emerald-500' : 'text-orange-500'
                                                }`}>
                                                {tx.type === 'PAYMENT' ? '-' : '+'} ₺{tx.amount.toLocaleString()}
                                            </p>
                                            <p className="text-[10px] text-muted font-black uppercase mt-1">{tx.type === 'PAYMENT' ? 'TAHSİLAT' : 'SATIŞ/BORÇ'}</p>
                                        </div>
                                    </div>
                                ))}
                                {history.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-muted py-20 grayscale opacity-20">
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
        <div className="p-8 bg-card border border-border-color rounded-[40px] relative overflow-hidden group hover:border-accent/30 transition-all border-l-4 border-l-accent shadow-sm">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity text-foreground">
                {icon}
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">{label}</p>
                <h3 className="text-3xl font-black tracking-tighter uppercase font-outfit text-foreground">{value}</h3>
                <p className="text-[10px] font-bold text-muted mt-1 italic">{sub}</p>
            </div>
        </div>
    );
}
