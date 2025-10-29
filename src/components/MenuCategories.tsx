'use client';

import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const categories = [
  'Tüm Ürünler',
  'Kahveler',
  'Soğuk İçecekler',
  'Sıcak İçecekler',
  'Yiyecekler',
  'Tatlılar'
];

const MenuCategories = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tüm Ürünler');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-12">
      {/* Mobile Dropdown */}
      <div className="md:hidden relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 rounded-lg font-medium text-gray-700"
        >
          {selectedCategory}
          <FaChevronDown className={`transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedCategory === category ? 'bg-starbucks-green text-white hover:bg-starbucks-light-green' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Tabs */}
      <div className="hidden md:flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full whitespace-nowrap ${selectedCategory === category ? 'bg-starbucks-green text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MenuCategories;
