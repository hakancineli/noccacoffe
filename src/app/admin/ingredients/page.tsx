'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

interface Ingredient {
    id: string;
    name: string;
    unit: string;
    stock: number;
    costPerUnit: number;
    createdAt: string;
    updatedAt: string;
}

export default function IngredientsPage() {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

    const [monthlyConsumption, setMonthlyConsumption] = useState(0);

    const [formData, setFormData] = useState({
        name: '',
        unit: 'g',
        stock: 0,
        costPerUnit: 0
    });

    useEffect(() => {
        fetchIngredients();
    }, [search]);

    const fetchIngredients = async () => {
        try {
            const url = search
                ? `/api/admin/ingredients?search=${encodeURIComponent(search)}`
                : '/api/admin/ingredients';

            const res = await fetch(url);
            const data = await res.json();

            // Handle new response format
            // Handle new response format
            if (data.items && Array.isArray(data.items)) {
                setIngredients(data.items);
                setMonthlyConsumption(data.meta?.monthlyConsumptionCost || 0);
            } else {
                if (Array.isArray(data)) setIngredients(data);
                else {
                    console.error('Invalid ingredients format:', data);
                    setIngredients([]); // Safe fallback
                }
            }
        } catch (error) {
            console.error('Failed to fetch ingredients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const method = editingIngredient ? 'PUT' : 'POST';
            const body = editingIngredient
                ? { ...formData, id: editingIngredient.id }
                : formData;

            const res = await fetch('/api/admin/ingredients', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                fetchIngredients();
                setShowModal(false);
                resetForm();
            }
        } catch (error) {
            console.error('Failed to save ingredient:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu hammaddeyi silmek istediğinizden emin misiniz?')) return;

        try {
            const res = await fetch(`/api/admin/ingredients?id=${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchIngredients();
            }
        } catch (error) {
            console.error('Failed to delete ingredient:', error);
        }
    };

    const openEditModal = (ingredient: Ingredient) => {
        setEditingIngredient(ingredient);
        setFormData({
            name: ingredient.name,
            unit: ingredient.unit,
            stock: ingredient.stock,
            costPerUnit: ingredient.costPerUnit
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ name: '', unit: 'g', stock: 0, costPerUnit: 0 });
        setEditingIngredient(null);
    };

    const totalInventoryValue = Array.isArray(ingredients) ? ingredients.reduce(
        (sum, ing) => sum + (ing.stock * ing.costPerUnit),
        0
    ) : 0;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Hammadde Yönetimi</h1>
                        <p className="text-gray-600 mt-1">Stok takibi ve maliyet yönetimi</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2"
                    >
                        <FaPlus /> Yeni Hammadde
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                        <p className="text-gray-500 text-sm font-medium">Aylık Tüketim (Gider)</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                            ₺{monthlyConsumption.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Bu ay kullanılan hammadde maliyeti</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                        <p className="text-gray-500 text-sm font-medium">Anlık Stok Değeri</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">
                            ₺{totalInventoryValue.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Mevcut stokların değeri</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <p className="text-gray-500 text-sm font-medium">Toplam Hammadde</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{ingredients.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <p className="text-gray-500 text-sm font-medium">Düşük Stok Uyarısı</p>
                        <p className="text-3xl font-bold text-orange-600 mt-2">
                            {ingredients.filter(i => i.stock < 100).length}
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Hammadde ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hammadde</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Birim</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Birim Maliyet</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam Değer</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Yükleniyor...
                                    </td>
                                </tr>
                            ) : ingredients.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Hammadde bulunamadı
                                    </td>
                                </tr>
                            ) : (
                                ingredients.map((ingredient) => (
                                    <tr key={ingredient.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{ingredient.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{ingredient.unit}</td>
                                        <td className="px-6 py-4">
                                            <span className={`font-semibold ${ingredient.stock < 100 ? 'text-orange-600' : 'text-gray-900'}`}>
                                                {ingredient.stock.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            ₺{ingredient.costPerUnit.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-green-600">
                                            ₺{(ingredient.stock * ingredient.costPerUnit).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openEditModal(ingredient)}
                                                className="text-blue-600 hover:text-blue-800 mr-4"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(ingredient.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold mb-6">
                            {editingIngredient ? 'Hammadde Düzenle' : 'Yeni Hammadde Ekle'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">İsim</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Örn: Espresso Çekirdeği"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Birim</label>
                                <select
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="g">Gram (g)</option>
                                    <option value="ml">Mililitre (ml)</option>
                                    <option value="adet">Adet</option>
                                    <option value="kg">Kilogram (kg)</option>
                                    <option value="lt">Litre (lt)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Birim Maliyet (₺)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.costPerUnit}
                                    onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    {editingIngredient ? 'Güncelle' : 'Ekle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
