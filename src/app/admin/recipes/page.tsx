'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCalculator } from 'react-icons/fa';

interface Ingredient {
    id: string;
    name: string;
    unit: string;
    costPerUnit: number;
}

interface RecipeItem {
    id?: string;
    ingredientId: string;
    quantity: number;
    ingredient?: Ingredient;
}

interface Recipe {
    id: string;
    productId: string;
    size: string | null;
    product: {
        id: string;
        name: string;
    };
    items: RecipeItem[];
}

interface Product {
    id: string;
    name: string;
}

export default function RecipesPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

    const [formData, setFormData] = useState({
        productId: '',
        size: '',
        items: [] as { ingredientId: string; quantity: number }[]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [recipesRes, productsRes, ingredientsRes] = await Promise.all([
                fetch('/api/admin/recipes'),
                fetch('/api/admin/products'),
                fetch('/api/admin/ingredients')
            ]);

            const [recipesData, productsData, ingredientsData] = await Promise.all([
                recipesRes.json(),
                productsRes.json(),
                ingredientsRes.json()
            ]);

            setRecipes(recipesData);
            setProducts(productsData.products || productsData);
            setIngredients(ingredientsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateRecipeCost = (items: RecipeItem[]) => {
        return items.reduce((sum, item) => {
            const ingredient = item.ingredient || ingredients.find(i => i.id === item.ingredientId);
            return sum + (ingredient ? ingredient.costPerUnit * item.quantity : 0);
        }, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.items.length === 0) {
            alert('En az bir hammadde ekleyin');
            return;
        }

        try {
            const method = editingRecipe ? 'PUT' : 'POST';
            const body = editingRecipe
                ? { ...formData, id: editingRecipe.id }
                : formData;

            const res = await fetch('/api/admin/recipes', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                fetchData();
                setShowModal(false);
                resetForm();
            }
        } catch (error) {
            console.error('Failed to save recipe:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu reçeteyi silmek istediğinizden emin misiniz?')) return;

        try {
            const res = await fetch(`/api/admin/recipes?id=${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchData();
            }
        } catch (error) {
            console.error('Failed to delete recipe:', error);
        }
    };

    const openEditModal = (recipe: Recipe) => {
        setEditingRecipe(recipe);
        setFormData({
            productId: recipe.productId,
            size: recipe.size || '',
            items: recipe.items.map(item => ({
                ingredientId: item.ingredientId,
                quantity: item.quantity
            }))
        });
        setShowModal(true);
    };

    const addIngredientToRecipe = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { ingredientId: ingredients[0]?.id || '', quantity: 0 }]
        });
    };

    const updateRecipeItem = (index: number, field: 'ingredientId' | 'quantity', value: string | number) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, items: newItems });
    };

    const removeRecipeItem = (index: number) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index)
        });
    };

    const updateIngredientUnit = async (ingredientId: string, newUnit: string) => {
        try {
            const res = await fetch('/api/admin/ingredients', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: ingredientId, unit: newUnit })
            });
            if (res.ok) {
                // Refresh ingredients list
                const ingredientsRes = await fetch('/api/admin/ingredients');
                const ingredientsData = await ingredientsRes.json();
                setIngredients(ingredientsData.items || ingredientsData);
            }
        } catch (error) {
            console.error('Failed to update ingredient unit:', error);
        }
    };

    const resetForm = () => {
        setFormData({ productId: '', size: '', items: [] });
        setEditingRecipe(null);
    };

    const currentRecipeCost = formData.items.reduce((sum, item) => {
        const ingredient = ingredients.find(i => i.id === item.ingredientId);
        return sum + (ingredient ? ingredient.costPerUnit * item.quantity : 0);
    }, 0);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Reçete Yönetimi</h1>
                        <p className="text-gray-600 mt-1">Ürün-hammadde ilişkileri ve maliyet hesaplama</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2"
                    >
                        <FaPlus /> Yeni Reçete
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <p className="text-gray-500 text-sm font-medium">Toplam Reçete</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{recipes.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <p className="text-gray-500 text-sm font-medium">Reçeteli Ürün</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">
                            {new Set(recipes.map(r => r.productId)).size}
                        </p>
                    </div>
                </div>

                {/* Recipes List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Boyut</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hammaddeler</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Maliyet</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Yükleniyor...</td>
                                </tr>
                            ) : recipes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Reçete bulunamadı</td>
                                </tr>
                            ) : (
                                recipes.map((recipe) => (
                                    <tr key={recipe.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{recipe.product.name}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {recipe.size || <span className="text-gray-400 italic">Tüm boyutlar</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">
                                                {recipe.items.map((item, idx) => (
                                                    <div key={idx}>
                                                        {item.ingredient?.name}: {item.quantity} {item.ingredient?.unit}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-green-600">
                                            ₺{calculateRecipeCost(recipe.items).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openEditModal(recipe)}
                                                className="text-blue-600 hover:text-blue-800 mr-4"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(recipe.id)}
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
                        <h2 className="text-2xl font-bold mb-6">
                            {editingRecipe ? 'Reçete Düzenle' : 'Yeni Reçete Oluştur'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ürün</label>
                                    <select
                                        required
                                        value={formData.productId}
                                        onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Seçiniz</option>
                                        {products.map(product => (
                                            <option key={product.id} value={product.id}>{product.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Boyut (Opsiyonel)</label>
                                    <select
                                        value={formData.size}
                                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Tüm boyutlar</option>
                                        <option value="Small">Small</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Large">Large</option>
                                    </select>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-gray-900">Hammaddeler</h3>
                                    <button
                                        type="button"
                                        onClick={addIngredientToRecipe}
                                        className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                                    >
                                        <FaPlus /> Hammadde Ekle
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {formData.items.map((item, index) => (
                                        <div key={index} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg">
                                            <select
                                                value={item.ingredientId}
                                                onChange={(e) => updateRecipeItem(index, 'ingredientId', e.target.value)}
                                                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                                            >
                                                {ingredients.map(ing => (
                                                    <option key={ing.id} value={ing.id}>{ing.name}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={item.quantity}
                                                onChange={(e) => updateRecipeItem(index, 'quantity', parseFloat(e.target.value))}
                                                className="w-24 px-3 py-2 border rounded-lg text-sm"
                                                placeholder="Miktar"
                                            />
                                            <select
                                                value={ingredients.find(i => i.id === item.ingredientId)?.unit || 'adet'}
                                                onChange={(e) => updateIngredientUnit(item.ingredientId, e.target.value)}
                                                className="text-[10px] bg-gray-100 border-none rounded cursor-pointer hover:bg-gray-200 w-16 h-8"
                                            >
                                                <option value="gram">gram</option>
                                                <option value="adet">adet</option>
                                                <option value="ml">ml</option>
                                                <option value="kg">kg</option>
                                                <option value="lt">lt</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => removeRecipeItem(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {formData.items.length > 0 && (
                                    <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FaCalculator className="text-green-600" />
                                            <span className="font-medium text-gray-700">Toplam Maliyet:</span>
                                        </div>
                                        <span className="text-2xl font-bold text-green-600">
                                            ₺{currentRecipeCost.toFixed(2)}
                                        </span>
                                    </div>
                                )}
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
                                    {editingRecipe ? 'Güncelle' : 'Oluştur'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
