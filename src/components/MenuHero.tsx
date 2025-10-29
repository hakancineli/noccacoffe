'use client';

import Image from 'next/image';

const MenuHero = () => {
  return (
    <div className="relative bg-starbucks-light-green text-white h-64 md:h-96">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-center px-4">
            MENÜ
          </h1>
        </div>
      </div>
    </div>
  );
};

export default MenuHero;
