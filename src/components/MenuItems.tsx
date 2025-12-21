'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaPlus, FaSearch, FaTimes } from 'react-icons/fa';
import { allMenuItems, categories, MenuItem } from '@/data/menuItems';
import { useCart } from '@/contexts/CartContext';

const MenuItems = () => {
  const [activeCategory, setActiveCategory] = useState('Tümü');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<{ [key: number]: string }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();
  const [dbProducts, setDbProducts] = useState<any[]>([]);

  // Fetch DB products for stock check
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/admin/products?limit=1000');
        if (res.ok) {
          const data = await res.json();
          setDbProducts(data.products || []);
        }
      } catch (error) {
        console.error('Menu stock fetch error:', error);
      }
    };
    fetchProducts();
  }, []);

  // Categories that don't require recipes (unit-based products)
  const UNIT_BASED_CATEGORIES = ['Meşrubatlar', 'Yan Ürünler', 'Kahve Çekirdekleri', 'Bitki Çayları'];

  const getAvailability = (item: MenuItem) => {
    // If we haven't fetched yet, assume available to avoid flashing everything as disabled
    if (dbProducts.length === 0) return true;

    const found = dbProducts.find(p => p.name === item.name);
    // If not found in DB but exists in static menu, assume UNAVAILABLE to be safe
    if (!found) return false;

    // Check if it can be sold (Has Recipe OR is Unit Based)
    const hasRecipe = found.hasRecipe ?? false;
    const isUnitBased = UNIT_BASED_CATEGORIES.includes(item.category);
    const canBeSold = hasRecipe || (isUnitBased && (found.isActive !== false));

    // If it can't be sold (no recipe & not unit based), treat as unavailable (Hidden/Disabled)
    if (!canBeSold) return false;

    return found.isAvailable ?? true;
  };

  // Filter items based on active category AND search query
  const filteredItems = allMenuItems.filter(item => {
    const matchesCategory = activeCategory === 'Tümü' || item.category === activeCategory;
    const matchesSearch = searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Visibility Check (Hide invalid items completely)
    if (dbProducts.length > 0) {
      const found = dbProducts.find(p => p.name === item.name);
      if (found) {
        const hasRecipe = found.hasRecipe ?? false;
        const isUnitBased = UNIT_BASED_CATEGORIES.includes(item.category);
        const canBeSold = hasRecipe || (isUnitBased && (found.isActive !== false));
        if (!canBeSold) return false;
      }
    }

    return matchesCategory && matchesSearch;
  });

  // Get price for an item based on selected size
  const getItemPrice = (item: MenuItem) => {
    if (item.price) {
      return `₺${item.price}`;
    }
    if (item.sizes) {
      const selectedSize = selectedSizes[item.id] || item.sizes[0].size;
      const sizeOption = item.sizes.find(s => s.size === selectedSize);
      return sizeOption ? `₺${sizeOption.price}` : '';
    }
    return '';
  };

  // Handle size selection
  const handleSizeSelect = (itemId: number, size: string) => {
    setSelectedSizes(prev => ({
      ...prev,
      [itemId]: size
    }));
  };

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Ürün ara... (örn: Latte, Mocha)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:ring-2 focus:ring-nocca-green focus:border-transparent transition-all text-gray-800 placeholder-gray-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Mobile Category Tabs */}
      <div className="mb-8 md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 rounded-lg font-medium text-gray-700"
        >
          {activeCategory}
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 448 512"
            className={`transition-transform ${isMobileMenuOpen ? 'transform rotate-180' : ''}`}
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path>
          </svg>
        </button>
        {isMobileMenuOpen && (
          <div className="mt-2 space-y-1 p-2 bg-white rounded-lg shadow-lg">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-md ${activeCategory === category
                  ? 'bg-nocca-green text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Category Tabs */}
      <div className="hidden md:block mb-12">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-colors ${activeCategory === category
                ? 'bg-nocca-green text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map((item) => {
          const isAvailable = getAvailability(item);

          return (
            <div key={item.id} className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 ${!isAvailable ? 'opacity-70 grayscale' : ''}`}>
              <div className="relative h-64 bg-gray-100">
                {!isAvailable && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10">
                    <span className="bg-red-600 text-white text-sm font-black px-3 py-1 rounded shadow-lg transform -rotate-12 border-2 border-white uppercase tracking-wider">
                      TÜKENDİ
                    </span>
                  </div>
                )}
                {item.image ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      quality={95}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={`${item.isIced ? 'object-cover scale-110' : 'object-cover'
                        }`}
                      priority={item.id <= 6}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span>Resim Yükleniyor</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <span className="text-nocca-green font-bold whitespace-nowrap ml-2">
                    {getItemPrice(item)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>

                {/* Size Selection */}
                {item.sizes && item.sizes.length > 0 && (
                  <div className="mb-3">
                    <div className="flex gap-2">
                      {item.sizes.map((sizeOption) => (
                        <button
                          key={sizeOption.size}
                          onClick={() => handleSizeSelect(item.id, sizeOption.size)}
                          disabled={!isAvailable}
                          className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${(selectedSizes[item.id] || item.sizes![0].size) === sizeOption.size
                            ? 'bg-nocca-green text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            } ${!isAvailable ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                          {sizeOption.size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {item.category}
                  </span>
                  <button
                    onClick={() => addToCart(item, selectedSizes[item.id] || (item.sizes && item.sizes.length > 0 ? item.sizes[0].size : undefined))}
                    disabled={!isAvailable}
                    className={`bg-nocca-green text-white p-2 rounded-full hover:bg-nocca-light-green transition-colors active:scale-95 transform ${!isAvailable ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : ''}`}
                    aria-label={`${item.name} sepete ekle`}
                  >
                    <FaPlus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No items message */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Bu kategoride henüz ürün bulunmamaktadır.</p>
        </div>
      )}
    </div>
  );
};

export default MenuItems;
