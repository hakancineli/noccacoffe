'use client';

import { useState, useEffect } from 'react';
import {
    Truck,
    Plus,
    Search,
    Phone,
    Mail,
    MapPin,
    Building2,
    History,
    ChevronRight,
    ArrowUpRight,
    ArrowDownLeft,
    Wallet,
    MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        contactName: '',
        phone: '',
        email: '',
        address: '',
        taxOffice: '',
        taxNumber: ''
    });

    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [activeSupplier, setActiveSupplier] = useState<any>(null);
    const [transactionType, setTransactionType] = useState<'PURCHASE' | 'PAYMENT'>('PURCHASE');
    const [transactionData, setTransactionData] = useState({
        amount: '',
        description: '',
        products: [] as any[]
    });
    const [inventory, setInventory] = useState<any[]>([]);

    useEffect(() => {
        fetchSuppliers();
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const res = await fetch('/api/admin/inventory');
            const data = await res.json();
            setInventory(data);
        } catch (error) {
            console.error('Inventory fetch error:', error);
        }
    };

    const fetchSuppliers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/suppliers');
            const data = await res.json();
            setSuppliers(data);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/suppliers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsModalOpen(false);
                setFormData({
                    name: '', contactName: '', phone: '', email: '',
                    address: '', taxOffice: '', taxNumber: ''
                });
                fetchSuppliers();
            }
        } catch (error) {
            console.error('Submit error:', error);
        }
    };

    const handleTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/suppliers/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    supplierId: activeSupplier.id,
                    amount: parseFloat(transactionData.amount),
                    type: transactionType,
                    description: transactionData.description,
                    products: transactionData.products
                })
            });
            if (res.ok) {
                setIsTransactionModalOpen(false);
                setTransactionData({ amount: '', description: '', products: [] });
                fetchSuppliers();
            }
        } catch (error) {
            console.error('Transaction error:', error);
        }
    };

    const addProductToPurchase = (productId: string) => {
        const product = inventory.find(p => p.id === productId);
        if (!product) return;
        setTransactionData(prev => ({
            ...prev,
            products: [...prev.products, { id: product.id, name: product.name, quantity: 1, price: product.buyPrice || 0 }]
        }));
    };

    const updateProductQty = (idx: number, qty: number) => {
        const newProducts = [...transactionData.products];
        newProducts[idx].quantity = qty;
        setTransactionData(prev => ({
            ...prev,
            products: newProducts,
            amount: newProducts.reduce((sum, p) => sum + (p.quantity * p.price), 0).toString()
        }));
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.contactName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-10 pb-20">
            {/* Header Area */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/30 p-8 rounded-[40px] border border-border-color backdrop-blur-sm">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                            <Truck className="w-6 h-6 text-accent" />
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter font-outfit">Tedarikçi Yönetimi</h1>
                    </div>
                    <p className="text-muted text-sm font-bold uppercase tracking-widest pl-1">İş Ortakları ve Alım Listesi</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
                        <input
                            type="text"
                            placeholder="Tedarikçi ara..."
                            className="w-full bg-secondary border border-border-color rounded-2xl pl-12 pr-6 py-3.5 outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent-glow transition-all font-bold text-xs uppercase tracking-widest"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-accent text-white px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-accent-glow hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> Yeni Tedarikçi
                    </button>
                </div>
            </header>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Toplam Tedarikçi"
                    value={suppliers.length}
                    icon={<Building2 className="text-blue-500" />}
                />
                <StatCard
                    label="Toplam Borç Bakiyesi"
                    value={`₺${suppliers.reduce((a, b) => a + b.balance, 0).toLocaleString()}`}
                    icon={<Wallet className="text-orange-500" />}
                />
                <StatCard
                    label="Bekleyen Alımlar"
                    value="0"
                    icon={<History className="text-emerald-500" />}
                />
            </div>

            {/* Supplier List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence>
                    {filteredSuppliers.map((s, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={s.id}
                            className="bg-card border border-border-color rounded-[32px] p-8 hover:border-accent/20 transition-all group relative overflow-hidden shadow-sm"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                                <Truck className="w-24 h-24" />
                            </div>

                            <div className="relative z-10 flex flex-col h-full gap-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-accent transition-colors">{s.name}</h3>
                                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1">
                                            Yetkili: <span className="text-foreground">{s.contactName || 'Belirtilmemiş'}</span>
                                        </p>
                                    </div>
                                    <button className="p-2 text-muted hover:text-foreground">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <ContactItem icon={<Phone className="w-4 h-4" />} text={s.phone || '-'} />
                                        <ContactItem icon={<Mail className="w-4 h-4" />} text={s.email || '-'} />
                                        <ContactItem icon={<MapPin className="w-4 h-4" />} text={s.address || '-'} />
                                    </div>
                                    <div className="bg-secondary rounded-3xl p-6 flex flex-col items-center justify-center gap-2 border border-border-color group-hover:border-accent/10 transition-all">
                                        <span className="text-[9px] font-black tracking-[0.2em] text-muted uppercase">Borç Bakiyesi</span>
                                        <span className={`text-2xl font-black ${s.balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                            ₺{s.balance.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4">
                                    <button className="flex-1 bg-accent/5 text-accent py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-accent hover:text-white transition-all">
                                        Mal Alımı Yap (+)
                                    </button>
                                    <button className="flex-1 border border-border-color py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-secondary transition-all">
                                        Ödeme Yap (-)
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredSuppliers.length === 0 && !isLoading && (
                    <div className="col-span-full py-20 bg-secondary/30 border-2 border-dashed border-border-color rounded-[40px] flex flex-col items-center justify-center gap-4 text-muted">
                        <Truck className="w-16 h-16 opacity-10" />
                        <p className="font-black uppercase tracking-widest text-xs">Tedarikçi bulunamadı.</p>
                    </div>
                )}
            </div>

            {/* New Supplier Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-card border border-border-color w-full max-w-2xl rounded-[40px] p-10 shadow-2xl space-y-8"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Yeni Tedarikçi Ekle</h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-muted hover:text-foreground">
                                    <Plus className="w-8 h-8 rotate-45" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput label="Firma Adı" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} required />
                                <FormInput label="Yetkili Kişi" value={formData.contactName} onChange={v => setFormData({ ...formData, contactName: v })} />
                                <FormInput label="Telefon" value={formData.phone} onChange={v => setFormData({ ...formData, phone: v })} />
                                <FormInput label="E-Posta" value={formData.email} onChange={v => setFormData({ ...formData, email: v })} />
                                <div className="md:col-span-2">
                                    <FormInput label="Adres" value={formData.address} onChange={v => setFormData({ ...formData, address: v })} />
                                </div>
                                <FormInput label="Vergi Dairesi" value={formData.taxOffice} onChange={v => setFormData({ ...formData, taxOffice: v })} />
                                <FormInput label="Vergi Numarası" value={formData.taxNumber} onChange={v => setFormData({ ...formData, taxNumber: v })} />

                                <div className="md:col-span-2 pt-4">
                                    <button
                                        type="submit"
                                        className="w-full bg-accent text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl shadow-accent-glow hover:brightness-110 active:scale-95 transition-all"
                                    >
                                        Tedarikçiyi Kaydet
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ label, value, icon }: { label: string, value: any, icon: React.ReactNode }) {
    return (
        <div className="bg-card border border-border-color rounded-[32px] p-6 shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center shadow-inner">
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted leading-tight">{label}</span>
                <span className="text-2xl font-black font-outfit tracking-tighter">{value}</span>
            </div>
        </div>
    );
}

function ContactItem({ icon, text }: { icon: React.ReactNode, text: string }) {
    return (
        <div className="flex items-center gap-3 text-muted">
            <div className="text-accent/40">{icon}</div>
            <span className="text-[10px] font-bold truncate max-w-[150px]">{text}</span>
        </div>
    );
}

function FormInput({ label, value, onChange, required = false }: { label: string, value: string, onChange: (v: string) => void, required?: boolean }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted pl-1">{label}</label>
            <input
                type="text"
                required={required}
                className="w-full bg-secondary border border-border-color rounded-2xl px-6 py-4 outline-none focus:border-accent/50 transition-all font-bold text-xs"
                value={value}
                onChange={e => onChange(e.target.value)}
            />
        </div>
    );
}
