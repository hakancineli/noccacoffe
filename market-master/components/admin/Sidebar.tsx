'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Box,
    ShoppingCart,
    Users,
    BarChart3,
    Settings,
    LogOut,
    ChevronRight,
    Warehouse
} from 'lucide-react';
import { motion } from 'framer-motion';

const MENU_ITEMS = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/admin' },
    { name: 'Stok Yönetimi', icon: <Box size={20} />, href: '/admin/inventory' },
    { name: 'Satışlar', icon: <ShoppingCart size={20} />, href: '/admin/sales' },
    { name: 'Cari Hesaplar', icon: <Users size={20} />, href: '/admin/cari' },
    { name: 'Raporlar', icon: <BarChart3 size={20} />, href: '/admin/reports' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-72 bg-[#0d0d0f] border-r border-white/5 flex flex-col h-screen sticky top-0">
            <div className="p-8">
                <Link href="/admin" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform">
                        <Warehouse className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-black tracking-tighter uppercase font-outfit">
                        Market<span className="text-teal-400">Master</span>
                    </span>
                </Link>
            </div>

            <nav className="flex-1 px-4 py-4 flex flex-col gap-2">
                <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-2">Menü</p>
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${isActive
                                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                                    : 'text-gray-500 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`${isActive ? 'text-teal-400' : 'group-hover:text-white'}`}>{item.icon}</span>
                                <span className="text-sm font-bold tracking-tight">{item.name}</span>
                            </div>
                            {isActive && (
                                <motion.div layoutId="sidebar-active" className="w-1.5 h-1.5 bg-teal-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5">
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold text-sm">
                    <LogOut size={20} />
                    Çıkış Yap
                </button>
            </div>
        </aside>
    );
}
