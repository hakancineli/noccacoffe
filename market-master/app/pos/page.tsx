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
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function POSPage() {
    const [cart, setCart] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [barcodeInput, setBarcodeInput] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [checkedOutSale, setCheckedOutSale] = useState<any>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    const barcodeRef = useRef<HTMLInputElement>(null);

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
            return [...prev, { ...product, quantity: 1 }];
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

    const handleCheckout = async (method: string) => {
        if (cart.length === 0) return;
        if (method === 'CARI' && !selectedCustomer) {
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
                    discount: 0,
                    finalAmount: total,
                    paymentMethod: method
                })
            });

            if (res.ok) {
                const sale = await res.json();
                setCheckedOutSale(sale);
                setCart([]);
                setSelectedCustomer(null);
                setTimeout(() => setCheckedOutSale(null), 3000);
            }
        } catch (error) {
            console.error('Checkout error:', error);
        } finally {
            setIsCheckoutLoading(false);
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.sellPrice * item.quantity), 0);
    const tax = subtotal * 0.20;
    const total = subtotal + tax;

    return (
        <div className="flex h-screen bg-[#0a0a0c] text-white font-sans overflow-hidden">
            {/* Sidebar - Small */}
            <aside className="w-20 border-r border-white/5 flex flex-col items-center py-8 gap-8 bg-[#0d0d0f]">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                    <Box className="w-6 h-6 text-white" />
                </div>
                <nav className="flex flex-col gap-4 flex-1">
                    <SidebarIcon icon={<LayoutGrid />} active />
                    <SidebarIcon icon={<ShoppingCart />} />
                    <SidebarIcon icon={<User />} />
                    <SidebarIcon icon={<Settings />} />
                </nav>
                <button className="p-3 text-gray-500 hover:text-red-400 transition-colors">
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
                            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        >
                            <div className="bg-emerald-500 p-12 rounded-[40px] shadow-2xl flex flex-col items-center gap-4">
                                <CheckCircle2 className="w-20 h-20 text-white" />
                                <h2 className="text-3xl font-black uppercase tracking-tighter">Satış Tamamlandı!</h2>
                                <p className="font-bold opacity-80">Fiş No: #{checkedOutSale.id.slice(-6)}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-outfit uppercase">Market<span className="text-teal-400">Master</span> POS</h1>
                        <p className="text-gray-500 text-sm mt-1 font-bold">Terminal #01 • Merkez Şube</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-teal-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Ürün adı, barkod veya SKU..."
                                className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 w-96 outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all font-bold"
                                value={search}
                                onChange={e => handleSearch(e.target.value)}
                            />
                            {/* Search Suggestions */}
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
                                    {searchResults.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => addToCart(p)}
                                            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left"
                                        >
                                            <div>
                                                <p className="font-black uppercase text-sm tracking-tight">{p.name}</p>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">SKU: {p.sku} | STOK: {p.stock}</p>
                                            </div>
                                            <span className="font-black text-teal-400">₺{p.sellPrice}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Fast Action Tiles */}
                <div className="flex-1 grid grid-cols-4 md:grid-cols-6 gap-4 overflow-y-auto pr-2 scrollbar-hide">
                    {/* Preset Buttons for Quick Sale */}
                    {['Civata', 'Düğme', 'Poşet', 'Koli bandı', 'Vida', 'Eldiven'].map(item => (
                        <button key={item} className="aspect-square bg-white/5 border border-white/5 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-teal-500/10 hover:border-teal-500/20 transition-all group">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Box className="w-6 h-6 text-gray-400 group-hover:text-teal-400" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white">{item}</span>
                        </button>
                    ))}
                </div>
            </main>

            {/* Cart Panel */}
            <aside className="w-[480px] bg-[#0d0d0f] border-l border-white/5 flex flex-col p-8 glass-effect">
                {/* Customer Selector */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Müşteri / Cari</span>
                        {selectedCustomer && (
                            <button
                                onClick={() => setSelectedCustomer(null)}
                                className="text-[10px] font-black uppercase text-red-400 hover:text-red-300 transition-colors"
                            >
                                Kaldır
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setSelectedCustomer({ id: 'test-customer', name: 'Ahmet Yılmaz' })}
                        className={`w-full p-4 rounded-2xl border flex items-center gap-3 transition-all ${selectedCustomer
                                ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                                : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
                            }`}
                    >
                        <User className="w-5 h-5" />
                        <span className="flex-1 text-left font-bold uppercase text-sm">
                            {selectedCustomer ? selectedCustomer.name : 'Müşteri Seçilmedi'}
                        </span>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>
                </div>

                {/* Barcode Focus Input */}
                <form onSubmit={handleBarcodeSubmit} className="relative mb-8 group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
                    <div className="relative bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                        <Barcode className={`w-8 h-8 ${barcodeInput ? 'text-teal-400' : 'text-gray-600'} transition-colors animate-pulse`} />
                        <input
                            ref={barcodeRef}
                            type="text"
                            placeholder="Barkod okutun..."
                            className="bg-transparent outline-none flex-1 text-2xl font-mono placeholder:text-gray-800 focus:placeholder:text-teal-500/20 transition-colors tracking-tighter"
                            value={barcodeInput}
                            onChange={e => setBarcodeInput(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                </form>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                    <AnimatePresence mode="popLayout">
                        {cart.map(item => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                key={item.id}
                                className="bg-white/5 rounded-[32px] p-5 border border-white/5 hover:bg-white/10 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-tight group-hover:text-teal-400 transition-colors pr-4">{item.name}</h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Barkod: {item.barcode}</p>
                                    </div>
                                    <button onClick={() => updateQuantity(item.id, -item.quantity)} className="text-gray-700 hover:text-red-400 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-3 bg-black/50 rounded-2xl px-3 py-1.5 border border-white/5">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-teal-400 transition-colors"><Minus size={14} /></button>
                                        <span className="font-black text-lg min-w-[30px] text-center">{item.quantity}</span>
                                        <button onClick={() => addToCart(item)} className="p-1 hover:text-teal-400 transition-colors"><Plus size={14} /></button>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-600 font-black uppercase mb-0.5">₺{item.sellPrice.toFixed(2)} / {item.baseUnit}</p>
                                        <span className="font-black text-xl text-teal-400 tracking-tighter">₺{(item.sellPrice * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-800 gap-4 py-8">
                            <div className="w-20 h-20 bg-white/5 rounded-[40px] flex items-center justify-center">
                                <ShoppingCart className="w-10 h-10 opacity-20" />
                            </div>
                            <p className="text-sm font-black uppercase tracking-[0.2em] opacity-30">Sepetiniz Boş</p>
                        </div>
                    )}
                </div>

                {/* Summary & Checkout */}
                <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-gray-500 font-black uppercase tracking-widest text-[10px]">
                            <span>Ara Toplam</span>
                            <span>₺{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 font-black uppercase tracking-widest text-[10px]">
                            <span>KDV (20%)</span>
                            <span>₺{tax.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-end">
                        <span className="text-xl font-black uppercase tracking-tighter">Toplam</span>
                        <div className="text-right">
                            <span className="text-5xl font-black text-teal-400 tracking-tighter drop-shadow-[0_0_20px_rgba(20,184,166,0.2)]">₺{total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <PaymentButton
                            icon={<Wallet />}
                            label="NAKİT"
                            color="bg-emerald-600"
                            onClick={() => handleCheckout('CASH')}
                            disabled={isCheckoutLoading || cart.length === 0}
                        />
                        <PaymentButton
                            icon={<CreditCard />}
                            label="KART"
                            color="bg-blue-600"
                            onClick={() => handleCheckout('CARD')}
                            disabled={isCheckoutLoading || cart.length === 0}
                        />
                        <PaymentButton
                            icon={<User />}
                            label="CARİ (VERESİYE) SATIŞ"
                            color="bg-orange-600"
                            span
                            onClick={() => handleCheckout('CARI')}
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
                ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                : 'text-gray-500 hover:bg-white/5 hover:text-white'
            }`}>
            {active && <motion.div layoutId="active" className="absolute left-[-2px] top-1/2 -translate-y-1/2 w-1 h-6 bg-teal-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]" />}
            {icon}
        </button>
    );
}

function PaymentButton({ icon, label, color, span, onClick, disabled }: { icon: React.ReactNode, label: string, color: string, span?: boolean, onClick?: () => void, disabled?: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${color} ${span ? 'col-span-2' : ''} p-5 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-black/20 disabled:opacity-20 disabled:grayscale`}
        >
            {icon}
            {label}
        </button>
    );
}
