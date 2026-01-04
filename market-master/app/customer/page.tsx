'use client';

import { useState, useEffect } from 'react';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    ReceiptText,
    User,
    LogOut,
    ChevronRight,
    Search,
    ShoppingBag,
    Calendar,
    Bell,
    Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function CustomerPortal() {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Mock customer ID for now, usually from session
            const res = await fetch('/api/customer/transactions?customerId=test-customer');
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-accent/10 rounded-3xl flex items-center justify-center animate-bounce">
            <ShoppingBag className="w-8 h-8 text-accent" />
        </div>
        <div className="text-accent font-black animate-pulse uppercase tracking-[0.4em] text-[10px]">Yükleniyor...</div>
    </div>;

    if (!data) return <div className="min-h-screen bg-background flex items-center justify-center text-red-500 font-black uppercase tracking-widest">Veri bulunamadı.</div>;

    const { customer, transactions } = data;

    return (
        <main className="min-h-screen bg-background text-foreground font-inter pb-20 selection:bg-accent/30">
            {/* Header / Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border-color px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-black tracking-tighter uppercase font-outfit">
                        Market<span className="text-secondary-foreground">Master</span> <span className="text-accent text-[10px] ml-1">Portal</span>
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-muted hover:text-foreground relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                    </button>
                    <button className="w-8 h-8 rounded-full bg-secondary border border-border-color flex items-center justify-center">
                        <User className="w-4 h-4 text-muted" />
                    </button>
                </div>
            </nav>

            <div className="max-w-xl mx-auto pt-24 px-6 space-y-8">
                {/* Welcome & Merchant Info */}
                <div className="space-y-1">
                    <h2 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Hoş Geldiniz</h2>
                    <h1 className="text-2xl font-black uppercase tracking-tighter font-outfit">{customer.name}</h1>
                    <p className="text-xs font-bold text-muted flex items-center gap-1">
                        Hesap: <span className="text-foreground">{customer.merchantName}</span>
                    </p>
                </div>

                {/* Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden p-8 rounded-[40px] bg-gradient-to-br from-card to-secondary border border-border-color shadow-2xl"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Wallet className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted">Güncel Bakiyeniz</span>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${customer.balance < 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                {customer.balance < 0 ? 'BORÇLU' : 'ALACAKLI'}
                            </span>
                        </div>
                        <div className="text-5xl font-black tracking-tighter font-outfit flex items-baseline gap-2">
                            <span className={customer.balance < 0 ? 'text-red-500' : 'text-emerald-500'}>
                                ₺{Math.abs(customer.balance).toFixed(2)}
                            </span>
                        </div>
                        <p className="text-[10px] text-muted font-bold uppercase tracking-widest leading-relaxed">
                            Son güncelleme: Bugün 14:30
                        </p>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 bg-card border border-border-color rounded-3xl flex flex-col items-center gap-2 hover:bg-accent/5 transition-all">
                        <div className="w-10 h-10 bg-accent/10 rounded-2xl flex items-center justify-center">
                            <ArrowUpRight className="w-5 h-5 text-accent" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted">Ödeme Yap</span>
                    </button>
                    <button className="p-4 bg-card border border-border-color rounded-3xl flex flex-col items-center gap-2 hover:bg-accent/5 transition-all">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                            <ReceiptText className="w-5 h-5 text-emerald-500" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted">Faturalar</span>
                    </button>
                </div>

                {/* Transaction History */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted">İşlem Geçmişi</h3>
                        <button className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline">Tümünü Gör</button>
                    </div>

                    <div className="space-y-3">
                        {transactions.map((t: any, idx: number) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={t.id}
                                className="p-5 bg-card border border-border-color rounded-[32px] flex items-center justify-between hover:bg-secondary transition-all group shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.type === 'DEBIT' ? 'bg-red-500/5 text-red-500' : 'bg-emerald-500/5 text-emerald-500'}`}>
                                        {t.type === 'DEBIT' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <p className="font-black uppercase text-[10px] tracking-tight text-foreground">{t.description}</p>
                                        <div className="flex items-center gap-2 text-[9px] font-bold text-muted mt-1">
                                            <Calendar className="w-3 h-3" />
                                            {t.date}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-black text-sm tracking-tighter ${t.type === 'DEBIT' ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {t.type === 'DEBIT' ? '-' : '+'} ₺{t.amount.toFixed(2)}
                                    </p>
                                    {t.receiptId && (
                                        <p className="text-[8px] font-black uppercase text-accent mt-1 group-hover:underline cursor-pointer">
                                            #{t.receiptId}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Footer / Support */}
                <div className="pt-10 text-center space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted">
                        İşlemlerde bir sorun mu var? <br />
                        <a href="tel:02120000000" className="text-accent hover:underline">Marketinizi Arayın</a>
                    </p>
                    <button className="flex items-center gap-2 mx-auto text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-500 transition-colors">
                        <LogOut className="w-4 h-4" /> Güvenli Çıkış
                    </button>
                </div>
            </div>

            {/* Bottom Tab Bar (Mobile Only) */}
            <div className="fixed bottom-0 w-full h-16 bg-background/80 backdrop-blur-xl border-t border-border-color flex items-center justify-around px-6 z-50">
                <TabIcon icon={<User />} active />
                <TabIcon icon={<ShoppingBag />} />
                <TabIcon icon={<ReceiptText />} />
                <TabIcon icon={<Settings />} />
            </div>
        </main>
    );
}

function TabIcon({ icon, active = false }: { icon: React.ReactNode, active?: boolean }) {
    return (
        <button className={`p-3 relative ${active ? 'text-accent' : 'text-muted hover:text-foreground'} transition-colors`}>
            {icon}
            {active && <motion.div layoutId="tab" className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full shadow-[0_0_10px_var(--accent-glow)]" />}
        </button>
    );
}
