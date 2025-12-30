'use client';

import { useState } from 'react';
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
    Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import ProductModal from '@/components/admin/ProductModal';

// Mock Data
const MOCK_PRODUCTS = [
    { id: '1', name: 'Bosch Professional GSB 18V-50', sku: 'BS-GSB-18V', barcode: '3165140974516', category: 'Elektrikli El Aletleri', brand: 'Bosch', buyPrice: 4250, sellPrice: 5999, stock: 12, unit: 'adet' },
    { id: '2', name: 'Polisan Elegance Yarı Mat İç Cephe Boyası 15L', sku: 'PL-ELG-15', barcode: '8690605010214', category: 'Boyalar', brand: 'Polisan', buyPrice: 1850, sellPrice: 2490, stock: 45, unit: 'adet' },
    { id: '3', name: 'Vitra S50 Asma Klozet', sku: 'VT-S50-K', barcode: '8693405321521', category: 'Sıhhi Tesisat', brand: 'Vitra', buyPrice: 3100, sellPrice: 4850, stock: 8, unit: 'adet' },
    { id: '4', name: 'Öznur NYM Kablo 3x2.5mm 100mt', sku: 'OZ-NYM-325', barcode: '8697424010521', category: 'Elektrik', brand: 'Öznur', buyPrice: 2100, sellPrice: 2850, stock: 15, unit: 'metre' },
    { id: '5', name: 'Kale Kilit 152 R Gömme Kilit', sku: 'KL-152R', barcode: '8691505010521', category: 'Hırdavat', brand: 'Kale', buyPrice: 450, sellPrice: 720, stock: 120, unit: 'adet' },
];

export default function InventoryPage() {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);

    const openAddModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product: any) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter font-outfit">Stok <span className="text-teal-400">Yönetimi</span></h1>
                    <p className="text-gray-500 mt-2 font-bold flex items-center gap-2 italic">
                        <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                        Toplam 1,245 farklı ürün, 4,890 adet stok mevcut.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center gap-3">
                        <History size={20} />
                        Stok Hareketleri
                    </button>
                    <button
                        onClick={openAddModal}
                        className="bg-teal-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
                    >
                        <Plus size={22} className="stroke-[3]" />
                        Yeni Ürün Ekle
                    </button>
                </div>
            </div>

            {/* Stats Quick View */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<Package className="text-blue-400" />} label="Toplam Varlık Değeri" value="₺2,845,000" sub="Alış Fiyatı Bazında" />
                <StatCard icon={<AlertTriangle className="text-orange-400" />} label="Düşük Stok" value="12" sub="Kritik Seviye Altında" />
                <StatCard icon={<ArrowUpDown className="text-teal-400" />} label="Aylık Sirkülasyon" value="85%" sub="Stok Çıkış Hızı" />
            </div>

            {/* Filters & Table */}
            <div className="bg-[#0d0d0f] border border-white/5 rounded-[40px] overflow-hidden">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div className="relative group w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-teal-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Ürün adı, SKU veya Barkod ara..."
                            className="bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-3 w-full outline-none focus:border-teal-500/50 transition-all font-medium"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <FilterButton label="Tümü" active />
                        <FilterButton label="Düşük Stok" />
                        <FilterButton label="Boyalar" />
                        <FilterButton label="El Aletleri" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/[0.01]">
                            <tr className="text-left border-b border-white/5">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Ürün Bilgisi</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Kategori</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Fiyat (Alış/Satış)</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Mevcut Stok</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-gray-500">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {MOCK_PRODUCTS.map((p) => (
                                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-sm uppercase tracking-tight group-hover:text-teal-400 transition-colors">{p.name}</span>
                                            <span className="text-[10px] text-gray-600 font-bold mt-1 uppercase tracking-widest">SKU: {p.sku} • {p.barcode}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="bg-white/5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 border border-white/5">
                                            {p.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 font-mono">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 line-through">₺{p.buyPrice}</span>
                                            <span className="text-lg font-black text-teal-400 tracking-tighter">₺{p.sellPrice}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xl font-black tracking-tighter ${p.stock < 10 ? 'text-orange-400' : 'text-white'}`}>
                                                {p.stock}
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">{p.unit}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                            <button
                                                onClick={() => openEditModal(p)}
                                                className="p-3 hover:bg-white/5 rounded-xl text-blue-400 transition-colors"
                                                title="Düzenle"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button className="p-3 hover:bg-white/5 rounded-xl text-red-500 transition-colors" title="Sil">
                                                <Trash2 size={18} />
                                            </button>
                                            <button className="p-3 hover:bg-white/5 rounded-xl text-gray-500 transition-colors">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
        <div className="p-8 bg-[#0d0d0f] border border-white/5 rounded-[40px] relative overflow-hidden group hover:border-white/10 transition-all">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                {icon}
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">{label}</p>
                <h3 className="text-3xl font-black tracking-tighter uppercase font-outfit">{value}</h3>
                <p className="text-[10px] font-bold text-gray-500 mt-1 italic">{sub}</p>
            </div>
        </div>
    );
}

function FilterButton({ label, active = false }: { label: string, active?: boolean }) {
    return (
        <button className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/10'
                : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white border border-white/5'
            }`}>
            {label}
        </button>
    );
}
