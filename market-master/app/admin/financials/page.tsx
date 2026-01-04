'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    TrendingDown,
    TrendingUp,
    Search,
    ChevronRight,
    Loader2,
    X,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FinancialsPage() {
    const [txs, setTxs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        type: 'EXPENSE',
        category: 'Genel',
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTxs();
    }, []);

    const fetchTxs = async () => {
        try {
            const res = await fetch('/api/admin/transactions');
            const data = await res.json();
            setTxs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    merchantId: 'test-merchant'
                })
            });
            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ amount: '', type: 'EXPENSE', category: 'Genel', description: '' });
                fetchTxs();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const totalExpense = txs.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = txs.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="space-y-8 pb-10 transition-colors duration-300">
            {/* Page Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter font-outfit text-foreground">Finansal <span className="text-accent">Yönetim</span></h1>
                    <p className="text-muted mt-2 font-bold flex items-center gap-2 italic">
                        Giderlerinizi ve ek gelirlerinizi bu panelden yönetebilirsiniz.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-card border border-border-color px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-foreground hover:bg-accent hover:text-white hover:border-accent transition-all flex items-center gap-3 shadow-sm shadow-accent-glow"
                >
                    <Plus size={22} className="stroke-[3]" />
                    İşlem Ekle
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard label="Aylık Toplam Gider" value={`₺${totalExpense.toLocaleString()}`} color="text-red-500" icon={<TrendingDown />} />
                <StatCard label="Dış Kaynak Gelirleri" value={`₺${totalIncome.toLocaleString()}`} color="text-emerald-500" icon={<TrendingUp />} />
            </div>

            {/* Ledger Table */}
            <div className="bg-card border border-border-color rounded-[40px] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-border-color flex justify-between items-center bg-foreground/[0.02]">
                    <h2 className="text-xl font-black uppercase tracking-tight text-foreground">İşlem <span className="text-accent">Dökümü</span></h2>
                    <div className="flex gap-4">
                        <FilterButton label="Tümü" active />
                        <FilterButton label="Giderler" />
                        <FilterButton label="Gelirler" />
                    </div>
                </div>

                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 text-accent animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-foreground/[0.01]">
                                <tr className="text-left border-b border-border-color">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Kategori / Açıklama</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Tür</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Tarih</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-muted">Tutar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-color">
                                {txs.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-foreground/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-sm uppercase tracking-tight text-foreground group-hover:text-accent transition-colors">{tx.category}</span>
                                                <span className="text-[10px] text-muted font-bold mt-1 uppercase tracking-widest">{tx.description}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-border-color ${tx.type === 'EXPENSE' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                                                }`}>
                                                {tx.type === 'EXPENSE' ? 'GİDER' : 'GELİR'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-[11px] font-black uppercase text-muted">
                                            {new Date(tx.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className={`text-xl font-black tracking-tighter ${tx.type === 'EXPENSE' ? 'text-foreground' : 'text-emerald-500'
                                                }`}>
                                                {tx.type === 'EXPENSE' ? '-' : '+'}₺{tx.amount.toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {txs.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-20 text-center text-muted font-black uppercase tracking-widest italic opacity-50">Kayıtlı işlem bulunmuyor.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-background/80 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-card border border-border-color w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl"
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">Yeni Finansal <span className="text-accent">İşlem</span></h2>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-xl transition-colors text-foreground"><X size={20} /></button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
                                            className={`flex-1 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${formData.type === 'EXPENSE' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-secondary border-border-color text-muted'
                                                }`}
                                        >GİDER</button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'INCOME' })}
                                            className={`flex-1 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${formData.type === 'INCOME' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-secondary border-border-color text-muted'
                                                }`}
                                        >DIŞ KAYNAK GELİR</button>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2 pl-4">TUTAR (₺)</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full bg-secondary border border-border-color rounded-2xl p-6 text-3xl font-black tracking-tighter text-foreground outline-none focus:border-accent/50 transition-all shadow-inner"
                                            placeholder="0.00"
                                            value={formData.amount}
                                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2 pl-4">KATEGORİ</label>
                                            <select
                                                className="w-full bg-secondary border border-border-color rounded-2xl p-4 text-sm font-bold outline-none text-foreground appearance-none"
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            >
                                                <option value="Genel">Genel</option>
                                                <option value="Kira">Kira</option>
                                                <option value="Elektrik/Su">Elektrik/Su</option>
                                                <option value="Maaş">Maaş</option>
                                                <option value="Malzeme Alımı">Malzeme Alımı</option>
                                                <option value="Diğer">Diğer</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2 pl-4">AÇIKLAMA</label>
                                            <input
                                                type="text"
                                                className="w-full bg-secondary border border-border-color rounded-2xl p-4 text-sm font-bold outline-none text-foreground"
                                                placeholder="Örn: Aralık Ayı Kirası"
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        disabled={submitting}
                                        className="w-full bg-accent text-white p-6 rounded-3xl font-black uppercase tracking-widest shadow-lg shadow-accent-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                                        İşlemi Kaydet
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) {
    return (
        <div className="bg-card border border-border-color rounded-[40px] p-10 flex justify-between items-center group hover:border-accent/30 transition-all shadow-sm">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">{label}</p>
                <h3 className={`text-4xl font-black tracking-tighter font-outfit uppercase ${color}`}>{value}</h3>
            </div>
            <div className={`p-5 bg-secondary rounded-3xl transition-transform group-hover:scale-110 ${color} shadow-sm border border-border-color`}>
                {icon}
            </div>
        </div>
    );
}

function FilterButton({ label, active = false }: { label: string, active?: boolean }) {
    return (
        <button className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active
            ? 'bg-accent text-white shadow-lg shadow-accent-glow'
            : 'bg-secondary text-muted hover:bg-card hover:text-foreground border border-border-color'
            }`}>
            {label}
        </button>
    );
}
