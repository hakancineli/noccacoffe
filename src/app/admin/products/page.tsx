'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  imageUrl?: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  recipes?: Recipe[];
}

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [selectedProductForRecipe, setSelectedProductForRecipe] = useState<Product | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipeFormData, setRecipeFormData] = useState<{
    size: string;
    items: { ingredientId: string; quantity: number }[];
  }>({ size: '', items: [] });
  const [filter, setFilter] = useState({
    category: 'all',
    search: '',
    active: 'true',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, [filter.category, filter.search, filter.active, pagination.page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filter.category !== 'all' && { category: filter.category }),
        ...(filter.search && { search: filter.search }),
        ...(filter.active !== undefined && { active: filter.active }),
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
          isActive: formData.get('isActive') === 'true',
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
        setIngredients(data);
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
    'Kahve',
    'Çay',
    'Tatlı',
    'Atıştırmalık',
    'Sandviç',
    'Salata',
    'İçecek',
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
                    Fiyat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₺{product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.stock}
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
      </main>

      {/* Create Product Modal */}
      {isCreateModalOpen && (
        <ProductModal
          product={null}
          onSubmit={createProduct}
          onClose={() => setIsCreateModalOpen(false)}
          categories={categories}
        />
      )}

      {/* Edit Product Modal */}
      {isModalOpen && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onSubmit={(formData) => updateProduct(selectedProduct.id, formData)}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
          categories={categories}
        />
      )}

      {/* Recipe Modal */}
      <RecipeModal
        isOpen={isRecipeModalOpen}
        onClose={() => {
          setIsRecipeModalOpen(false);
          setSelectedProductForRecipe(null);
          setRecipeFormData({ size: '', items: [] });
        }}
        product={selectedProductForRecipe}
        ingredients={ingredients}
        recipeFormData={recipeFormData}
        setRecipeFormData={setRecipeFormData}
        addIngredientToRecipe={addIngredientToRecipe}
        updateRecipeItem={updateRecipeItem}
        removeRecipeItem={removeRecipeItem}
        calculateRecipeCost={calculateRecipeCost}
        saveRecipe={saveRecipe}
      />
    </div>
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

// Recipe Modal Component
function RecipeModal({
  isOpen,
  onClose,
  product,
  ingredients,
  recipeFormData,
  setRecipeFormData,
  addIngredientToRecipe,
  updateRecipeItem,
  removeRecipeItem,
  calculateRecipeCost,
  saveRecipe
}: {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  ingredients: any[];
  recipeFormData: any;
  setRecipeFormData: any;
  addIngredientToRecipe: () => void;
  updateRecipeItem: (index: number, field: 'ingredientId' | 'quantity', value: string | number) => void;
  removeRecipeItem: (index: number) => void;
  calculateRecipeCost: () => number;
  saveRecipe: () => void;
}) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
        <h2 className="text-2xl font-bold mb-6">
          {product.name} - Reçete Yönetimi
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Boyut (Opsiyonel)</label>
            <select
              value={recipeFormData.size}
              onChange={(e) => setRecipeFormData({ ...recipeFormData, size: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Tüm boyutlar</option>
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

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recipeFormData.items.map((item: any, index: number) => (
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
        </div>
      </div>
    </div>
  );
}