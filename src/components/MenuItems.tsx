'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaPlus } from 'react-icons/fa';

// All menu items
const allMenuItems = [
  // Latte
  {
    id: 1,
    name: 'Caffè Latte',
    description: 'Zengin espresso, buğday rengi köpük ile sıcak sütün lezzet dolu buluşması',
    price: '₺45.90',
    category: 'Latte',
    image: '/images/products/CaffeLatte.jpeg',
    isNew: true,
  },
  {
    id: 2,
    name: 'Buzlu Caffè Latte',
    description: 'Espresso, süt ve buzun ferahlatıcı uyumu',
    price: '₺48.90',
    category: 'Latte',
    image: '/images/products/Buzlu Caffè Latte.jpeg',
    isIced: true,
  },
  {
    id: 3,
    name: 'Ristretto Bianco',
    description: 'Yoğun ristretto ve kremsi sütün buluşması',
    price: '₺49.90',
    category: 'Latte',
    image: '/images/products/Ristretto Bianco.jpeg',
  },
  {
    id: 4,
    name: 'Cortado',
    description: 'Eşit miktarda espresso ve ısıtılmış süt',
    price: '₺46.90',
    category: 'Latte',
    image: '/images/products/Cortado.jpeg',
  },
  {
    id: 5,
    name: 'Flat White',
    description: 'İnce köpüklü süt ile yoğun espresso',
    price: '₺49.90',
    category: 'Latte',
    image: '/images/products/Flat White.jpeg',
  },
  // Espresso
  {
    id: 6,
    name: 'Espresso',
    description: 'Zengin ve yoğun lezzetli tek shot espresso',
    price: '₺32.90',
    category: 'Espresso',
    image: '/images/products/Espress.jpeg',
  },
  {
    id: 7,
    name: 'Espresso Macchiato',
    description: 'Espresso üzerine bir kaşık süt köpüğü',
    price: '₺34.90',
    category: 'Espresso',
    image: '/images/products/Espresso Macchiato.jpeg',
  },
  {
    id: 8,
    name: 'Espresso Con Panna',
    description: 'Espresso üzerine krema',
    price: '₺36.90',
    category: 'Espresso',
    image: '/images/products/Espresso Con Panna.jpeg',
  },
  // Mocha
  {
    id: 18,
    name: 'Caramel Macchiato',
    description: 'Vanilya şurubu, taze süt, espresso ve karamel sosu ile hazırlanan nefis içecek',
    price: '₺54.90',
    category: 'Mocha',
    image: '/images/products/caramel-macchiato.jpg',
  },
  {
    id: 9,
    name: 'Caffé Mocha',
    description: 'Espresso, sıcak süt ve çikolata şurubu',
    price: '₺52.90',
    category: 'Mocha',
    image: '/images/products/Caffé Mocha.jpeg',
  },
  {
    id: 10,
    name: 'Buzlu Caffé Mocha',
    description: 'Espresso, soğuk süt, çikolata şurubu ve buz',
    price: '₺54.90',
    category: 'Mocha',
    image: '/images/products/Buzlu Caffé Mocha.jpeg',
    isIced: true,
  },
  {
    id: 11,
    name: 'White Chocolate Mocha',
    description: 'Beyaz çikolata sosu, espresso ve süt',
    price: '₺54.90',
    category: 'Mocha',
    image: '/images/products/White Chocolate Mocha .jpeg',
  },
  {
    id: 12,
    name: 'Buzlu White Chocolate Mocha',
    description: 'Beyaz çikolata sosu, espresso, soğuk süt ve buz',
    price: '₺56.90',
    category: 'Mocha',
    image: '/images/products/Buzlu White Chocolate Mocha.jpeg',
    isIced: true,
  },
  // Soğuk İçecekler
  {
    id: 19,
    name: 'Cold Brew',
    description: 'Soğuk demleme yöntemiyle hazırlanan yumuşak içimli kahve',
    price: '₺44.90',
    category: 'Soğuk İçecekler',
    image: '/images/products/cold-brew.jpg',
  },
  {
    id: 13,
    name: 'Iced Americano',
    description: 'Espresso ve buzun mükemmel uyumu',
    price: '₺38.90',
    category: 'Soğuk İçecekler',
    image: '/images/products/iced-americano.jpg',
    isIced: true,
  },
  {
    id: 14,
    name: 'Iced Spanish Latte',
    description: 'Espresso, süt ve tatlı yoğunlaştırılmış süt',
    price: '₺52.90',
    category: 'Soğuk İçecekler',
    image: '/images/products/Iced Spanish Latte.jpeg',
    isIced: true,
  },
  {
    id: 15,
    name: 'Iced Matcha Latte',
    description: 'Japon matcha çayı ve süt',
    price: '₺48.90',
    category: 'Soğuk İçecekler',
    image: '/images/products/Iced Matcha Latte.jpeg',
    isIced: true,
  },
  // Tatlılar
  {
    id: 16,
    name: 'Çikolatalı Cookie',
    description: 'Yumuşak dokusu ve bol çikolata parçalı kurabiye',
    price: '₺28.90',
    category: 'Tatlılar',
    image: '/images/products/cikolatali-cookie.jpg',
  },
  {
    id: 17,
    name: 'Brownie',
    description: 'Zengin çikolatalı, fındıklı nefis brownie',
    price: '₺42.90',
    category: 'Tatlılar',
    image: '/images/products/brownie.jpg',
  },
];

// Categories for the filter
const menuCategories = [
  {
    id: 'all',
    name: 'Tüm Ürünler',
    items: allMenuItems,
  },
  {
    id: 'latte',
    name: 'Latte',
    items: allMenuItems.filter(item => item.category === 'Latte'),
  },
  {
    id: 'espresso',
    name: 'Espresso',
    items: allMenuItems.filter(item => item.category === 'Espresso'),
  },
  {
    id: 'mocha',
    name: 'Mocha',
    items: allMenuItems.filter(item => item.category === 'Mocha'),
  },
  {
    id: 'iced-drinks',
    name: 'Soğuk İçecekler',
    items: allMenuItems.filter(item => item.category === 'Soğuk İçecekler'),
  },
  {
    id: 'treats',
    name: 'Tatlılar',
    items: allMenuItems.filter(item => item.category === 'Tatlılar'),
  }
];

const MenuItems = () => {
  const [activeCategory, setActiveCategory] = useState(menuCategories[0].id);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="space-y-12">
      {/* Mobile Category Tabs */}
      <div className="mb-12 md:hidden">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 rounded-lg font-medium text-gray-700"
        >
          {menuCategories.find(cat => cat.id === activeCategory)?.name}
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
            {menuCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  activeCategory === category.id
                    ? 'bg-nocca-green text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Category Tabs */}
      <div className="hidden md:block mb-12">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {menuCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-colors ${
                activeCategory === category.id
                  ? 'bg-nocca-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {menuCategories
          .find((category) => category.id === activeCategory)
          ?.items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className={`relative h-64 ${
                item.name === 'Caffé Mocha' ? 'bg-[#1e3932]' : 
                item.name === 'Iced Spanish Latte' ? 'bg-[#00362e]' : 
                'bg-gray-100'
              }`}>
                {item.image ? (
                  <div className={`relative w-full h-full ${
                    item.name === 'Caffé Mocha' ? 'p-4' :
                    item.name === 'White Chocolate Mocha' ? 'p-6' :
                    item.name === 'Iced Spanish Latte' ? 'p-0 overflow-hidden' : ''
                  }`}>
                  <div className="relative w-full h-full">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      quality={95}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={`${
                        item.name === 'Caffé Mocha' ? 'object-contain' :
                        item.name === 'Iced Spanish Latte' ? 'object-contain scale-125' :
                        item.name === 'Buzlu Caffè Latte' || item.name === 'Buzlu Caffé Mocha' || item.name === 'Buzlu White Chocolate Mocha' ||
                        item.name === 'Iced Americano' || item.name === 'Iced Spanish Latte' || item.name === 'Iced Matcha Latte'
                          ? 'object-cover scale-110' : 'object-cover'
                      }`}
                      style={item.name === 'Iced Spanish Latte' ? { position: 'absolute' } : {}}
                      priority={item.id <= 6 || item.name.includes('Buzlu') || item.name.includes('Iced')}
                      unoptimized={item.name.includes('Buzlu') || item.name.includes('Iced')}
                    />
                  </div>
                </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span>Resim Yükleniyor</span>
                  </div>
                )}
                {item.isNew && (
                  <div className="absolute top-2 right-2 bg-nocca-green text-white text-xs font-bold px-2 py-1 rounded-full">
                    YENİ
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <span className="text-nocca-green font-bold">{item.price}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {menuCategories.find(cat => cat.items.some(i => i.id === item.id))?.name}
                  </span>
                  <button 
                    className="bg-nocca-green text-white p-2 rounded-full hover:bg-nocca-light-green transition-colors"
                    aria-label={`${item.name} sepete ekle`}
                  >
                    <FaPlus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default MenuItems;
