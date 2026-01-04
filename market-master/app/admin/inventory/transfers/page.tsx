'use client';

import { useState, useEffect } from 'react';
import {
    ArrowRightLeft,
    Plus,
    Calendar,
    Building2,
    Package,
    ChevronRight,
    Loader2,
    CheckCircle2,
    AlertCircle,
    X,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StockTransfersPage() {
    const [transfers, setTransfers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [branches, setBranches] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [fromBranch, setFromBranch] = useState('');
    const [toBranch, setToBranch] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTransfers();
        fetchMeta();
    }, []);

    const fetchTransfers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/inventory/transfers');
            const data = await res.json();
            setTransfers(data);
        } catch (error) {
            console.error('Fetch transfers failed', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMeta = async () => {
        try {
            const [bRes, iRes] = await Promise.all([
                fetch('/api/admin/branches'),
                fetch('/api/admin/inventory')
            ]);
            const [bData, iData] = await Promise.all([bRes.json(), iRes.json()]);
            setBranches(bData);
            setInventory(iData);
        } catch (error) {
            console.error('Fetch meta failed', error);
        }
    };

    const addProductToTransfer = (productId: string) => {
        const product = inventory.find(p => p.id === productId);
        if (product && !selectedProducts.find(p => p.productId === productId)) {
            setSelectedProducts([...selectedProducts, {
                productId,
                name: product.name,
                quantity: 1,
                unit: product.baseUnit
            }]);
        }
    };

    const updateProductQty = (idx: number, qty: number) => {
        const newProducts = [...selectedProducts];
        newProducts[idx].quantity = qty;
        setSelectedProducts(newProducts);
    };

    const handleTransfer = async () => {
        if (!fromBranch || !toBranch || selectedProducts.length === 0) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/inventory/transfers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fromBranchId: fromBranch,
                    toBranchId: toBranch,
                    description,
                    items: selectedProducts
                })
            });
            if (res.ok) {
                setIsModalOpen(false);
                fetchTransfers();
                // Reset form
                setFromBranch('');
                setToBranch('');
                setSelectedProducts([]);
                setDescription('');
            } else {
                const err = await res.json();
                alert(err.error || 'Transfer başarısız');
            }
        } catch (error) {
            console.error('Transfer error', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter font-outfit text-foreground">Stok <span className="text-accent">Transferi</span></h1>
                    <p className="text-muted mt-2 font-bold flex items-center gap-2 italic">
                        Şubeler arası güvenli ürün sevkiyatı ve takibi.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-accent text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-accent-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
                >
                    <Plus size={22} className="stroke-[3]" />
                    Yeni Transfer oluştur
                </button>
            </div>

            {/* Transfer List */}
            <div className="bg-card border border-border-color rounded-[40px] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-border-color bg-foreground/[0.02] flex justify-between items-center">
                    <h2 className="text-xl font-black uppercase tracking-tighter">Transfer Geçmişi</h2>
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest">
                        <Calendar size={14} className="text-accent" /> Son 30 Günlük Hareketler
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-accent" />
                            <p className="font-black uppercase tracking-widest text-[10px]">Transferler Yükleniyor...</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-foreground/[0.01]">
                                <tr className="text-left border-b border-border-color">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">ID & Tarih</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Rota (Şubeler)</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">İçerik</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Durum</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-muted">Aksiyon</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-color">
                                {transfers.map((t) => (
                                    <tr key={t.id} className="hover:bg-foreground/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-xs uppercase tracking-tight text-foreground">#{t.id.slice(-6)}</span>
                                                <span className="text-[10px] text-muted font-bold mt-1">{new Date(t.createdAt).toLocaleDateString('tr-TR')}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="px-3 py-1 bg-secondary rounded-lg text-[10px] font-black uppercase border border-border-color">{t.fromBranch.name}</div>
                                                <ArrowRight size={14} className="text-accent" />
                                                <div className="px-3 py-1 bg-accent/10 text-accent rounded-lg text-[10px] font-black uppercase border border-accent/20">{t.toBranch.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-bold text-foreground">{t.items.length} Kalem Ürün</p>
                                            <p className="text-[9px] text-muted uppercase tracking-widest font-black mt-1">
                                                {t.items.slice(0, 2).map((i: any) => i.product.name).join(', ')} {t.items.length > 2 ? '...' : ''}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 size={14} className="text-emerald-500" />
                                                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Tamamlandı</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-3 hover:bg-secondary rounded-xl text-muted hover:text-accent transition-all">
                                                <ChevronRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {transfers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <p className="text-[10px] font-black uppercase text-muted italic">Henüz bir transfer kaydı bulunmuyor.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* New Transfer Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-card border border-border-color rounded-[40px] shadow-2xl p-10 space-y-8"
                        >
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">Yeni <span className="text-accent">Transfer</span></h2>
                                    <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Şubeler Arası Hareket Tanımla</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-secondary rounded-full text-muted"><X size={24} /></button>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted tracking-widest">Kaynak Şube</label>
                                    <div className="relative group">
                                        <select
                                            value={fromBranch}
                                            onChange={(e) => setFromBranch(e.target.value)}
                                            className="w-full appearance-none bg-secondary border border-border-color rounded-2xl px-12 py-4 font-bold text-sm outline-none focus:border-accent transition-all cursor-pointer"
                                        >
                                            <option value="">Seçiniz...</option>
                                            {branches.map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-hover:text-accent" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted tracking-widest">Hedef Şube</label>
                                    <div className="relative group">
                                        <select
                                            value={toBranch}
                                            onChange={(e) => setToBranch(e.target.value)}
                                            className="w-full appearance-none bg-accent/5 border border-accent/20 rounded-2xl px-12 py-4 font-bold text-sm outline-none focus:border-accent transition-all cursor-pointer"
                                        >
                                            <option value="">Seçiniz...</option>
                                            {branches.map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                        <ArrowRightLeft className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-muted tracking-widest">Ürün Ekle</label>
                                <div className="relative group">
                                    <select
                                        onChange={(e) => addProductToTransfer(e.target.value)}
                                        className="w-full appearance-none bg-secondary border border-border-color rounded-2xl px-12 py-4 font-bold text-sm outline-none focus:border-accent transition-all cursor-pointer"
                                    >
                                        <option value="">Ürün Ara / Seç...</option>
                                        {inventory.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} (Mevcut: {p.totalStock})</option>
                                        ))}
                                    </select>
                                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-hover:text-accent" />
                                </div>

                                <div className="max-h-[200px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-accent/20">
                                    {selectedProducts.map((p, i) => (
                                        <div key={p.productId} className="flex items-center justify-between p-4 bg-secondary rounded-2xl border border-border-color">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-black uppercase tracking-tight">{p.name}</p>
                                                <p className="text-[9px] font-bold text-muted uppercase">{p.unit}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="number"
                                                    value={p.quantity}
                                                    onChange={(e) => updateProductQty(i, parseFloat(e.target.value))}
                                                    className="w-20 bg-card border border-border-color rounded-xl px-3 py-2 text-center font-black text-accent text-xs outline-none focus:border-accent"
                                                />
                                                <button
                                                    onClick={() => setSelectedProducts(selectedProducts.filter((_, idx) => idx !== i))}
                                                    className="p-2 text-muted hover:text-red-500 transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {selectedProducts.length === 0 && (
                                        <div className="py-4 text-center text-[10px] font-black text-muted italic uppercase">Henüz ürün eklenmedi.</div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted tracking-widest">Not / Açıklama</label>
                                <textarea
                                    className="w-full bg-secondary border border-border-color rounded-2xl p-4 text-sm font-medium outline-none focus:border-accent transition-all min-h-[80px]"
                                    placeholder="Opsiyonel not..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleTransfer}
                                disabled={submitting || !fromBranch || !toBranch || selectedProducts.length === 0}
                                className="w-full py-5 bg-accent text-white rounded-[24px] font-black uppercase tracking-[0.2em] shadow-lg shadow-accent-glow hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-3"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
                                {submitting ? 'İŞLENİYOR...' : 'TRANSFERİ TAMAMLA'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
