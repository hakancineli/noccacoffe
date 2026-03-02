'use client';

import { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';

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
        unit: 'gram',
        stock: 0,
        costPerUnit: 0
    });

    const [activeCategory, setActiveCategory] = useState('Tümü');
    const [stockFilter, setStockFilter] = useState('Hepsi'); // Hepsi, Düşük Stok, Stokta Yok
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
        key: 'name',
        direction: 'asc'
    });

    useEffect(() => {
        fetchIngredients();
    }, [search]);

    const categories = [
        'Tümü',
        'Şuruplar',
        'Soslar',
        'Tozlar',
        'Püreler',
        'Sütler',
        'Tatlılar',
        'Çaylar',
        'Meşrubatlar',
        'Bardaklar',
        'Diğer'
    ];

    const getIngredientCategory = (name: string) => {
        const lowerName = name.toLocaleLowerCase('tr');
        if (lowerName.startsWith('şurup:')) return 'Şuruplar';
        if (lowerName.startsWith('sos:')) return 'Soslar';
        if (lowerName.startsWith('toz:')) return 'Tozlar';
        if (lowerName.startsWith('püre:')) return 'Püreler';
        if (lowerName.startsWith('süt:')) return 'Sütler';
        if (lowerName.startsWith('meşrubat:')) return 'Meşrubatlar';
        if (lowerName.startsWith('bardak:')) return 'Bardaklar';
        if (lowerName.endsWith('hammaddesi')) {
            if (lowerName.includes('çay')) return 'Çaylar';
            return 'Tatlılar';
        }
        if (['ıhlamur', 'kış çayı', 'papatya çayı', 'yeşil çay', 'kiraz sapı', 'hibiscus çayı'].some(t => lowerName.includes(t))) return 'Çaylar';
        return 'Diğer';
    };

    const filteredIngredients = useMemo(() => {
        let result = [...ingredients].filter(ing => {
            // Category Filter
            if (activeCategory !== 'Tümü') {
                const cat = getIngredientCategory(ing.name);
                if (cat !== activeCategory) return false;
            }

            // Stock Filter
            if (stockFilter === 'Düşük Stok') {
                if (ing.stock >= 100) return false;
            } else if (stockFilter === 'Stokta Yok') {
                if (ing.stock > 0) return false;
            }

            return true;
        });

        // Sorting
        result.sort((a, b) => {
            let aVal: any;
            let bVal: any;

            switch (sortConfig.key) {
                case 'name':
                    aVal = a.name.toLocaleLowerCase('tr');
                    bVal = b.name.toLocaleLowerCase('tr');
                    break;
                case 'category':
                    aVal = getIngredientCategory(a.name).toLocaleLowerCase('tr');
                    bVal = getIngredientCategory(b.name).toLocaleLowerCase('tr');
                    break;
                case 'stock':
                    aVal = a.stock;
                    bVal = b.stock;
                    break;
                case 'cost':
                    aVal = a.costPerUnit;
                    bVal = b.costPerUnit;
                    break;
                case 'total':
                    aVal = a.stock * a.costPerUnit;
                    bVal = b.stock * b.costPerUnit;
                    break;
                default:
                    return 0;
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [ingredients, activeCategory, stockFilter, sortConfig]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const fetchIngredients = async () => {
        try {
            const url = search
                ? `/api/admin/ingredients?search=${encodeURIComponent(search)}`
                : '/api/admin/ingredients';

            const res = await fetch(url);
            const data = await res.json();

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
        setFormData({ name: '', unit: 'gram', stock: 0, costPerUnit: 0 });
        setEditingIngredient(null);
    };

    const handleExportToExcel = () => {
        // Excel as requested should match the current filtered and sorted view
        const excelData = filteredIngredients.map(ing => ({
            'Hammadde Adı': ing.name,
            'Kategori': getIngredientCategory(ing.name),
            'Birim': ing.unit,
            'Stok Miktarı': ing.stock,
            'Birim Maliyet (₺)': ing.costPerUnit.toFixed(2),
            'Toplam Değer (₺)': (ing.stock * ing.costPerUnit).toFixed(2),
            'Son Güncelleme': new Date(ing.updatedAt).toLocaleDateString('tr-TR')
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Col widths
        const wscols = [
            { wch: 35 }, // Name
            { wch: 15 }, // Category
            { wch: 10 }, // Unit
            { wch: 15 }, // Stock
            { wch: 18 }, // Unit Cost
            { wch: 18 }, // Total Value
            { wch: 15 }  // Date
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Hammaddeler");

        const fileName = `Nocca_Hammadde_Listesi_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
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
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportToExcel}
                            className="bg-emerald-100 text-emerald-700 px-6 py-3 rounded-lg font-bold hover:bg-emerald-200 transition flex items-center gap-2 border border-emerald-200"
                        >
                            <FaFileExcel className="text-xl" /> Excel İndir
                        </button>
                        <button
                            onClick={() => { resetForm(); setShowModal(true); }}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2"
                        >
                            <FaPlus /> Yeni Hammadde
                        </button>
                    </div>
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

                {/* Search & Filters */}
                <div className="bg-white p-6 rounded-lg shadow mb-6 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Hammadde ara..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white font-medium"
                        >
                            <option value="Hepsi">Tüm Stok Durumları</option>
                            <option value="Düşük Stok">Düşük Stok (&lt;100)</option>
                            <option value="Stokta Yok">Stokta Yok</option>
                        </select>
                        <select
                            value={`${sortConfig.key}-${sortConfig.direction}`}
                            onChange={(e) => {
                                const [key, direction] = e.target.value.split('-');
                                setSortConfig({ key, direction: direction as 'asc' | 'desc' });
                            }}
                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white font-medium"
                        >
                            <option value="name-asc">A-Z (İsim)</option>
                            <option value="name-desc">Z-A (İsim)</option>
                            <option value="category-asc">Kategori (A-Z)</option>
                            <option value="stock-desc">Stok (Azalan)</option>
                            <option value="stock-asc">Stok (Artan)</option>
                            <option value="cost-desc">Maliyet (Azalan)</option>
                            <option value="total-desc">Toplam Değer (Azalan)</option>
                        </select>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${activeCategory === cat
                                    ? 'bg-green-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th onClick={() => requestSort('name')} className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition">
                                    Hammadde {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Birim</th>
                                <th onClick={() => requestSort('stock')} className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition">
                                    Stok {sortConfig.key === 'stock' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => requestSort('cost')} className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition">
                                    Birim Maliyet {sortConfig.key === 'cost' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => requestSort('total')} className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition">
                                    Toplam Değer {sortConfig.key === 'total' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-black text-gray-500 uppercase tracking-widest">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Yükleniyor...
                                    </td>
                                </tr>
                            ) : filteredIngredients.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Hammadde bulunamadı
                                    </td>
                                </tr>
                            ) : (
                                filteredIngredients.map((ingredient) => (
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
                                    <option value="gram">Gram (gram)</option>
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
