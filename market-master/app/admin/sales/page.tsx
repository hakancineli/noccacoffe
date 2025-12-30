'use client';

import { useState, useEffect } from 'react';
import {
    ShoppingCart,
    Search,
    Filter,
    ChevronRight,
    Calendar,
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
            case 'CASH': return <Wallet size={14} className="text-emerald-400" />;
            case 'CARD': return <CreditCard size={14} className="text-blue-400" />;
            case 'CARI': return <Users size={14} className="text-orange-400" />;
            default: return <Receipt size={14} />;
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
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter font-outfit">Satış <span className="text-teal-400">Geçmişi</span></h1>
                    <p className="text-gray-500 mt-2 font-bold flex items-center gap-2 italic">
                        Tamamlanan tüm satışların dökümü.
                    </p>
                </div>
            </div>

            {/* List */}
            <div className="bg-[#0d0d0f] border border-white/5 rounded-[40px] overflow-hidden">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div className="relative group w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-teal-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Fiş no, müşteri veya tutar ara..."
                            className="bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-3 w-full outline-none focus:border-teal-500/50 transition-all font-medium"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/[0.01]">
                                <tr className="text-left border-b border-white/5">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Fiş Bilgisi</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Müşteri</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Ödeme</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Tarih</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-gray-500">Tutar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-sm uppercase tracking-tight text-white group-hover:text-teal-400 transition-colors">#{sale.id.slice(-6)}</span>
                                                <span className="text-[10px] text-gray-600 font-bold mt-1 uppercase tracking-widest">{sale.items.length} Kalem Ürün</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                                                {sale.customer?.name || 'PERAKENDE MÜŞTERİ'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                {getMethodIcon(sale.paymentMethod)}
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{getMethodLabel(sale.paymentMethod)}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-[11px] font-black uppercase text-gray-600">
                                            {new Date(sale.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-xl font-black tracking-tighter text-white">₺{sale.finalAmount.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
