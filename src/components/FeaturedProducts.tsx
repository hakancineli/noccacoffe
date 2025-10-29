'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import Image from 'next/image';
import { allMenuItems } from '@/data/menuItems';

const FeaturedProducts = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
          Öne Çıkan Ürünler
        </h2>
        <div className="relative">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={1.2}
            navigation
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            breakpoints={{
              640: {
                slidesPerView: 2.3,
              },
              768: {
                slidesPerView: 2.8,
              },
              1024: {
                slidesPerView: 4.2,
              },
              1280: {
                slidesPerView: 5,
              },
            }}
            className="pb-2"
          >
            {allMenuItems
              // Filter out duplicate items (like iced versions when hot version exists)
              // But keep Buzlu Caffè Latte and show Caramel Macchiato (not iced version)
              .filter((product, index, self) => {
                // Always include Buzlu Caffè Latte and Buzlu Caffé Mocha
                if (product.name === 'Buzlu Caffè Latte') return true;
                if (product.name === 'Buzlu Caffé Mocha') return true;
                
                // Exclude Iced Caramel Macchiato to show only the regular version
                if (product.name === 'Iced Caramel Macchiato') return false;
                
                // If it's an iced drink, check if there's a non-iced version
                if (product.name.startsWith('Iced ')) {
                  const hotVersion = product.name.replace('Iced ', '');
                  return !self.some(p => p.name === hotVersion);
                }
                // If it's a hot drink, check if there's an iced version
                const icedVersion = `Iced ${product.name}`;
                return !self.some(p => p.name === icedVersion);
              })
              .map((product) => (
              <SwiperSlide key={product.id} className="h-auto">
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col border border-gray-100 flex justify-between">
                  <div className="relative h-48 w-full flex-shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      priority
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{product.name}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2 min-h-[40px]">{product.description}</p>
                    <div className="mt-auto pt-3 border-t border-gray-100">
                      <span className="text-starbucks-green font-bold text-lg">{product.price}</span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
