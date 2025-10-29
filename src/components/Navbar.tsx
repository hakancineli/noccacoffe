'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaBars, FaTimes, FaShoppingBag, FaMapMarkerAlt, FaUser } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'MENÜ', href: '/menu' },
    { name: 'KAMPANYALAR', href: '/campaigns' },
    { name: 'KAHVE', href: '/coffee' },
    { name: 'NOCCA REWARDS', href: '/rewards' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center" aria-label="Ana Sayfa">
              <div className="relative w-14 h-14">
                <Image
                  src="/images/logo/noccacoffee.jpeg"
                  alt="NOCCA COFFEE Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="ml-3 text-2xl font-bold text-[#704d39] hidden sm:block">NOCCA COFFEE</span>
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center justify-center flex-1 px-8">
            <div className="flex space-x-2">
              {menuItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className="text-gray-700 hover:text-starbucks-green px-4 py-2 text-base font-medium transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 text-gray-700 hover:text-starbucks-green transition-colors duration-200"
              aria-label="Mağaza Bul"
              title="Mağaza Bul"
            >
              <FaMapMarkerAlt className="h-6 w-6" />
            </button>
            <button 
              className="p-2 text-gray-700 hover:text-starbucks-green transition-colors duration-200"
              aria-label="Hesabım"
              title="Hesabım"
            >
              <FaUser className="h-6 w-6" />
            </button>
            <button 
              className="p-2 text-gray-700 hover:text-starbucks-green relative transition-colors duration-200"
              aria-label="Sepetim"
              title="Sepetim"
            >
              <FaShoppingBag className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-starbucks-green text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-starbucks-green hover:bg-gray-100 focus:outline-none transition-colors duration-200"
              aria-label={isOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
              title={isOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
              aria-expanded={isOpen ? 'true' : 'false'}
            >
              {isOpen ? (
                <FaTimes className="block h-7 w-7" />
              ) : (
                <FaBars className="block h-7 w-7" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1 px-4">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-starbucks-green rounded-md transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
