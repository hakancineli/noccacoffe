'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaTrash } from 'react-icons/fa';

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
  items: RecipeItem[];
}

interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  recipes?: Recipe[];
  soldCount: number;
  salesBySize?: { size: string; count: number }[];
  prices?: any; // JSON field
}

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [selectedProductForRecipe, setSelectedProductForRecipe] = useState<Product | null>(null);
  const [currentProductRecipes, setCurrentProductRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipeFormData, setRecipeFormData] = useState<{
    size: string;
    items: { ingredientId: string; quantity: number }[];
  }>({ size: '', items: [] });
  const [filter, setFilter] = useState({
    category: 'all',
    search: '',
    active: 'true',
    hasRecipe: 'all',
  });

  // Reset page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filter.category, filter.search, filter.active, filter.hasRecipe]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, [filter.category, filter.search, filter.active, filter.hasRecipe, pagination.page, pagination.limit]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filter.category !== 'all' && { category: filter.category }),
        ...(filter.search && { search: filter.search }),
        ...(filter.active !== undefined && { active: filter.active }),
        ...(filter.hasRecipe !== 'all' && { hasRecipe: filter.hasRecipe === 'yes' ? 'true' : 'false' }),
      });

      const response = await fetch(`/api/admin/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        setPagination(prev => ({ ...prev, ...data.pagination }));
      }
    } catch (error) {
      console.error('Products fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (formData: FormData) => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          category: formData.get('category'),
          price: formData.get('price'),
          imageUrl: formData.get('imageUrl'),
          stock: formData.get('stock'),
        }),
      });

      if (response.ok) {
        fetchProducts();
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      console.error('Product creation error:', error);
    }
  };

  const updateProduct = async (productId: string, formData: FormData) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          category: formData.get('category'),
          price: formData.get('price'),
          imageUrl: formData.get('imageUrl'),
          stock: formData.get('stock'),
          isActive: formData.get('isActive') !== null,
        }),
      });

      if (response.ok) {
        fetchProducts();
        setIsModalOpen(false);
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error('Product update error:', error);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Product deletion error:', error);
    }
  };

  // Recipe Management Functions
  const fetchIngredients = async () => {
    try {
      const res = await fetch('/api/admin/ingredients');
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          setIngredients(data.items);
        } else if (Array.isArray(data)) {
          setIngredients(data);
        } else {
          setIngredients([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch ingredients:', error);
    }
  };

  const openRecipeModal = async (product: Product) => {
    setSelectedProductForRecipe(product);
    await fetchIngredients();

    // Fetch existing recipes for this product
    try {
      const res = await fetch(`/api/admin/recipes?productId=${product.id}`);
      if (res.ok) {
        const recipes = await res.json();
        setCurrentProductRecipes(recipes);

        if (recipes.length > 0) {
          // Load first recipe (or you can let user select which size)
          const recipe = recipes[0];
          setRecipeFormData({
            size: recipe.size || '',
            items: recipe.items.map((item: RecipeItem) => ({
              ingredientId: item.ingredientId,
              quantity: item.quantity
            }))
          });
        } else {
          setRecipeFormData({ size: '', items: [] });
        }
      }
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      setCurrentProductRecipes([]);
    }

    setIsRecipeModalOpen(true);
  };

  const saveRecipe = async () => {
    if (!selectedProductForRecipe || recipeFormData.items.length === 0) {
      alert('Lütfen en az bir hammadde ekleyin');
      return;
    }

    try {
      const res = await fetch('/api/admin/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductForRecipe.id,
          size: recipeFormData.size || null,
          items: recipeFormData.items
        })
      });

      if (res.ok) {
        setIsRecipeModalOpen(false);
        setRecipeFormData({ size: '', items: [] });
        fetchProducts(); // Refresh to show updated recipe status
      }
    } catch (error) {
      console.error('Failed to save recipe:', error);
    }
  };

  const deleteRecipe = async (recipeId: string) => {
    if (!confirm('Bu reçeteyi silmek istediğinizden emin misiniz?')) return;

    try {
      const res = await fetch(`/api/admin/recipes?id=${recipeId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // If we deleted the currently viewed recipe size
        if (currentProductRecipes.find(r => r.id === recipeId)?.size === recipeFormData.size ||
          (!currentProductRecipes.find(r => r.id === recipeId)?.size && !recipeFormData.size)) {
          setRecipeFormData({ size: recipeFormData.size, items: [] });
        }

        // Refresh recipes list
        if (selectedProductForRecipe) {
          const resRecipes = await fetch(`/api/admin/recipes?productId=${selectedProductForRecipe.id}`);
          if (resRecipes.ok) {
            const recipes = await resRecipes.json();
            setCurrentProductRecipes(recipes);
          }
        }
        fetchProducts(); // Update product status in table
      }
    } catch (error) {
      console.error('Failed to delete recipe:', error);
    }
  };

  const addIngredientToRecipe = () => {
    if (ingredients.length === 0) return;
    setRecipeFormData({
      ...recipeFormData,
      items: [...recipeFormData.items, { ingredientId: ingredients[0].id, quantity: 0 }]
    });
  };

  const updateRecipeItem = (index: number, field: 'ingredientId' | 'quantity', value: string | number) => {
    const newItems = [...recipeFormData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setRecipeFormData({ ...recipeFormData, items: newItems });
  };

  const removeRecipeItem = (index: number) => {
    setRecipeFormData({
      ...recipeFormData,
      items: recipeFormData.items.filter((_, i) => i !== index)
    });
  };

  const calculateRecipeCost = () => {
    return recipeFormData.items.reduce((sum, item) => {
      const ingredient = ingredients.find(i => i.id === item.ingredientId);
      return sum + (ingredient ? ingredient.costPerUnit * item.quantity : 0);
    }, 0);
  };

  const hasRecipe = (product: Product) => {
    return product.recipes && product.recipes.length > 0;
  };


  const toggleProductStatus = async (productId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Product status toggle error:', error);
    }
  };

  const categories = [
    'Soğuk Kahveler',
    'Sıcak Kahveler',
    'Soğuk İçecekler',
    'Espresso',
    'Milkshake',
    'Frappeler',
    'Bubble Tea',
    'Matchalar',
    'Bitki Çayları',
    'Şuruplar',
    'Soslar',
    'Püreler',
    'Tozlar',
    'Sütler',
    'Yan Ürünler',
    'Kahve Çekirdekleri',
    'Meşrubatlar',
    'Extra',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Ürün Yönetimi</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Yeni Ürün
              </button>
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                Admin Panel
              </Link>
              <Link href="/admin/orders" className="text-gray-600 hover:text-gray-900">
                Siparişler
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ara
              </label>
              <input
                type="text"
                id="search-input"
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Ürün adı veya açıklama..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="sm:w-48">
              <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                id="category-filter"
                value={filter.category}
                onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Tümü</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="sm:w-48">
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Durum
              </label>
              <select
                id="status-filter"
                value={filter.active}
                onChange={(e) => setFilter(prev => ({ ...prev, active: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="true">Aktif</option>
                <option value="false">Pasif</option>
                <option value="">Tümü</option>
              </select>
            </div>
            <div className="sm:w-48">
              <label htmlFor="recipe-status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Reçete Durumu
              </label>
              <select
                id="recipe-status-filter"
                value={filter.hasRecipe}
                onChange={(e) => setFilter(prev => ({ ...prev, hasRecipe: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Tümü</option>
                <option value="yes">Reçeteli</option>
                <option value="no">Reçetesiz</option>
              </select>
            </div>
            <div className="sm:w-32">
              <label htmlFor="limit-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Göster
              </label>
              <select
                id="limit-filter"
                value={pagination.limit}
                onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Görsel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ürün Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam Satış
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fiyat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reçete
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      Henüz ürün bulunmuyor
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">No Image</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">
                        <div>{product.soldCount} Adet</div>
                        {product.salesBySize && product.salesBySize.length > 0 && (
                          <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                            {product.salesBySize.map(s => (
                              <div key={s.size} className="flex gap-1">
                                <span className="font-semibold">{s.size === 'Standart' ? 'Std' : s.size.substring(0, 1)}:</span>
                                <span>{s.count}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₺{product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {product.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openRecipeModal(product)}
                          className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-md ${hasRecipe(product)
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                            }`}
                        >
                          {hasRecipe(product) ? '✅ Düzenle' : '➕ Reçete Ekle'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => toggleProductStatus(product.id, !product.isActive)}
                            className={`${product.isActive
                              ? 'text-yellow-600 hover:text-yellow-900'
                              : 'text-green-600 hover:text-green-900'
                              }`}
                          >
                            {product.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Önceki
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Sonraki
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Sayfa <span className="font-medium">{pagination.page}</span> /{' '}
                    <span className="font-medium">{pagination.pages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Önceki
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Sonraki
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </main >

      {/* Create Product Modal */}
      {
        isCreateModalOpen && (
          <ProductModal
            product={null}
            onSubmit={createProduct}
            onClose={() => setIsCreateModalOpen(false)}
            categories={categories}
          />
        )
      }

      {/* Edit Product Modal */}
      {
        isModalOpen && selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onSubmit={(formData) => updateProduct(selectedProduct.id, formData)}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedProduct(null);
            }}
            categories={categories}
          />
        )
      }

      {/* Recipe Modal */}
      <RecipeModal
        isOpen={isRecipeModalOpen}
        onClose={() => {
          setIsRecipeModalOpen(false);
          setSelectedProductForRecipe(null);
          setRecipeFormData({ size: '', items: [] });
        }}
        product={selectedProductForRecipe}
        currentProductRecipes={currentProductRecipes}
        ingredients={ingredients}
        recipeFormData={recipeFormData}
        setRecipeFormData={setRecipeFormData}
        addIngredientToRecipe={addIngredientToRecipe}
        updateRecipeItem={updateRecipeItem}
        removeRecipeItem={removeRecipeItem}
        calculateRecipeCost={calculateRecipeCost}
        saveRecipe={saveRecipe}
        deleteRecipe={deleteRecipe}
      />
    </div >
  );

}

// Product Modal Component
function ProductModal({
  product,
  onSubmit,
  onClose,
  categories,
}: {
  product: Product | null;
  onSubmit: (formData: FormData) => void;
  onClose: () => void;
  categories: string[];
}) {
  const [formDataImageUrl, setFormDataImageUrl] = useState<string>('');

  // Size Pricing State
  const [sizePrices, setSizePrices] = useState<{ size: string, price: number }[]>([]);

  useEffect(() => {
    if (product && product.prices) {
      try {
        const parsed = typeof product.prices === 'string' ? JSON.parse(product.prices) : product.prices;
        if (Array.isArray(parsed)) {
          setSizePrices(parsed);
        }
      } catch (e) {
        console.error("Failed to parse prices", e);
      }
    } else {
      setSizePrices([]);
    }
  }, [product]);

  const addSize = () => {
    setSizePrices([...sizePrices, { size: '', price: 0 }]);
  };

  const removeSize = (index: number) => {
    const newSizes = [...sizePrices];
    newSizes.splice(index, 1);
    setSizePrices(newSizes);
  };

  const updateSize = (index: number, field: 'size' | 'price', value: string | number) => {
    const newSizes = [...sizePrices];
    if (field === 'size') newSizes[index].size = value as string;
    if (field === 'price') newSizes[index].price = Number(value);
    setSizePrices(newSizes);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) { // 800KB Limit
        alert("Dosya boyutu çok yüksek! Lütfen 800KB altı bir görsel seçin.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormDataImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    // Explicitly set imageUrl from state if it changed, otherwise checking if the formData picked it up from hidden input
    if (formDataImageUrl) {
      formData.set('imageUrl', formDataImageUrl);
    }

    // Append prices as JSON string
    if (sizePrices.length > 0) {
      formData.append('prices', JSON.stringify(sizePrices));
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {product ? 'Ürün Düzenle' : 'Yeni Ürün'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="product-name" className="block text-sm font-medium text-gray-700">Ürün Adı</label>
              <input
                type="text"
                id="product-name"
                name="name"
                defaultValue={product?.name || ''}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="product-description" className="block text-sm font-medium text-gray-700">Açıklama</label>
              <textarea
                id="product-description"
                name="description"
                defaultValue={product?.description || ''}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="product-category" className="block text-sm font-medium text-gray-700">Kategori</label>
              <select
                id="product-category"
                name="category"
                defaultValue={product?.category || ''}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">Seçiniz</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="product-price" className="block text-sm font-medium text-gray-700">Fiyat (₺)</label>
                <input
                  type="number"
                  id="product-price"
                  name="price"
                  defaultValue={product?.price || ''}
                  step="0.01"
                  min="0"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="product-stock" className="block text-sm font-medium text-gray-700">Stok</label>
                <input
                  type="number"
                  id="product-stock"
                  name="stock"
                  defaultValue={product?.stock || ''}
                  min="0"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Size Pricing Section */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Fiyat Varyasyonları (Boyut)</label>
                <button type="button" onClick={addSize} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
                  + Boyut Ekle
                </button>
              </div>

              {sizePrices.length === 0 ? (
                <p className="text-xs text-gray-500 italic mb-4">Standart tek fiyat için yukarıdaki Fiyat alanını kullanın.</p>
              ) : (
                <div className="space-y-2 mb-4">
                  {sizePrices.map((sp, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select
                        value={sp.size}
                        onChange={(e) => updateSize(idx, 'size', e.target.value)}
                        className="block w-1/3 px-2 py-1 border border-gray-300 rounded-md text-sm"
                        required
                      >
                        <option value="" disabled>Boyut Seç</option>
                        <option value="S">Küçük (S)</option>
                        <option value="M">Orta (M)</option>
                        <option value="L">Büyük (L)</option>
                        <option value="Tek">Tek Boy</option>
                      </select>
                      <input
                        type="number"
                        value={sp.price}
                        onChange={(e) => updateSize(idx, 'price', e.target.value)}
                        placeholder="Fiyat"
                        className="block w-1/3 px-2 py-1 border border-gray-300 rounded-md text-sm"
                        min="0"
                        step="0.01"
                        required
                      />
                      <button type="button" onClick={() => removeSize(idx)} className="text-red-500 hover:text-red-700">
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ürün Görseli</label>
              <div className="mt-1 flex items-center space-x-4">
                <div className="flex-shrink-0 h-20 w-20 relative border rounded-lg overflow-hidden bg-gray-100">
                  {(product?.imageUrl || formDataImageUrl) ? (
                    <img
                      src={product?.imageUrl || formDataImageUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                      Görsel Yok
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    id="product-image-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-green-50 file:text-green-700
                        hover:file:bg-green-100
                      "
                  />
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (Max 500KB önerilir)</p>
                  <input
                    type="hidden"
                    name="imageUrl"
                    value={formDataImageUrl || product?.imageUrl || ''}
                  />
                </div>
              </div>
            </div>

            {product && (
              <div>
                <label htmlFor="product-active" className="flex items-center">
                  <input
                    type="checkbox"
                    id="product-active"
                    name="isActive"
                    defaultChecked={product.isActive}
                    className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Aktif</span>
                </label>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                İptal
              </button>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {product ? 'Güncelle' : 'Oluştur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Searchable Select Component
function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Seçiniz..."
}: {
  value: string;
  onChange: (value: string) => void;
  options: Ingredient[];
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [localOptions, setLocalOptions] = useState(options);

  useEffect(() => {
    setLocalOptions(
      options.filter(opt =>
        opt.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, options]);

  const selectedOption = options.find(o => o.id === value);

  return (
    <div className="relative flex-1">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer flex justify-between items-center min-h-[38px] hover:border-gray-400 focus:ring-2 focus:ring-green-500"
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <span className="text-gray-400 text-xs">▼</span>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto">
            <div className="p-2 sticky top-0 bg-white border-b border-gray-100">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ara..."
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                autoFocus
              />
            </div>
            {localOptions.length > 0 ? (
              localOptions.map(opt => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-green-50 ${opt.id === value ? 'bg-green-100 text-green-700' : 'text-gray-700'}`}
                >
                  {opt.name}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">Sonuç bulunamadı</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Recipe Modal Component
function RecipeModal({
  isOpen,
  onClose,
  product,
  currentProductRecipes,
  ingredients,
  recipeFormData,
  setRecipeFormData,
  addIngredientToRecipe,
  updateRecipeItem,
  removeRecipeItem,
  calculateRecipeCost,
  saveRecipe,
  deleteRecipe
}: {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  currentProductRecipes: Recipe[];
  ingredients: any[];
  recipeFormData: any;
  setRecipeFormData: any;
  addIngredientToRecipe: () => void;
  updateRecipeItem: (index: number, field: 'ingredientId' | 'quantity', value: string | number) => void;
  removeRecipeItem: (index: number) => void;
  calculateRecipeCost: () => number;
  saveRecipe: () => void;
  deleteRecipe: (recipeId: string) => void;
}) {
  if (!isOpen || !product) return null;

  const handleSizeChange = (newSize: string) => {
    const existingRecipe = currentProductRecipes.find(r => (r.size || '') === newSize);

    if (existingRecipe) {
      setRecipeFormData({
        size: newSize,
        items: existingRecipe.items.map(item => ({
          ingredientId: item.ingredientId,
          quantity: item.quantity
        }))
      });
    } else {
      setRecipeFormData({
        size: newSize,
        items: [] // Clear items or keep them if you want to copy? User request implies expectation of specific data. Let's clear to avoid confusion.
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {product.name} - Reçete Yönetimi
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Boyut (Opsiyonel)</label>
            <select
              value={recipeFormData.size}
              onChange={(e) => handleSizeChange(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Standart / Tek Boyut</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Hammaddeler</h3>
              <button
                type="button"
                onClick={addIngredientToRecipe}
                className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
              >
                ➕ Hammadde Ekle
              </button>
            </div>

            <div className="space-y-3">
              {recipeFormData.items.map((item: any, index: number) => (
                <div key={index} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg">
                  <SearchableSelect
                    value={item.ingredientId}
                    onChange={(val) => updateRecipeItem(index, 'ingredientId', val)}
                    options={ingredients}
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateRecipeItem(index, 'quantity', parseFloat(e.target.value))}
                    className="w-24 px-3 py-2 border rounded-lg text-sm"
                    placeholder="Miktar"
                  />
                  <span className="text-sm text-gray-600 w-12">
                    {ingredients.find(i => i.id === item.ingredientId)?.unit}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRecipeItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {recipeFormData.items.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">🧮</span>
                  <span className="font-medium text-gray-700">Toplam Maliyet:</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  ₺{calculateRecipeCost().toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={saveRecipe}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Kaydet
            </button>
          </div>

          {/* Delete Button for Current Selection */}
          {(() => {
            const currentRecipe = currentProductRecipes.find(r => (r.size || '') === recipeFormData.size);
            if (currentRecipe) {
              return (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => deleteRecipe(currentRecipe.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                  >
                    🗑️ Bu Reçeteyi Sil
                  </button>
                </div>
              );
            }
            return null;
          })()}

          {currentProductRecipes.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Mevcut Reçeteler (Özet)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                {currentProductRecipes.map((recipe, rIndex) => (
                  <div key={rIndex} className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                    <div className="flex justify-between items-center mb-2 border-b border-gray-200 pb-1">
                      <div className="font-bold text-green-700">
                        {recipe.size ? `${recipe.size} Boy` : 'Standart Boy'}
                      </div>
                      <button
                        onClick={() => deleteRecipe(recipe.id)}
                        className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50"
                        title="Reçeteyi Sil"
                      >
                        Sil 🗑️
                      </button>
                    </div>
                    <ul className="space-y-1">
                      {recipe.items.map((item, iIndex) => {
                        const ingName = ingredients.find(ing => ing.id === item.ingredientId)?.name || 'Bilinmeyen Hammadde';
                        const ingUnit = ingredients.find(ing => ing.id === item.ingredientId)?.unit || '';
                        return (
                          <li key={iIndex} className="flex justify-between text-gray-600">
                            <span>{ingName}</span>
                            <span className="font-medium">{item.quantity} {ingUnit}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div >
  );
}