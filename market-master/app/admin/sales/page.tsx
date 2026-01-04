'use client';

import { useState, useEffect } from 'react';
import {
    ShoppingCart,
    Search,
    CreditCard,
    Wallet,
    Users,
    Loader2,
    Receipt
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SalesPage() {
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/sales')
            .then(res => res.json())
            .then(data => {
                setSales(data);
                setLoading(false);
            });
    }, []);

    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'CASH': return <Wallet size={14} className="text-emerald-500" />;
            case 'CARD': return <CreditCard size={14} className="text-blue-500" />;
            case 'CARI': return <Users size={14} className="text-orange-500" />;
            default: return <Receipt size={14} className="text-muted" />;
        }
    };

    const getMethodLabel = (method: string) => {
        switch (method) {
            case 'CASH': return 'NAKİT';
            case 'CARD': return 'KART';
            case 'CARI': return 'VERESİYE';
            default: return method;
        }
    };

    return (
        <div className="space-y-8 pb-10 transition-colors duration-300">
            {/* Page Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter font-outfit text-foreground">Satış <span className="text-accent">Geçmişi</span></h1>
                    <p className="text-muted mt-2 font-bold flex items-center gap-2 italic">
                        Tamamlanan tüm satışların dökümü.
                    </p>
                </div>
            </div>

            {/* List */}
            <div className="bg-card border border-border-color rounded-[40px] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-border-color flex justify-between items-center bg-foreground/[0.02]">
                    <div className="relative group w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-accent transition-colors" />
                        <input
                            type="text"
                            placeholder="Fiş no, müşteri veya tutar ara..."
                            className="bg-secondary border border-border-color rounded-2xl pl-12 pr-6 py-3 w-full outline-none focus:border-accent/50 transition-all font-medium text-foreground shadow-inner"
                        />
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
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Fiş Bilgisi</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Müşteri</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Ödeme</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Tarih</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-muted">Tutar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-color">
                                {sales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-foreground/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-sm uppercase tracking-tight text-foreground group-hover:text-accent transition-colors">#{sale.id.slice(-6)}</span>
                                                <span className="text-[10px] text-muted font-bold mt-1 uppercase tracking-widest">{sale.items.length} Kalem Ürün</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-muted">
                                                {sale.customer?.name || 'PERAKENDE MÜŞTERİ'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                {getMethodIcon(sale.paymentMethod)}
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted">{getMethodLabel(sale.paymentMethod)}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-[11px] font-black uppercase text-muted">
                                            {new Date(sale.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-xl font-black tracking-tighter text-foreground">₺{sale.finalAmount.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                                {sales.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center text-muted font-black uppercase tracking-widest italic opacity-50">Henüz satış kaydı bulunmuyor.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
