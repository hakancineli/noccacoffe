'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Box,
    ShoppingCart,
    Users,
    BarChart3,
    LogOut,
    Warehouse,
    DollarSign,
    Truck,
    ArrowRightLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeSelector from './ThemeSelector';

const MENU_ITEMS = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/admin' },
    { name: 'Stok Yönetimi', icon: <Box size={20} />, href: '/admin/inventory' },
    { name: 'Satışlar', icon: <ShoppingCart size={20} />, href: '/admin/sales' },
    { name: 'Cari Hesaplar', icon: <Users size={20} />, href: '/admin/cari' },
    { name: 'Stok Transferi', icon: <ArrowRightLeft size={20} />, href: '/admin/inventory/transfers' },
    { name: 'Tedarikçiler', icon: <Truck size={20} />, href: '/admin/suppliers' },
    { name: 'Finanslar', icon: <DollarSign size={20} />, href: '/admin/financials' },
    { name: 'Raporlar', icon: <BarChart3 size={20} />, href: '/admin/reports' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-72 bg-card border-r border-border-color flex flex-col h-screen sticky top-0 transition-colors duration-300">
            <div className="p-8">
                <Link href="/admin" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/80 rounded-xl flex items-center justify-center shadow-lg shadow-accent-glow group-hover:scale-110 transition-transform">
                        <Warehouse className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-black tracking-tighter uppercase font-outfit text-foreground">
                        Market<span className="text-accent">Master</span>
                    </span>
                </Link>
            </div>

            <nav className="flex-1 px-4 py-4 flex flex-col gap-2 overflow-y-auto">
                <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-2">Menü</p>
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${isActive
                                ? 'bg-accent/10 text-accent border border-accent/20'
                                : 'text-muted hover:bg-white/5 hover:text-foreground'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`${isActive ? 'text-accent' : 'group-hover:text-foreground'}`}>{item.icon}</span>
                                <span className="text-sm font-bold tracking-tight">{item.name}</span>
                            </div>
                            {isActive && (
                                <motion.div layoutId="sidebar-active" className="w-1.5 h-1.5 bg-accent rounded-full shadow-lg shadow-accent-glow" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border-color flex flex-col gap-3">
                <ThemeSelector />
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-muted hover:bg-red-500/10 hover:text-red-400 transition-all font-bold text-sm">
                    <LogOut size={20} />
                    Çıkış Yap
                </button>
            </div>
        </aside>
    );
}
