'use client';

import Image from 'next/image';
import { FaArrowRight } from 'react-icons/fa';

const Hero = () => {
  return (
    <div className="relative">
      {/* Full-width image gallery without gaps */}
      <div className="w-full">
        <div className="flex">
          {[1, 2, 3].map((num) => (
            <div key={num} className="relative w-1/3 h-[60vh] min-h-[400px]">
              <Image
                src={`/images/hero/ part${num}.jpg`}
                alt={`NOCCA COFFEE ${num}. Bölüm`}
                fill
                className="object-cover w-full h-full"
                quality={90}
                priority={num === 1}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Content section */}
      <div className="bg-[#704d39] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Yeni Lezzetler Sizi Bekliyor
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              NOCCA COFFEE'nin özel lezzetlerini keşfedin ve favori içeceğinizi bulun.
            </p>
            <button className="bg-white text-[#704d39] font-semibold py-3 px-8 rounded-full hover:bg-gray-100 transition duration-300 flex items-center mx-auto">
              Hemen Keşfet <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Featured Products */}
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-starbucks-light-green mb-6">Öne Çıkan Ürünler</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Pumpkin Spice Latte', price: '₺65,90', image: '/images/product1.jpg' },
              { name: 'Caramel Macchiato', price: '₺59,90', image: '/images/product2.jpg' },
              { name: 'Cold Brew', price: '₺49,90', image: '/images/product3.jpg' },
              { name: 'Matcha Latte', price: '₺55,90', image: '/images/product4.jpg' },
            ].map((product, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-48">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">{product.name}</h3>
                  <p className="text-starbucks-green font-bold mt-2">{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
