'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Search,
    Barcode,
    ShoppingCart,
    CreditCard,
    Wallet,
    User,
    Box,
    LayoutGrid,
    Settings,
    LogOut,
    Plus,
    Minus,
    Trash2,
    ChevronRight,
    CheckCircle2,
    Percent,
    ArrowLeft,
    Sun,
    Moon,
    Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function POSPage() {
    const [cart, setCart] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [barcodeInput, setBarcodeInput] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [checkedOutSale, setCheckedOutSale] = useState<any>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [discount, setDiscount] = useState(0); // Fixed amount discount
    const [isSplitPaymentOpen, setIsSplitPaymentOpen] = useState(false);
    const [splitPayments, setSplitPayments] = useState<{ method: string, amount: number }[]>([]);
    const [currentTheme, setCurrentTheme] = useState('dark');

    const barcodeRef = useRef<HTMLInputElement>(null);

    // Initialize theme
    useEffect(() => {
        const saved = localStorage.getItem('theme') || 'garanti';
        setCurrentTheme(saved);
        document.documentElement.setAttribute('data-theme', saved);
    }, []);

    const toggleTheme = () => {
        const themes = ['garanti', 'dark', 'light', 'slate'];
        const next = themes[(themes.indexOf(currentTheme) + 1) % themes.length];
        setCurrentTheme(next);
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    };

    // Auto-focus barcode input
    useEffect(() => {
        barcodeRef.current?.focus();
    }, []);

    const handleSearch = async (val: string) => {
        setSearch(val);
        if (val.length > 2) {
            const res = await fetch(`/api/pos/search?q=${val}`);
            const data = await res.json();
            setSearchResults(data);
        } else {
            setSearchResults([]);
        }
    };

    const handleBarcodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!barcodeInput) return;

        try {
            const res = await fetch(`/api/pos/search?q=${barcodeInput}`);
            const products = await res.json();
            if (products.length > 0) {
                addToCart(products[0]);
                setBarcodeInput('');
            }
        } catch (error) {
            console.error('Barcode error:', error);
        }
    };

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1, taxRate: product.taxRate || 20 }];
        });
        setSearchResults([]);
        setSearch('');
        barcodeRef.current?.focus();
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const handleCheckout = async (method: string, customPayments?: any[]) => {
        if (cart.length === 0) return;

        // Final payments list
        const payments = customPayments || [{ method, amount: total }];

        // Validation for Cari
        const hasCari = payments.some(p => p.method === 'CARI');
        if (hasCari && !selectedCustomer) {
            alert('Lütfen cari satış için bir müşteri seçin.');
            return;
        }

        setIsCheckoutLoading(true);
        try {
            const res = await fetch('/api/pos/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    branchId: 'test-branch',
                    merchantId: 'test-merchant',
                    customerId: selectedCustomer?.id,
                    items: cart,
                    totalAmount: subtotal,
                    discount: discount,
                    finalAmount: total,
                    paymentMethod: payments.length > 1 ? 'SPLIT' : payments[0].method,
                    payments: payments
                })
            });

            if (res.ok) {
                const sale = await res.json();
                setCheckedOutSale(sale);
                setCart([]);
                setSelectedCustomer(null);
                setDiscount(0);
                setIsSplitPaymentOpen(false);
                setSplitPayments([]);
                setTimeout(() => setCheckedOutSale(null), 3000);
            }
        } catch (error) {
            console.error('Checkout error:', error);
        } finally {
            setIsCheckoutLoading(false);
        }
    };

    // Advanced Calculations
    const subtotal = cart.reduce((sum, item) => sum + (item.sellPrice * item.quantity), 0);
    const totalTax = cart.reduce((sum, item) => {
        const itemSubtotal = item.sellPrice * item.quantity;
        const taxRate = item.taxRate || 20;
        return sum + (itemSubtotal - (itemSubtotal / (1 + taxRate / 100)));
    }, 0);

    const total = Math.max(0, subtotal - discount);

    return (
        <div className="flex h-screen bg-background text-foreground font-inter overflow-hidden transition-colors duration-300">
            {/* Split Payment Modal */}
            <AnimatePresence>
                {isSplitPaymentOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-card border border-border-color w-full max-w-lg rounded-[40px] p-10 shadow-2xl space-y-8"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Parçalı Ödeme</h2>
                                <button onClick={() => setIsSplitPaymentOpen(false)} className="p-2 text-muted hover:text-foreground"><LogOut size={24} /></button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end p-6 bg-secondary rounded-3xl border border-border-color">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted">Ödenmesi Gereken</span>
                                    <span className="text-4xl font-black font-outfit">₺{total.toFixed(2)}</span>
                                </div>

                                <div className="space-y-3">
                                    {splitPayments.map((p, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-4 bg-accent/5 border border-accent/20 rounded-2xl">
                                            <span className="flex-1 font-black text-xs uppercase tracking-widest text-accent">{p.method === 'CASH' ? 'Nakit' : p.method === 'CARD' ? 'Kart' : 'Cari'}</span>
                                            <span className="font-black text-lg">₺{p.amount.toFixed(2)}</span>
                                            <button onClick={() => setSplitPayments(prev => prev.filter((_, i) => i !== idx))} className="p-1 text-red-500 hover:scale-110 transition-transform"><Plus className="rotate-45" size={18} /></button>
                                        </div>
                                    ))}
                                </div>

                                {total - splitPayments.reduce((s, p) => s + p.amount, 0) > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        <button onClick={() => {
                                            const remaining = total - splitPayments.reduce((s, p) => s + p.amount, 0);
                                            setSplitPayments([...splitPayments, { method: 'CASH', amount: remaining }]);
                                        }} className="p-4 bg-secondary border border-border-color rounded-2xl flex flex-col items-center gap-1 hover:border-accent/50 transition-all">
                                            <Wallet size={16} className="text-emerald-500" />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Nakit</span>
                                        </button>
                                        <button onClick={() => {
                                            const remaining = total - splitPayments.reduce((s, p) => s + p.amount, 0);
                                            setSplitPayments([...splitPayments, { method: 'CARD', amount: remaining }]);
                                        }} className="p-4 bg-secondary border border-border-color rounded-2xl flex flex-col items-center gap-1 hover:border-accent/50 transition-all">
                                            <CreditCard size={16} className="text-blue-500" />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Kart</span>
                                        </button>
                                        <button onClick={() => {
                                            const remaining = total - splitPayments.reduce((s, p) => s + p.amount, 0);
                                            setSplitPayments([...splitPayments, { method: 'CARI', amount: remaining }]);
                                        }} className="p-4 bg-secondary border border-border-color rounded-2xl flex flex-col items-center gap-1 hover:border-accent/50 transition-all">
                                            <User size={16} className="text-orange-500" />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Cari</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-border-color">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted">Kalan Bakiye</span>
                                    <span className={`text-xl font-black ${total - splitPayments.reduce((s, p) => s + p.amount, 0) <= 0 ? 'text-emerald-500' : 'text-foreground'}`}>
                                        ₺{Math.max(0, total - splitPayments.reduce((s, p) => s + p.amount, 0)).toFixed(2)}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleCheckout('SPLIT', splitPayments)}
                                    disabled={total - splitPayments.reduce((s, p) => s + p.amount, 0) > 0.01 || splitPayments.length === 0}
                                    className="w-full h-16 bg-accent rounded-3xl font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-accent-glow hover:brightness-110 disabled:opacity-20 transition-all"
                                >
                                    Ödemeyi Tamamla
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sidebar - Small */}
            <aside className="w-20 border-r border-border-color flex flex-col items-center py-8 gap-8 bg-card shadow-xl">
                <Link href="/admin" className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent-glow hover:scale-110 transition-transform">
                    <Box className="w-6 h-6 text-white" />
                </Link>
                <nav className="flex flex-col gap-4 flex-1">
                    <SidebarIcon icon={<LayoutGrid />} active />
                    <SidebarIcon icon={<ShoppingCart />} />
                    <SidebarIcon icon={<User />} />
                    <button
                        onClick={toggleTheme}
                        className="p-4 rounded-2xl text-muted hover:bg-secondary hover:text-accent transition-all relative border border-transparent hover:border-accent/20"
                    >
                        {currentTheme === 'dark' ? <Moon size={24} /> : currentTheme === 'light' ? <Sun size={24} /> : <Palette size={24} />}
                    </button>
                    <SidebarIcon icon={<Settings />} />
                </nav>
                <button className="p-3 text-muted hover:text-red-400 transition-colors">
                    <LogOut className="w-6 h-6" />
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col p-8 overflow-hidden relative">
                {/* Success Overlay */}
                <AnimatePresence>
                    {checkedOutSale && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
                        >
                            <div className="bg-emerald-500 p-12 rounded-[40px] shadow-2xl flex flex-col items-center gap-4 text-white">
                                <CheckCircle2 className="w-20 h-20" />
                                <h2 className="text-3xl font-black uppercase tracking-tighter">Satış Tamamlandı!</h2>
                                <p className="font-bold opacity-80">Fiş No: #{checkedOutSale.id.slice(-6)}</p>
                                <p className="text-5xl font-black mt-4">₺{checkedOutSale.finalAmount.toFixed(2)}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight font-outfit uppercase text-foreground">Market<span className="text-accent">Master</span> POS</h1>
                        <p className="text-muted text-xs mt-1 font-bold flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Terminal #01 • Merkez Şube
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-accent transition-colors" />
                            <input
                                type="text"
                                placeholder="Ürün adı, barkod veya SKU..."
                                className="bg-secondary border border-border-color rounded-2xl pl-12 pr-6 py-3 w-96 outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent-glow transition-all font-bold text-foreground"
                                value={search}
                                onChange={e => handleSearch(e.target.value)}
                            />
                            {/* Search Suggestions */}
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border-color rounded-2xl overflow-hidden shadow-2xl z-50">
                                    {searchResults.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => addToCart(p)}
                                            className="w-full flex items-center justify-between p-5 hover:bg-secondary transition-colors border-b border-border-color last:border-0 text-left"
                                        >
                                            <div>
                                                <p className="font-black uppercase text-sm tracking-tight text-foreground">{p.name}</p>
                                                <p className="text-[10px] text-muted font-bold uppercase tracking-widest leading-none mt-1">Barkod: {p.barcode} | Kategori: {p.category}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-black text-accent text-lg">₺{p.sellPrice}</span>
                                                <p className="text-[9px] text-muted font-black uppercase">Stok: {p.stock} {p.baseUnit}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Fast Action Tiles */}
                <div className="flex-1 grid grid-cols-4 md:grid-cols-6 gap-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-accent-glow">
                    {/* Preset Buttons for Quick Sale */}
                    {[
                        { name: 'Civata', color: 'text-blue-500' },
                        { name: 'Düğme', color: 'text-purple-500' },
                        { name: 'Poşet', color: 'text-teal-500' },
                        { name: 'Koli bandı', color: 'text-orange-500' },
                        { name: 'Vida', color: 'text-red-500' },
                        { name: 'Eldiven', color: 'text-emerald-500' }
                    ].map(item => (
                        <button key={item.name} className="aspect-square bg-card border border-border-color rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-accent/5 hover:border-accent/20 transition-all group shadow-sm">
                            <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                                <Box className={`w-6 h-6 ${item.color}`} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted group-hover:text-foreground">{item.name}</span>
                        </button>
                    ))}
                </div>
            </main>

            {/* Cart Panel */}
            <aside className="w-[480px] bg-card border-l border-border-color flex flex-col p-8 shadow-2xl z-20">
                {/* Customer Selector */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Müşteri / Cari Seçimi</span>
                        {selectedCustomer && (
                            <button
                                onClick={() => setSelectedCustomer(null)}
                                className="text-[10px] font-black uppercase text-red-500 hover:text-red-400 transition-colors"
                            >
                                Seçimi İptal Et
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setSelectedCustomer({ id: 'test-customer', name: 'Ahmet Yılmaz' })}
                        className={`w-full p-4 rounded-2xl border flex items-center gap-3 transition-all ${selectedCustomer
                            ? 'bg-accent/10 border-accent/30 text-accent shadow-inner'
                            : 'bg-secondary border-border-color text-muted hover:bg-card hover:border-accent/20'
                            }`}
                    >
                        <User className="w-5 h-5" />
                        <span className="flex-1 text-left font-black uppercase text-xs tracking-widest">
                            {selectedCustomer ? selectedCustomer.name : 'GENEL MÜŞTERİ (PERAKENDE)'}
                        </span>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>
                </div>

                {/* Barcode Focus Input */}
                <form onSubmit={handleBarcodeSubmit} className="relative mb-8 group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-emerald-500 rounded-2xl blur opacity-10 group-focus-within:opacity-40 transition duration-500"></div>
                    <div className="relative bg-secondary border border-border-color rounded-2xl p-4 flex items-center gap-4 shadow-inner">
                        <Barcode className={`w-8 h-8 ${barcodeInput ? 'text-accent' : 'text-muted/30'} transition-colors ${barcodeInput ? 'animate-pulse' : ''}`} />
                        <input
                            ref={barcodeRef}
                            type="text"
                            placeholder="Barkod okutun..."
                            className="bg-transparent outline-none flex-1 text-2xl font-black placeholder:text-muted/20 text-foreground transition-colors tracking-tighter"
                            value={barcodeInput}
                            onChange={e => setBarcodeInput(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                </form>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-accent-glow">
                    <AnimatePresence mode="popLayout">
                        {cart.map(item => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                key={item.id}
                                className="bg-secondary/50 rounded-[32px] p-5 border border-border-color hover:border-accent/20 transition-all group shadow-sm"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-tight text-foreground group-hover:text-accent transition-colors pr-4">{item.name}</h4>
                                        <p className="text-[10px] text-muted font-bold uppercase mt-1">Birim: {item.sellPrice.toFixed(2)} ₺/{item.baseUnit} | KDV: %{item.taxRate}</p>
                                    </div>
                                    <button onClick={() => updateQuantity(item.id, -item.quantity)} className="text-muted hover:text-red-500 transition-colors p-2">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-3 bg-card rounded-2xl px-3 py-2 border border-border-color shadow-sm">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-muted hover:text-accent transition-colors"><Minus size={14} /></button>
                                        <span className="font-black text-lg min-w-[30px] text-center text-foreground">{item.quantity}</span>
                                        <button onClick={() => addToCart(item)} className="p-1 text-muted hover:text-accent transition-colors"><Plus size={14} /></button>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-black text-2xl text-accent tracking-tighter">₺{(item.sellPrice * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-muted gap-4 py-8 opacity-20">
                            <ShoppingCart className="w-16 h-16" />
                            <p className="text-xs font-black uppercase tracking-[0.2em]">Sepetiniz Boş</p>
                        </div>
                    )}
                </div>

                {/* Summary & Checkout */}
                <div className="mt-8 pt-8 border-t border-border-color space-y-6">
                    <div className="space-y-3">
                        <div className="flex justify-between text-muted font-black uppercase tracking-widest text-[10px]">
                            <span>Ara Toplam</span>
                            <span className="text-foreground">₺{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted font-black uppercase tracking-widest text-[10px]">
                            <span>Toplam KDV (Dahil)</span>
                            <span className="text-foreground">₺{totalTax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-orange-500 font-black uppercase tracking-widest text-[10px]">
                            <span>İskonto / İndirim</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs">-</span>
                                <input
                                    type="number"
                                    className="w-20 bg-orange-500/10 border border-orange-500/20 rounded-lg px-2 py-1 text-right text-orange-500 outline-none focus:border-orange-500 transition-all font-black"
                                    value={discount}
                                    onChange={e => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                                />
                                <span>₺</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-border-color pt-4">
                        <span className="text-xl font-black uppercase tracking-tighter text-foreground leading-none">Genel Toplam</span>
                        <div className="text-right">
                            <span className="text-5xl font-black text-accent tracking-tighter drop-shadow-[0_0_20px_var(--accent-glow)] leading-none">₺{total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <PaymentButton
                            icon={<Wallet />}
                            label="NAKİT"
                            color="bg-emerald-600 shadow-emerald-500/20"
                            onClick={() => handleCheckout('CASH')}
                            disabled={isCheckoutLoading || cart.length === 0}
                        />
                        <PaymentButton
                            icon={<CreditCard />}
                            label="KART"
                            color="bg-blue-600 shadow-blue-500/20"
                            onClick={() => handleCheckout('CARD')}
                            disabled={isCheckoutLoading || cart.length === 0}
                        />
                        <PaymentButton
                            icon={<User />}
                            label="CARİ"
                            color="bg-orange-600 shadow-orange-500/20"
                            onClick={() => handleCheckout('CARI')}
                            disabled={isCheckoutLoading || cart.length === 0}
                        />
                        <PaymentButton
                            icon={<Plus />}
                            label="PARÇALI ÖDEME"
                            color="bg-secondary border border-border-color text-foreground shadow-sm"
                            onClick={() => {
                                setSplitPayments([]);
                                setIsSplitPaymentOpen(true);
                            }}
                            disabled={isCheckoutLoading || cart.length === 0}
                        />
                    </div>
                </div>
            </aside>
        </div>
    );
}

function SidebarIcon({ icon, active = false }: { icon: React.ReactNode, active?: boolean }) {
    return (
        <button className={`p-4 rounded-2xl transition-all relative ${active
            ? 'bg-accent/10 text-accent border border-accent/20'
            : 'text-muted hover:bg-secondary hover:text-foreground'
            }`}>
            {active && <motion.div layoutId="active" className="absolute left-[-2px] top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-full shadow-[0_0_10px_var(--accent-glow)]" />}
            {icon}
        </button>
    );
}

function PaymentButton({ icon, label, color, span, onClick, disabled }: { icon: React.ReactNode, label: string, color: string, span?: boolean, onClick?: () => void, disabled?: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${color} ${span ? 'col-span-2' : ''} p-5 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-lg disabled:opacity-20 disabled:grayscale`}
        >
            {icon}
            {label}
        </button>
    );
}
