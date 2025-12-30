'use client';

import { useState, useEffect } from 'react';
import {
    X,
    Save,
    Barcode,
    Layers,
    Truck,
    DollarSign,
    Plus,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any | null;
}

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        barcode: '',
        category: '',
        brand: '',
        buyPrice: 0,
        sellPrice: 0,
        taxRate: 20,
        minStock: 0,
        baseUnit: 'adet',
        units: [] as { unit: string, factor: number }[]
    });

    useEffect(() => {
        if (product) {
            setFormData(product);
        } else {
            setFormData({
                name: '',
                sku: '',
                barcode: '',
                category: '',
                brand: '',
                buyPrice: 0,
                sellPrice: 0,
                taxRate: 20,
                minStock: 0,
                baseUnit: 'adet',
                units: []
            });
        }
    }, [product]);

    const addUnitConversion = () => {
        setFormData(prev => ({
            ...prev,
            units: [...prev.units, { unit: '', factor: 1 }]
        }));
    };

    const removeUnitConversion = (index: number) => {
        setFormData(prev => ({
            ...prev,
            units: prev.units.filter((_, i) => i !== index)
        }));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-4xl bg-[#0d0d0f] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center">
                                <Plus className="text-teal-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter font-outfit">
                                    {product ? 'Ürünü Düzenle' : 'Yeni Ürün Kaydı'}
                                </h2>
                                <p className="text-xs text-gray-500 font-bold tracking-widest uppercase mt-1">Stok & Envanter Girişi</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-4 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-thin scrollbar-thumb-white/10">
                        {/* Basic Info */}
                        <section className="space-y-6">
                            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-teal-400">
                                <Layers size={14} /> Temel Bilgiler
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <FormLabel>Ürün Adı</FormLabel>
                                    <input
                                        className="form-input"
                                        placeholder="Örn: Bosch Professional Matkap"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <FormLabel>Kategori</FormLabel>
                                    <select className="form-input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                        <option value="">Seçiniz...</option>
                                        <option value="tools">El Aletleri</option>
                                        <option value="paint">Boyalar</option>
                                    </select>
                                </div>
                                <div>
                                    <FormLabel>Marka</FormLabel>
                                    <input className="form-input" placeholder="Örn: Bosch" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
                                </div>
                            </div>
                        </section>

                        {/* Inventory & Pricing */}
                        <section className="space-y-6">
                            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
                                <Barcode size={14} /> Stok & Fiyatlandırma
                            </h3>
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <FormLabel>Barkod</FormLabel>
                                    <div className="relative">
                                        <input className="form-input pr-12" placeholder="869..." value={formData.barcode} onChange={e => setFormData({ ...formData, barcode: e.target.value })} />
                                        <Barcode className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <FormLabel>SKU / İç Kod</FormLabel>
                                    <input className="form-input" placeholder="BS-18V-M" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                                </div>
                                <div>
                                    <FormLabel>Min. Stok Uyarısı</FormLabel>
                                    <input type="number" className="form-input" value={formData.minStock} onChange={e => setFormData({ ...formData, minStock: parseFloat(e.target.value) })} />
                                </div>
                                <div className="bg-white/[0.03] p-6 rounded-3xl border border-white/5 space-y-2">
                                    <FormLabel>Alış Fiyatı (KDV Hariç)</FormLabel>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₺</span>
                                        <input type="number" className="form-input pl-10 border-transparent bg-transparent" value={formData.buyPrice} onChange={e => setFormData({ ...formData, buyPrice: parseFloat(e.target.value) })} />
                                    </div>
                                </div>
                                <div className="bg-teal-500/5 p-6 rounded-3xl border border-teal-500/10 space-y-2">
                                    <FormLabel color="text-teal-400">Satış Fiyatı (KDV Dahil)</FormLabel>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-500 font-bold">₺</span>
                                        <input type="number" className="form-input pl-10 border-transparent bg-transparent text-teal-400 text-lg font-black" value={formData.sellPrice} onChange={e => setFormData({ ...formData, sellPrice: parseFloat(e.target.value) })} />
                                    </div>
                                </div>
                                <div className="bg-white/[0.03] p-6 rounded-3xl border border-white/5 space-y-2">
                                    <FormLabel>KDV Oranı (%)</FormLabel>
                                    <input type="number" className="form-input border-transparent bg-transparent" value={formData.taxRate} onChange={e => setFormData({ ...formData, taxRate: parseFloat(e.target.value) })} />
                                </div>
                            </div>
                        </section>

                        {/* Units & Conversion */}
                        <section className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-orange-400">
                                    <Truck size={14} /> Birim Dönüşümleri
                                </h3>
                                <button
                                    onClick={addUnitConversion}
                                    className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                                >
                                    + Yeni Birim Ekle
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                    <span className="text-xs font-bold text-gray-500 w-24">Temel Birim:</span>
                                    <select
                                        className="bg-transparent text-white font-black uppercase tracking-widest text-xs outline-none"
                                        value={formData.baseUnit}
                                        onChange={e => setFormData({ ...formData, baseUnit: e.target.value })}
                                    >
                                        <option value="adet">Adet</option>
                                        <option value="paket">Paket</option>
                                        <option value="koli">Koli</option>
                                        <option value="mt">Metre</option>
                                        <option value="kg">Kg</option>
                                    </select>
                                </div>

                                {formData.units.map((unit, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={idx}
                                        className="flex items-center gap-6 bg-white/[0.03] p-5 rounded-2xl border border-white/5"
                                    >
                                        <div className="flex-1">
                                            <FormLabel>Birim Adı</FormLabel>
                                            <input
                                                className="bg-transparent w-full text-white font-black uppercase mt-1 outline-none"
                                                placeholder="Örn: Koli"
                                                value={unit.unit}
                                                onChange={e => {
                                                    const newUnits = [...formData.units];
                                                    newUnits[idx].unit = e.target.value;
                                                    setFormData({ ...formData, units: newUnits });
                                                }}
                                            />
                                        </div>
                                        <div className="w-40">
                                            <FormLabel>Katsayı (x {formData.baseUnit})</FormLabel>
                                            <input
                                                type="number"
                                                className="bg-transparent w-full text-teal-400 font-black mt-1 outline-none"
                                                value={unit.factor}
                                                onChange={e => {
                                                    const newUnits = [...formData.units];
                                                    newUnits[idx].factor = parseFloat(e.target.value);
                                                    setFormData({ ...formData, units: newUnits });
                                                }}
                                            />
                                        </div>
                                        <button onClick={() => removeUnitConversion(idx)} className="p-3 text-gray-600 hover:text-red-500 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </motion.div>
                                ))}

                                <p className="text-[10px] text-gray-600 italic">
                                    * Örn: Temel birim "Adet" ise ve "Koli" ekliyorsanız, katsayıya koli içindeki adet miktarını (24 gibi) girin.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Footer */}
                    <div className="p-8 border-t border-white/5 bg-[#0a0a0c] flex justify-end gap-4">
                        <button
                            onClick={onClose}
                            className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                        >
                            İptal
                        </button>
                        <button className="bg-teal-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3">
                            <Save size={20} className="stroke-[3]" />
                            Ürünü Kaydet
                        </button>
                    </div>
                </motion.div>

                <style jsx>{`
          .form-input {
            width: 100%;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 12px 16px;
            color: white;
            font-weight: 700;
            font-size: 0.875rem;
            outline: none;
            transition: all 0.2s;
          }
          .form-input:focus {
            border-color: rgba(20, 184, 166, 0.5);
            box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.05);
          }
        `}</style>
            </div>
        </AnimatePresence>
    );
}

function FormLabel({ children, color = 'text-gray-500' }: { children: React.ReactNode, color?: string }) {
    return (
        <label className={`block text-[10px] font-black uppercase tracking-widest ${color} mb-2`}>
            {children}
        </label>
    );
}
