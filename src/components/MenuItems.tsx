'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaPlus, FaSearch, FaTimes } from 'react-icons/fa';
import { allMenuItems, categories, MenuItem } from '@/data/menuItems';
import { useCart } from '@/contexts/CartContext';
import { AnimatePresence } from 'framer-motion';

const MenuItems = () => {
  const [mainTab, setMainTab] = useState<'icecekler' | 'tatlilar' | 'diger'>('icecekler');
  const [subCategory, setSubCategory] = useState('Tümü');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<{ [key: number]: string }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();

  const MAIN_TABS = [
    { id: 'icecekler', label: 'İçecekler', icon: '☕' },
    { id: 'tatlilar', label: 'Tatlı & Yiyecek', icon: '🍰' },
    { id: 'diger', label: 'Diğer', icon: '🛍️' },
  ] as const;

  const CATEGORY_GROUPS = {
    icecekler: [
      'Tümü', 'Soğuk Kahveler', 'Sıcak Kahveler', 'Espresso Ve Türk Kahvesi',
      'Çaylar', 'Soğuk İçecekler', 'Frappeler', 'Bubble Tea',
      'Matchalar'
    ],
    tatlilar: ['Tümü'], // Sadece tatlılar
    diger: [
      'Tümü', 'Kahve Çekirdekleri', 'Ekstralar', 'Yan Ürünler', 'Püreler', 'Tozlar'
    ]
  };

  // Ana sekme değiştiğinde alt kategoriyi sıfırla
  useEffect(() => {
    setSubCategory('Tümü');
    setIsMobileMenuOpen(false);
  }, [mainTab]);
  const [dbProducts, setDbProducts] = useState<any[]>([]);

  // Fetch DB products for stock check
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=1000');
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
    let matchesCategory = false;

    if (subCategory === 'Tümü') {
      if (mainTab === 'icecekler') {
        matchesCategory = CATEGORY_GROUPS.icecekler.includes(item.category);
      } else if (mainTab === 'tatlilar') {
        // "Tatlılar" kategorisine giren her şeyi göster
        matchesCategory = item.category === 'Tatlılar';
      } else if (mainTab === 'diger') {
        matchesCategory = CATEGORY_GROUPS.diger.includes(item.category);
      }
    } else {
      matchesCategory = item.category === subCategory;
    }

    const matchesSearch = searchQuery === '' ||
      item.name.toLocaleLowerCase('tr').includes(searchQuery.toLocaleLowerCase('tr')) ||
      item.description?.toLocaleLowerCase('tr').includes(searchQuery.toLocaleLowerCase('tr'));

    // Visibility Check (Hide invalid items completely)
    if (dbProducts.length > 0) {
      const found = dbProducts.find(p => p.name === item.name);
      if (found) {
        const hasRecipe = found.hasRecipe ?? false;
        const isUnitBased = UNIT_BASED_CATEGORIES.includes(item.category);
        const canBeSold = hasRecipe || (isUnitBased && (found.isActive !== false));
        if (!canBeSold) return false;
        if (found.isActive === false) return false;
      } else {
        return false; // Not in DB, hide it
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

      {/* Main Tabs (İçecekler / Tatlılar / Diğer) */}
      <div className="flex justify-center mb-8 px-2 sm:px-0">
        <div className="bg-white p-1.5 rounded-[20px] shadow-sm border border-gray-100 flex overflow-x-auto w-full max-w-3xl custom-scrollbar">
          {MAIN_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setMainTab(tab.id as any)}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center min-w-[100px] gap-1 sm:gap-2 py-3 px-2 sm:px-6 rounded-2xl text-xs sm:text-base font-bold transition-all duration-300 ${mainTab === tab.id
                ? 'bg-nocca-green text-white shadow-md transform scale-[1.02]'
                : 'text-gray-500 hover:text-nocca-green hover:bg-green-50'
                }`}
            >
              <span className="text-xl sm:text-2xl mb-1 sm:mb-0">{tab.icon}</span>
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Sub Category Tabs */}
      {mainTab !== 'tatlilar' && CATEGORY_GROUPS[mainTab].length > 1 && (
        <div className="mb-8 md:hidden relative z-30">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full flex justify-between items-center px-5 py-3.5 bg-white border border-gray-200 shadow-sm rounded-xl font-semibold text-gray-700"
          >
            {subCategory}
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 448 512"
              className={`transition-transform duration-300 ${isMobileMenuOpen ? 'transform rotate-180' : ''}`}
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path>
            </svg>
          </button>
          <AnimatePresence>
            {isMobileMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto z-40">
                {CATEGORY_GROUPS[mainTab].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSubCategory(cat);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${subCategory === cat
                      ? 'bg-nocca-green text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Desktop Sub Category Tabs */}
      {mainTab !== 'tatlilar' && CATEGORY_GROUPS[mainTab].length > 1 && (
        <div className="hidden md:flex justify-center mb-12">
          <div className="flex flex-wrap justify-center gap-2.5 max-w-5xl">
            {CATEGORY_GROUPS[mainTab].map((cat) => (
              <button
                key={cat}
                onClick={() => setSubCategory(cat)}
                className={`px-5 py-2.5 rounded-full whitespace-nowrap font-semibold text-sm transition-all duration-300 ${subCategory === cat
                  ? 'bg-gray-800 text-white shadow-md transform scale-105'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-nocca-green hover:text-nocca-green hover:shadow-sm'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map((item) => {
          const isAvailable = getAvailability(item);

          return (
            <div key={item.id} className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col ${!isAvailable ? 'opacity-70 grayscale' : ''}`}>
              <div className="relative h-56 bg-gray-100">
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
                      className={`${item.isIced ? 'object-cover scale-110' : 'object-cover'}`}
                      priority={item.id <= 6}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span>Resim Yükleniyor</span>
                  </div>
                )}
              </div>

              {/* Product Details - Responsive Layout */}
              <div className="p-4 flex-1 flex flex-col gap-3">
                {/* Title & Price Row */}
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight flex-1 min-w-0">
                    {item.name}
                  </h3>
                  <span className="text-nocca-green font-bold whitespace-nowrap text-sm sm:text-base shrink-0">
                    {getItemPrice(item)}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                  {item.description}
                </p>

                {/* Size Selection */}
                {item.sizes && item.sizes.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {item.sizes.map((sizeOption) => (
                      <button
                        key={sizeOption.size}
                        onClick={() => handleSizeSelect(item.id, sizeOption.size)}
                        disabled={!isAvailable}
                        className={`flex-1 min-w-[60px] px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${(selectedSizes[item.id] || item.sizes![0].size) === sizeOption.size
                          ? 'bg-nocca-green text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          } ${!isAvailable ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        {sizeOption.size}
                      </button>
                    ))}
                  </div>
                )}

                {/* Category & Add Button Row */}
                <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500 font-medium">
                    {item.category}
                  </span>
                  <button
                    onClick={() => addToCart(item, selectedSizes[item.id] || (item.sizes && item.sizes.length > 0 ? item.sizes[0].size : undefined))}
                    disabled={!isAvailable}
                    className={`bg-nocca-green text-white p-2.5 rounded-full hover:bg-nocca-light-green transition-all active:scale-95 transform shadow-md ${!isAvailable ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : ''
                      }`}
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
