'use client';

import { useState } from 'react';
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
    ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data
const PRODUCTS = [
    { id: '1', name: 'Bosch Drill 18V', price: 149.99, category: 'Tools', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=200', stocks: { Central: 45, East: 12, West: 28 } },
    { id: '2', name: 'AkzoNobel White Paint 2.5L', price: 79.98, category: 'Paints', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=200', stocks: { Central: 12, East: 5, West: 13 } },
    { id: '3', name: 'Steel Nails 500g Box', price: 8.99, category: 'Nails', image: 'https://images.unsplash.com/photo-1590236338093-4217117071c8?auto=format&fit=crop&q=80&w=200', stocks: { Central: 45, East: 12, West: 28 } },
    { id: '4', name: 'Electrical Wire 100m', price: 15.99, category: 'Electrical', image: 'https://images.unsplash.com/photo-1558485940-84efa9526199?auto=format&fit=crop&q=80&w=200', stocks: { Central: 45, East: 12, West: 28 } },
    { id: '5', name: 'PVC Pipe 3m', price: 12.99, category: 'Plumbing', image: 'https://images.unsplash.com/photo-1585314062340-f1a5acc7bb7c?auto=format&fit=crop&q=80&w=200', stocks: { Central: 45, East: 12, West: 28 } },
    { id: '6', name: 'Garden Shovel', price: 29.99, category: 'Garden', image: 'https://images.unsplash.com/photo-1592928302636-c83cf1e1c887?auto=format&fit=crop&q=80&w=200', stocks: { Central: 45, East: 12, West: 28 } },
];

const CATEGORIES = ['All', 'Nails', 'Paints', 'Tools', 'Lumber', 'Electrical', 'Plumbing', 'Garden'];

export default function POSPage() {
    const [cart, setCart] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
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

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.20;
    const total = subtotal + tax;

    return (
        <div className="flex h-screen bg-[#0a0a0c] text-white font-sans overflow-hidden">
            {/* Sidebar */}
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
            <main className="flex-1 flex flex-col p-8 overflow-hidden">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-outfit">MarketMaster</h1>
                        <p className="text-gray-500 text-sm mt-1">Terminal #01 • Merchant: YapıMarket Pro</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-teal-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search products or SKU..."
                                className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 w-80 outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                {/* Categories */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeCategory === cat
                                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {PRODUCTS.filter(p => (activeCategory === 'All' || p.category === activeCategory) && p.name.toLowerCase().includes(search.toLowerCase())).map(product => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="bg-white/5 border border-white/5 rounded-3xl p-5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute top-4 right-4 bg-teal-500 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/5 border border-white/5">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg leading-tight group-hover:text-teal-400 transition-colors uppercase tracking-tight">{product.name}</h3>
                                        <p className="text-gray-500 text-sm mt-1">{product.category}</p>
                                        <div className="mt-3 flex items-baseline gap-2">
                                            <span className="text-2xl font-black text-teal-400">₺{product.price}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-2">
                                    {Object.entries(product.stocks).map(([loc, qty]) => (
                                        <div key={loc} className="bg-white/5 rounded-lg p-2 text-center">
                                            <p className="text-[10px] text-gray-500 uppercase font-black">{loc}</p>
                                            <p className="text-sm font-bold mt-0.5">{qty}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Cart Panel */}
            <aside className="w-[420px] bg-[#0d0d0f] border-l border-white/5 flex flex-col p-8 glass-effect">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-teal-500/10 p-2.5 rounded-xl">
                            <ShoppingCart className="w-6 h-6 text-teal-400" />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Sepet</h2>
                    </div>
                    <span className="bg-white/5 text-gray-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">{cart.length} Ürün</span>
                </div>

                {/* Barcode Input */}
                <div className="relative mb-8 group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
                    <div className="relative bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                        <Barcode className="w-8 h-8 text-teal-400" />
                        <input
                            type="text"
                            placeholder="Scan Barcode or Enter SKU..."
                            className="bg-transparent outline-none flex-1 text-lg font-mono placeholder:text-gray-600 focus:placeholder:text-teal-500/50 transition-colors"
                        />
                        <div className="bg-white/5 p-2 rounded-lg">
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                        </div>
                    </div>
                </div>

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
                                className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-all group"
                            >
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-sm leading-tight uppercase tracking-tight pr-4">{item.name}</h4>
                                            <button onClick={() => updateQuantity(item.id, -item.quantity)} className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center mt-3">
                                            <div className="flex items-center gap-3 bg-black/40 rounded-xl px-2 py-1">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-teal-400 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                                                <span className="font-bold text-sm min-w-[20px] text-center">{item.quantity}</span>
                                                <button onClick={() => addToCart(item)} className="p-1 hover:text-teal-400 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                                            </div>
                                            <span className="font-black text-teal-400">₺{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-4 py-8">
                            <ShoppingCart className="w-12 h-12 opacity-20" />
                            <p className="text-sm font-bold uppercase tracking-widest opacity-40">Sepetiniz Boş</p>
                        </div>
                    )}
                </div>

                {/* Summary */}
                <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                    <div className="flex justify-between text-gray-500 font-bold uppercase tracking-tighter text-sm">
                        <span>Ara Toplam</span>
                        <span>₺{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 font-bold uppercase tracking-tighter text-sm">
                        <span>KDV (20%)</span>
                        <span>₺{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                        <span className="text-lg font-black uppercase tracking-tighter">Toplam</span>
                        <span className="text-4xl font-black text-teal-400 tracking-tighter">₺{total.toFixed(2)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-8">
                        <PaymentButton icon={<Wallet />} label="NAKİT" color="bg-emerald-600" />
                        <PaymentButton icon={<CreditCard />} label="KART" color="bg-blue-600" />
                        <PaymentButton icon={<User />} label="CARİ (VERESİYE)" color="bg-orange-600" span />
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

function PaymentButton({ icon, label, color, span }: { icon: React.ReactNode, label: string, color: string, span?: boolean }) {
    return (
        <button className={`${color} ${span ? 'col-span-2' : ''} p-4 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-black/20`}>
            {icon}
            {label}
        </button>
    );
}
