'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    ArrowUpDown,
    Package,
    AlertTriangle,
    History,
    Edit,
    Trash2,
    Building2,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductModal from '@/components/admin/ProductModal';

export default function InventoryPage() {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [inventory, setInventory] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('all');

    useEffect(() => {
        fetchData();
    }, [selectedBranch]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [invRes, branchRes] = await Promise.all([
                fetch(`/api/admin/inventory?branchId=${selectedBranch === 'all' ? '' : selectedBranch}`),
                fetch('/api/admin/branches')
            ]);
            const [invData, branchData] = await Promise.all([invRes.json(), branchRes.json()]);
            setInventory(invData);
            setBranches(branchData);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product: any) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const filteredInventory = inventory.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
            (p.barcode && p.barcode.includes(search));

        if (filterType === 'low') return matchesSearch && p.isLowStock;
        return matchesSearch;
    });

    const totalValue = inventory.reduce((sum, p) => sum + (p.totalStock * p.buyPrice), 0);
    const lowStockCount = inventory.filter(p => p.isLowStock).length;

    return (
        <div className="space-y-8 pb-10 transition-colors duration-300">
            {/* Page Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter font-outfit text-foreground">Stok <span className="text-accent">Yönetimi</span></h1>
                    <p className="text-muted mt-2 font-bold flex items-center gap-2 italic">
                        <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                        Toplam {inventory.length} farklı ürün, {inventory.reduce((s, p) => s + p.totalStock, 0).toLocaleString()} adet stok mevcut.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="relative group">
                        <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="appearance-none bg-card border border-border-color pl-12 pr-10 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest text-muted outline-none focus:border-accent/50 transition-all cursor-pointer"
                        >
                            <option value="all">TÜM ŞUBELER</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>
                            ))}
                        </select>
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-hover:text-accent transition-colors" />
                    </div>
                    <button
                        onClick={openAddModal}
                        className="bg-accent text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-accent-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
                    >
                        <Plus size={22} className="stroke-[3]" />
                        Yeni Ürün Ekle
                    </button>
                </div>
            </div>

            {/* Stats Quick View */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<Package className="text-blue-500" />} label="Toplam Varlık Değeri" value={`₺${totalValue.toLocaleString()}`} sub="Alış Fiyatı Bazında" />
                <StatCard icon={<AlertTriangle className="text-red-500" />} label="Düşük Stok" value={lowStockCount.toString()} sub="Kritik Seviye Altında" />
                <StatCard icon={<ArrowUpDown className="text-accent" />} label="Aylık Sirkülasyon" value="85%" sub="Stok Çıkış Hızı" />
            </div>

            {/* Filters & Table */}
            <div className="bg-card border border-border-color rounded-[40px] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-border-color flex flex-col md:flex-row justify-between items-center gap-6 bg-foreground/[0.02]">
                    <div className="relative group w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-accent transition-colors" />
                        <input
                            type="text"
                            placeholder="Ürün adı, SKU veya Barkod ara..."
                            className="bg-secondary border border-border-color rounded-2xl pl-12 pr-6 py-3 w-full outline-none focus:border-accent/50 transition-all font-medium text-foreground"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                        <FilterButton label="Tümü" active={filterType === 'all'} onClick={() => setFilterType('all')} />
                        <FilterButton label="Düşük Stok" active={filterType === 'low'} onClick={() => setFilterType('low')} />
                        {/* Categories could be dynamic here */}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted">
                            <Loader2 className="w-10 h-10 animate-spin text-accent" />
                            <p className="font-black uppercase tracking-widest text-[10px]">Stoklar Listeleniyor...</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-foreground/[0.01]">
                                <tr className="text-left border-b border-border-color">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Ürün Bilgisi</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Kategori</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Fiyat (Alış/Satış)</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted">Mevcut Stok</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-muted">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-color">
                                <AnimatePresence mode="popLayout">
                                    {filteredInventory.map((p) => (
                                        <motion.tr
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            key={p.id}
                                            className={`hover:bg-foreground/[0.02] transition-colors group ${p.isLowStock ? 'bg-red-500/[0.02]' : ''}`}
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-sm uppercase tracking-tight text-foreground group-hover:text-accent transition-colors flex items-center gap-2">
                                                        {p.name}
                                                        {p.isLowStock && (
                                                            <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-md">KRİTİK</span>
                                                        )}
                                                    </span>
                                                    <span className="text-[10px] text-muted font-bold mt-1 uppercase tracking-widest">
                                                        {p.sku ? `SKU: ${p.sku} • ` : ''}{p.barcode}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="bg-secondary px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-muted border border-border-color shadow-inner">
                                                    {p.category || 'Belirtilmemiş'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 font-mono">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-muted/50 line-through italic">₺{p.buyPrice}</span>
                                                    <span className="text-lg font-black text-accent tracking-tighter">₺{p.sellPrice}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-xl font-black tracking-tighter ${p.isLowStock ? 'text-red-500 animate-pulse' : 'text-foreground'}`}>
                                                        {p.totalStock}
                                                    </span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted">{p.baseUnit}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                    <button
                                                        onClick={() => openEditModal(p)}
                                                        className="p-3 hover:bg-secondary rounded-xl text-accent transition-colors shadow-sm"
                                                        title="Düzenle"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button className="p-3 hover:bg-red-500/10 rounded-xl text-red-500 transition-colors shadow-sm" title="Sil">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                                {filteredInventory.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted italic">Ürün bulunamadı.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={editingProduct}
            />
        </div>
    );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode, label: string, value: string, sub: string }) {
    return (
        <div className="p-8 bg-card border border-border-color rounded-[40px] relative overflow-hidden group hover:border-accent/30 transition-all shadow-sm">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity text-foreground">
                {icon}
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">{label}</p>
                <h3 className="text-3xl font-black tracking-tighter uppercase font-outfit text-foreground">{value}</h3>
                <p className="text-[10px] font-bold text-muted mt-1 italic">{sub}</p>
            </div>
        </div>
    );
}

function FilterButton({ label, active = false, onClick }: { label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active
                ? 'bg-accent text-white shadow-lg shadow-accent-glow'
                : 'bg-secondary text-muted hover:bg-card hover:text-foreground border border-border-color'
                }`}>
            {label}
        </button>
    );
}
