'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface WasteLog {
    id: string;
    productId: string | null;
    productName: string | null;
    ingredientId: string | null;
    ingredientName: string | null;
    quantity: number;
    unit: string | null;
    reason: string | null;
    userId: string | null;
    userEmail: string | null;
    createdAt: string;
}

interface Product {
    id: string;
    name: string;
}

interface Ingredient {
    id: string;
    name: string;
    unit: string;
}

export default function WasteManagementPage() {
    const [logs, setLogs] = useState<WasteLog[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

    // Form State
    const [type, setType] = useState<'product' | 'ingredient'>('product');
    const [formData, setFormData] = useState({
        productId: '',
        ingredientId: '',
        quantity: '',
        reason: '',
    });

    useEffect(() => {
        fetchLogs();
        fetchData();
    }, [pagination.page]);

    const fetchData = async () => {
        try {
            const [productsRes, ingredientsRes] = await Promise.all([
                fetch('/api/admin/products?limit=1000'),
                fetch('/api/admin/ingredients')
            ]);

            if (productsRes.ok) {
                const data = await productsRes.json();
                setProducts(data.products || []);
            }
            if (ingredientsRes.ok) {
                const data = await ingredientsRes.json();
                // Assuming ingredients API returns a simple array or { ingredients: [] }
                setIngredients(Array.isArray(ingredientsRes) ? ingredientsRes : (await ingredientsRes.json()).ingredients || []);
            }
        } catch (error) {
            console.error('Initial data fetch error:', error);
        }
    };

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/waste?page=${pagination.page}&limit=${pagination.limit}`);
            if (response.ok) {
                const data = await response.json();
                setLogs(data.logs);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Logs fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload: any = {
            quantity: formData.quantity,
            reason: formData.reason,
        };

        if (type === 'product') {
            const p = products.find(x => x.id === formData.productId);
            payload.productId = p?.id;
            payload.productName = p?.name;
            payload.unit = 'Adet';
        } else {
            const i = ingredients.find(x => x.id === formData.ingredientId);
            payload.ingredientId = i?.id;
            payload.ingredientName = i?.name;
            payload.unit = i?.unit;
        }

        try {
            const response = await fetch('/api/admin/waste', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setFormData({ productId: '', ingredientId: '', quantity: '', reason: '' });
                fetchLogs();
                alert('Zayi kaydı başarıyla oluşturuldu.');
            } else {
                const err = await response.json();
                alert(`Hata: ${err.error}`);
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Bir hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link href="/admin" className="mr-4 text-gray-400 hover:text-gray-600">
                                ←
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">Zayi Yönetimi</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
                {/* Add Waste Form */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Yeni Zayi Kaydı Ekle</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Tip</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as any)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm h-10 border px-2"
                            >
                                <option value="product">Ürün</option>
                                <option value="ingredient">Hammadde</option>
                            </select>
                        </div>

                        {type === 'product' ? (
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Ürün Seçiniz</label>
                                <select
                                    required
                                    value={formData.productId}
                                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm h-10 border px-2"
                                >
                                    <option value="">Seçiniz...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Hammadde Seçiniz</label>
                                <select
                                    required
                                    value={formData.ingredientId}
                                    onChange={(e) => setFormData({ ...formData, ingredientId: e.target.value })}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm h-10 border px-2"
                                >
                                    <option value="">Seçiniz...</option>
                                    {ingredients.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Miktar</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                placeholder="Örn: 2"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm h-10 border px-2"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Neden</label>
                            <input
                                required
                                type="text"
                                placeholder="Örn: Bozuk, Tarihi Geçmiş"
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm h-10 border px-2"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-orange-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 h-10"
                            >
                                {isSubmitting ? 'Kaydediliyor...' : 'Zayi İşle'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Waste History Table */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">Zayi Geçmişi</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Varlık</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miktar</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Neden</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center">
                                            <div className="animate-spin inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">Henüz bir zayi kaydı bulunmuyor.</td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(log.createdAt).toLocaleString('tr-TR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {log.productName || log.ingredientName}
                                                <span className="ml-2 text-xs text-gray-400">({log.productId ? 'Ürün' : 'Hammadde'})</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {log.quantity} {log.unit}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.reason}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.userEmail || 'Sistem'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-center gap-2">
                            {[...Array(pagination.pages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setPagination(p => ({ ...p, page: i + 1 }))}
                                    className={`px-3 py-1 border rounded ${pagination.page === i + 1 ? 'bg-orange-50 border-orange-500 text-orange-600' : 'bg-white border-gray-300 text-gray-500'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
