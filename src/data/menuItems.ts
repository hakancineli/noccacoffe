export interface MenuItem {
  id: number;
  name: string;
  description: string;
  category: string;
  sizes?: {
    size: string;
    price: number;
  }[];
  price?: number;
  image?: string;
  isIced?: boolean;
}

export const allMenuItems: MenuItem[] = [
  // SOĞUK KAHVELER (ICED COFFEES)
  {
    id: 1,
    name: 'Iced Americano',
    description: 'Espresso ve soğuk suyun ferahlatıcı buluşması',
    category: 'Soğuk Kahveler',
    sizes: [
      { size: 'S', price: 170 },
      { size: 'M', price: 180 },
      { size: 'L', price: 190 }
    ],
    image: '/images/products/iced-americano.jpg',
    isIced: true,
  },
  {
    id: 2,
    name: 'Iced Filtre Kahve',
    description: 'Özenle demlenen filtre kahvenin soğuk versiyonu',
    category: 'Soğuk Kahveler',
    sizes: [
      { size: 'S', price: 160 },
      { size: 'M', price: 170 },
      { size: 'L', price: 180 }
    ],
    image: '/images/products/cold-brew.jpg',
    isIced: true,
  },
  {
    id: 3,
    name: 'Iced Latte',
    description: 'Espresso, süt ve buzun ferahlatıcı uyumu',
    category: 'Soğuk Kahveler',
    sizes: [
      { size: 'S', price: 180 },
      { size: 'M', price: 190 },
      { size: 'L', price: 200 }
    ],
    image: '/images/products/buzlu-latte.jpeg',
    isIced: true,
  },
  {
    id: 4,
    name: 'Iced Caramel Latte',
    description: 'Espresso, süt ve karamel şurubu ile buzlu lezzet',
    category: 'Soğuk Kahveler',
    sizes: [
      { size: 'S', price: 200 },
      { size: 'M', price: 210 },
      { size: 'L', price: 220 }
    ],
    image: '/images/products/caramel-macchiato.jpg',
    isIced: true,
  },
  {
    id: 5,
    name: 'Iced Salted Caramel Latte',
    description: 'Tuzlu karamel şurubu ile zenginleştirilmiş buzlu latte',
    category: 'Soğuk Kahveler',
    sizes: [
      { size: 'S', price: 210 },
      { size: 'M', price: 220 },
      { size: 'L', price: 230 }
    ],
    image: '/images/products/caramel-macchiato.jpg',
    isIced: true,
  },
  {
    id: 6,
    name: 'Iced Mocha',
    description: 'Espresso, süt, çikolata şurubu ve buz',
    category: 'Soğuk Kahveler',
    sizes: [
      { size: 'S', price: 210 },
      { size: 'M', price: 220 },
      { size: 'L', price: 230 }
    ],
    image: '/images/products/buzlu-mocha.jpeg',
    isIced: true,
  },
  {
    id: 7,
    name: 'Iced White Mocha',
    description: 'Espresso, süt, beyaz çikolata şurubu ve buz',
    category: 'Soğuk Kahveler',
    sizes: [
      { size: 'S', price: 220 },
      { size: 'M', price: 230 },
      { size: 'L', price: 240 }
    ],
    image: '/images/products/buzlu-white-mocha.jpeg',
    isIced: true,
  },
  {
    id: 8,
    name: 'Iced Caramel Macchiato',
    description: 'Vanilya şurubu, süt, buz, espresso ve karamel sosu',
    category: 'Soğuk Kahveler',
    sizes: [
      { size: 'S', price: 230 },
      { size: 'M', price: 240 },
      { size: 'L', price: 250 }
    ],
    image: '/images/products/caramel-macchiato.jpg',
    isIced: true,
  },
  {
    id: 9,
    name: 'Iced Cappuccino',
    description: 'Espresso, soğuk süt ve buz ile hafif köpüklü içecek',
    category: 'Soğuk Kahveler',
    sizes: [
      { size: 'S', price: 180 },
      { size: 'M', price: 190 },
      { size: 'L', price: 200 }
    ],
    image: '/images/products/buzlu-latte.jpeg',
    isIced: true,
  },
  {
    id: 10,
    name: 'Iced Chai Tea Latte',
    description: 'Baharatlı chai çayı ve soğuk süt',
    category: 'Soğuk Kahveler',
    sizes: [
      { size: 'S', price: 200 },
      { size: 'M', price: 210 },
      { size: 'L', price: 220 }
    ],
    image: '/images/products/Iced Matcha Latte.jpeg',
    isIced: true,
  },
  {
    id: 11,
    name: 'Iced Toffeenut Latte',
    description: 'Toffeenut şurubu ile tatlandırılmış buzlu latte',
    category: 'Soğuk Kahveler',
    sizes: [
      { size: 'S', price: 200 },
      { size: 'M', price: 210 },
      { size: 'L', price: 220 }
    ],
    image: '/images/products/caramel-macchiato.jpg',
    isIced: true,
  },
  {
    id: 12,
    name: 'Iced Chocolate Cookie Latte',
    description: 'Çikolatalı kurabiye aromalı buzlu latte',
    category: 'Soğuk Kahveler',
    sizes: [
      { size: 'S', price: 200 },
      { size: 'M', price: 210 },
      { size: 'L', price: 220 }
    ],
    image: '/images/products/buzlu-mocha.jpeg',
    isIced: true,
  },
  {
    id: 13,
    name: 'Cold Brew',
    description: 'Soğuk suda 12 saat demlenen yumuşak kahve',
    category: 'Soğuk Kahveler',
    sizes: [
      { size: 'S', price: 175 },
      { size: 'M', price: 185 },
      { size: 'L', price: 195 }
    ],
    image: '/images/products/cold-brew.jpg',
    isIced: true,
  },

  // SICAK KAHVELER (HOT COFFEES)
  {
    id: 14,
    name: 'Americano',
    description: 'Espresso ve sıcak suyun klasik buluşması',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 160 },
      { size: 'M', price: 170 },
      { size: 'L', price: 180 }
    ],
    image: '/images/products/iced-americano.jpg',
  },
  {
    id: 15,
    name: 'Filtre Kahve',
    description: 'Özenle demlenen taze filtre kahve',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 150 },
      { size: 'M', price: 160 },
      { size: 'L', price: 170 }
    ],
    image: '/images/products/cold-brew.jpg',
  },
  {
    id: 16,
    name: 'Latte',
    description: 'Zengin espresso ve sıcak sütün lezzet dolu buluşması',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 170 },
      { size: 'M', price: 180 },
      { size: 'L', price: 190 }
    ],
    image: '/images/products/CaffeLatte.jpeg',
  },
  {
    id: 17,
    name: 'Caramel Latte',
    description: 'Espresso, sıcak süt ve karamel şurubu',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 190 },
      { size: 'M', price: 200 },
      { size: 'L', price: 210 }
    ],
    image: '/images/products/caramel-macchiato.jpg',
  },
  {
    id: 18,
    name: 'Salted Caramel Latte',
    description: 'Tuzlu karamel şurubu ile zenginleştirilmiş latte',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 200 },
      { size: 'M', price: 210 },
      { size: 'L', price: 220 }
    ],
    image: '/images/products/caramel-macchiato.jpg',
  },
  {
    id: 19,
    name: 'Mocha',
    description: 'Espresso, sıcak süt ve çikolata şurubu',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 200 },
      { size: 'M', price: 210 },
      { size: 'L', price: 220 }
    ],
    image: '/images/products/mocha.jpeg',
  },
  {
    id: 20,
    name: 'White Mocha',
    description: 'Espresso, sıcak süt ve beyaz çikolata şurubu',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 210 },
      { size: 'M', price: 220 },
      { size: 'L', price: 230 }
    ],
    image: '/images/products/white-mocha.jpeg',
  },
  {
    id: 21,
    name: 'Caramel Macchiato',
    description: 'Vanilya şurubu, taze süt, espresso ve karamel sosu',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 220 },
      { size: 'M', price: 230 },
      { size: 'L', price: 240 }
    ],
    image: '/images/products/caramel-macchiato.jpg',
  },
  {
    id: 22,
    name: 'Cappuccino',
    description: 'Espresso, sıcak süt ve yoğun süt köpüğü',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 170 },
      { size: 'M', price: 180 },
      { size: 'L', price: 190 }
    ],
    image: '/images/products/CaffeLatte.jpeg',
  },
  {
    id: 23,
    name: 'Chai Tea Latte',
    description: 'Baharatlı chai çayı ve sıcak süt',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 190 },
      { size: 'M', price: 200 },
      { size: 'L', price: 210 }
    ],
    image: '/images/products/Iced Matcha Latte.jpeg',
  },
  {
    id: 24,
    name: 'Toffeenut Latte',
    description: 'Toffeenut şurubu ile tatlandırılmış latte',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 190 },
      { size: 'M', price: 200 },
      { size: 'L', price: 210 }
    ],
    image: '/images/products/caramel-macchiato.jpg',
  },
  {
    id: 25,
    name: 'Chocolate Cookie Latte',
    description: 'Çikolatalı kurabiye aromalı latte',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 190 },
      { size: 'M', price: 200 },
      { size: 'L', price: 210 }
    ],
    image: '/images/products/mocha.jpeg',
  },
  {
    id: 26,
    name: 'Flat White',
    description: 'Çift espresso ve kremsi süt köpüğü',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 185 },
      { size: 'M', price: 195 },
      { size: 'L', price: 205 }
    ],
    image: '/images/products/Flat White.jpeg',
  },
  {
    id: 27,
    name: 'Sıcak Çikolata',
    description: 'Zengin sıcak çikolata ve krema',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 190 },
      { size: 'M', price: 210 },
      { size: 'L', price: 230 }
    ],
    image: '/images/products/mocha.jpeg',
  },
  {
    id: 109,
    name: 'Salep',
    description: 'Tarçın ile servis edilen geleneksel sıcak salep',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 150 },
      { size: 'M', price: 170 },
      { size: 'L', price: 190 }
    ],
    image: '/images/products/Salep Geleneksel salep tozu.jpeg',
  },

  // SOĞUK İÇECEKLER (COLD DRINKS)
  {
    id: 28,
    name: 'Cool Lime Fresh',
    description: 'Ferahlatıcı limon ve nane karışımı',
    category: 'Soğuk İçecekler',
    sizes: [
      { size: 'S', price: 190 },
      { size: 'M', price: 200 },
      { size: 'L', price: 210 }
    ],
    image: '/images/products/Iced Matcha Latte.jpeg',
  },
  {
    id: 29,
    name: 'Hibiscus Fresh',
    description: 'Hibiskus çayı ve taze meyve karışımı',
    category: 'Soğuk İçecekler',
    sizes: [
      { size: 'S', price: 180 },
      { size: 'M', price: 200 },
      { size: 'L', price: 210 }
    ],
    image: '/images/products/Iced Matcha Latte.jpeg',
  },
  {
    id: 30,
    name: 'Orange Mango',
    description: 'Portakal ve mango karışımı',
    category: 'Soğuk İçecekler',
    sizes: [
      { size: 'S', price: 210 },
      { size: 'M', price: 220 },
      { size: 'L', price: 230 }
    ],
    image: '/images/products/Iced Spanish Latte.jpeg',
  },
  {
    id: 31,
    name: 'Ored Mocca Special',
    description: 'Özel mocca karışımı',
    category: 'Soğuk İçecekler',
    sizes: [
      { size: 'S', price: 250 },
      { size: 'M', price: 260 },
      { size: 'L', price: 270 }
    ],
    image: '/images/products/buzlu-mocha.jpeg',
  },

  // ESPRESSO BAZLI
  {
    id: 32,
    name: 'Espresso',
    description: 'Yoğun ve sert aromalı klasik espresso',
    category: 'Espresso',
    price: 120,
    image: '/images/products/SBX20190617_Espresso_Single.jpeg',
  },
  {
    id: 33,
    name: 'Double Espresso',
    description: 'Çift shot espresso',
    category: 'Espresso',
    price: 140,
    image: '/images/products/SBX20190617_Espresso_Single.jpeg',
  },
  {
    id: 34,
    name: 'Cortado',
    description: 'Eşit miktarda espresso ve ısıtılmış süt',
    category: 'Espresso',
    price: 160,
    image: '/images/products/Cortado.jpeg',
  },
  {
    id: 35,
    name: 'Espresso Macchiato',
    description: 'Espresso ve süt köpüğü',
    category: 'Espresso',
    price: 140,
    image: '/images/products/Espresso Macchiato.jpeg',
  },
  {
    id: 36,
    name: 'Türk Kahvesi',
    description: 'Geleneksel Türk kahvesi',
    category: 'Espresso',
    price: 120,
    image: '/images/products/Espress.jpeg',
  },
  {
    id: 37,
    name: 'Double Türk Kahvesi',
    description: 'Çift Türk kahvesi',
    category: 'Espresso',
    price: 150,
    image: '/images/products/Espress.jpeg',
  },

  // MILKSHAKE
  {
    id: 38,
    name: 'Chocolate Milkshake',
    description: 'Yoğun çikolatalı milkshake',
    category: 'Milkshake',
    sizes: [
      { size: 'S', price: 240 },
      { size: 'M', price: 250 },
      { size: 'L', price: 260 }
    ],
    image: '/images/products/mocha.jpeg',
  },
  {
    id: 39,
    name: 'Strawberry Milkshake',
    description: 'Taze çilekli milkshake',
    category: 'Milkshake',
    sizes: [
      { size: 'S', price: 240 },
      { size: 'M', price: 250 },
      { size: 'L', price: 260 }
    ],
    image: '/images/products/Iced Spanish Latte.jpeg',
  },
  {
    id: 40,
    name: 'Banana Milkshake',
    description: 'Muzlu milkshake',
    category: 'Milkshake',
    sizes: [
      { size: 'S', price: 240 },
      { size: 'M', price: 250 },
      { size: 'L', price: 260 }
    ],
    image: '/images/products/Iced Spanish Latte.jpeg',
  },
  {
    id: 41,
    name: 'Vanilla Milkshake',
    description: 'Vanilyalı milkshake',
    category: 'Milkshake',
    sizes: [
      { size: 'S', price: 240 },
      { size: 'M', price: 250 },
      { size: 'L', price: 260 }
    ],
    image: '/images/products/white-mocha.jpeg',
  },

  // FRAPPELER (FRAPPUCCINOS)
  {
    id: 42,
    name: 'Caramel Frappe',
    description: 'Karamelli buzlu kahve',
    category: 'Frappeler',
    sizes: [
      { size: 'S', price: 240 },
      { size: 'M', price: 250 },
      { size: 'L', price: 260 }
    ],
    image: '/images/products/caramel-macchiato.jpg',
  },
  {
    id: 43,
    name: 'Çikolata Frappe',
    description: 'Çikolatalı buzlu kahve',
    category: 'Frappeler',
    sizes: [
      { size: 'S', price: 240 },
      { size: 'M', price: 250 },
      { size: 'L', price: 260 }
    ],
    image: '/images/products/buzlu-mocha.jpeg',
  },
  {
    id: 44,
    name: 'Vanilla Frappe',
    description: 'Vanilyalı buzlu kahve',
    category: 'Frappeler',
    sizes: [
      { size: 'S', price: 240 },
      { size: 'M', price: 250 },
      { size: 'L', price: 260 }
    ],
    image: '/images/products/buzlu-white-mocha.jpeg',
  },
  {
    id: 45,
    name: 'Beyaz Çikolata Frappe',
    description: 'Beyaz çikolatalı buzlu kahve',
    category: 'Frappeler',
    sizes: [
      { size: 'S', price: 240 },
      { size: 'M', price: 250 },
      { size: 'L', price: 260 }
    ],
    image: '/images/products/Beyaz Çikolata Frappuccino.jpeg',
  },

  // BUBBLE TEA
  {
    id: 46,
    name: 'Queen Style Fresh',
    description: 'Özel bubble tea karışımı',
    category: 'Bubble Tea',
    price: 150,
    image: '/images/products/Iced Matcha Latte.jpeg',
  },
  {
    id: 47,
    name: 'Air Lime Fresh',
    description: 'Limonlu bubble tea',
    category: 'Bubble Tea',
    price: 150,
    image: '/images/products/Iced Matcha Latte.jpeg',
  },
  {
    id: 48,
    name: 'Blueorange Fresh',
    description: 'Mavi portakal bubble tea',
    category: 'Bubble Tea',
    price: 150,
    image: '/images/products/Iced Matcha Latte.jpeg',
  },
  {
    id: 49,
    name: 'Coffeebon Milk',
    description: 'Kahveli süt bubble tea',
    category: 'Bubble Tea',
    price: 180,
    image: '/images/products/cold-brew.jpg',
  },
  {
    id: 50,
    name: 'Chai Tea Coffee',
    description: 'Chai çayı ve kahve bubble tea',
    category: 'Bubble Tea',
    price: 210,
    image: '/images/products/Iced Matcha Latte.jpeg',
  },
  {
    id: 51,
    name: 'Coffee Mocha Bubble',
    description: 'Mocha bubble tea',
    category: 'Bubble Tea',
    price: 200,
    image: '/images/products/buzlu-mocha.jpeg',
  },
  {
    id: 52,
    name: 'Coffee Caramel Macchiato Bubble',
    description: 'Karamelli macchiato bubble tea',
    category: 'Bubble Tea',
    price: 220,
    image: '/images/products/caramel-macchiato.jpg',
  },

  // MATCHALAR (MATCHA DRINKS)
  {
    id: 53,
    name: 'Çilekli Matcha Latte',
    description: 'Japon matcha çayı ve çilek',
    category: 'Matchalar',
    sizes: [
      { size: 'S', price: 210 },
      { size: 'M', price: 220 },
      { size: 'L', price: 230 }
    ],
    image: '/images/products/Iced Spanish Latte.jpeg',
  },
  {
    id: 54,
    name: 'Matcha Latte',
    description: 'Japon matcha çayı ve süt',
    category: 'Matchalar',
    sizes: [
      { size: 'S', price: 200 },
      { size: 'M', price: 210 },
      { size: 'L', price: 220 }
    ],
    image: '/images/products/Iced Matcha Latte.jpeg',
  },

  // EXTRA
  {
    id: 55,
    name: 'Espresso Shot',
    description: 'Ekstra espresso shot',
    category: 'Extra',
    price: 50,
    image: '/images/products/SBX20190617_Espresso_Single.jpeg',
  },
  {
    id: 56,
    name: 'Ekstra Süt',
    description: 'Ekstra süt ekleme',
    category: 'Extra',
    price: 40,
    image: '/images/products/CaffeLatte.jpeg',
  },
  {
    id: 57,
    name: 'Badem Sütü',
    description: 'Badem sütü ile hazırlama',
    category: 'Extra',
    price: 50,
    image: '/images/products/CaffeLatte.jpeg',
  },
  {
    id: 58,
    name: 'Yulaf Sütü',
    description: 'Yulaf sütü ile hazırlama',
    category: 'Extra',
    price: 50,
    image: '/images/products/CaffeLatte.jpeg',
  },
  {
    id: 59,
    name: 'Şurup',
    description: 'Ekstra şurup ekleme',
    category: 'Extra',
    price: 50,
    image: '/images/products/caramel-macchiato.jpg',
  },
  {
    id: 60,
    name: 'V60/Chemex',
    description: 'Özel demleme yöntemi',
    category: 'Extra',
    price: 190,
    image: '/images/products/v60-chemex.jpeg',
  },

  // ÇAYLAR
  {
    id: 137,
    name: 'Çay',
    description: 'Demleme taze siyah çay',
    category: 'Çaylar',
    sizes: [
      { size: 'Küçük', price: 60 },
      { size: 'Büyük', price: 80 }
    ],
    image: '/images/products/yaseminli-yesil-cay.jpeg',
  },

  // BİTKİ ÇAYLARI (HERBAL TEAS)
  {
    id: 61,
    name: 'Papatya Çayı',
    description: 'Rahatlatıcı papatya çayı',
    category: 'Çaylar',
    price: 160,
    image: '/images/products/papatya-cayi.jpeg',
  },
  {
    id: 62,
    name: 'Kış Çayı',
    description: 'Baharatlı kış çayı',
    category: 'Çaylar',
    price: 180,
    image: '/images/products/kis-cayi.jpeg',
  },
  {
    id: 63,
    name: 'Kiraz Sapı',
    description: 'Kiraz sapı çayı',
    category: 'Çaylar',
    price: 160,
    image: '/images/products/kiraz-sapi.jpeg',
  },
  {
    id: 64,
    name: 'Yeşil Çay',
    description: 'Taze yeşil çay',
    category: 'Çaylar',
    price: 170,
    image: '/images/products/yesil-cay.jpeg',
  },
  {
    id: 65,
    name: 'Yaseminli Yeşil Çay',
    description: 'Yasemin aromalı yeşil çay',
    category: 'Çaylar',
    price: 200,
    image: '/images/products/yaseminli-yesil-cay.jpeg',
  },
  {
    id: 66,
    name: 'Hibiscus Çayı',
    description: 'Hibiskus çayı',
    category: 'Çaylar',
    price: 180,
    image: '/images/products/hibiscus-cayi.jpeg',
  },
  {
    id: 67,
    name: 'Ihlamur',
    description: 'Ihlamur çayı',
    category: 'Çaylar',
    price: 200,
    image: '/images/products/ihlamur.jpeg',
  },

  // ŞURUPLAR
  { id: 68, name: 'Karamel Şurubu', description: 'Ekstra lezzet için karamel şurubu', category: 'Şuruplar', price: 40, image: '/images/products/syrups-collection.png' },
  { id: 69, name: 'Fındık Şurubu', description: 'Fındık aromalı şurup', category: 'Şuruplar', price: 40, image: '/images/products/findik-surubu.jpeg' },
  { id: 70, name: 'Vanilya Şurubu', description: 'Vanilya aromalı şurup', category: 'Şuruplar', price: 40, image: '/images/products/vanilya-surubu.jpeg' },
  { id: 71, name: 'Toffeenut Şurubu', description: 'Toffeenut aromalı şurup', category: 'Şuruplar', price: 40, image: '/images/products/syrups-collection.png' },
  { id: 72, name: 'Çikolata Şurubu', description: 'Çikolata aromalı şurup', category: 'Şuruplar', price: 40, image: '/images/products/cikolata-surubu.jpeg' },
  { id: 73, name: 'Chai Şurubu', description: 'Chai aromalı şurup', category: 'Şuruplar', price: 40, image: '/images/products/syrups-collection.png' },
  { id: 74, name: 'Beyaz Çikolata Şurubu', description: 'Beyaz çikolata aromalı şurup', category: 'Şuruplar', price: 40, image: '/images/products/syrups-collection.png' },
  { id: 75, name: 'Nar Şurubu', description: 'Nar aromalı şurup', category: 'Şuruplar', price: 40, image: '/images/products/nar-surubu.jpeg' },
  { id: 76, name: 'Menta Şurubu', description: 'Menta aromalı şurup', category: 'Şuruplar', price: 40, image: '/images/products/menta-surubu.jpeg' },
  { id: 77, name: 'Muz Şurubu', description: 'Muz aromalı şurup', category: 'Şuruplar', price: 40, image: '/images/products/syrups-collection.png' },
  { id: 78, name: 'Çilek Şurubu', description: 'Çilek aromalı şurup', category: 'Şuruplar', price: 40, image: '/images/products/syrups-collection.png' },
  { id: 79, name: 'Mint Şurubu', description: 'Nane aromalı şurup', category: 'Şuruplar', price: 40, image: '/images/products/syrups-collection.png' },

  // SOSLAR
  { id: 80, name: 'Karamel Sos', description: 'Zengin karamel sosu', category: 'Soslar', price: 50, image: '/images/products/sauces-collection.png' },
  { id: 81, name: 'Beyaz Çikolata Sos', description: 'Beyaz çikolata sosu', category: 'Soslar', price: 50, image: '/images/products/sauces-collection.png' },
  { id: 82, name: 'Çikolata Sos', description: 'Çikolata sosu', category: 'Soslar', price: 50, image: '/images/products/sauces-collection.png' },
  { id: 83, name: 'Salted Karamel Sos', description: 'Tuzlu karamel sosu', category: 'Soslar', price: 50, image: '/images/products/salted-karamel-sos.jpeg' },

  // PÜRELER
  { id: 84, name: 'Çilek Püresi', description: 'Taze çilek püresi', category: 'Püreler', price: 60, image: '/images/products/purees-collection.png' },
  { id: 85, name: 'Mango Püresi', description: 'Egzotik mango püresi', category: 'Püreler', price: 60, image: '/images/products/purees-collection.png' },
  { id: 86, name: 'Muz Püresi', description: 'Tatlı muz püresi', category: 'Püreler', price: 60, image: '/images/products/purees-collection.png' },
  { id: 87, name: 'Biscoff Püresi', description: 'Biscoff aromalı püre', category: 'Püreler', price: 60, image: '/images/products/biscoff-puresi.jpeg' },
  { id: 88, name: 'Antep Fıstığı Püresi', description: 'Antep fıstığı püresi', category: 'Püreler', price: 80, image: '/images/products/Antep Fıstığı Püresi Antep fıstığı püresi.jpeg' },

  // TOZLAR
  { id: 89, name: 'Vanilya Tozu', description: 'Karışımlar için vanilya tozu', category: 'Tozlar', price: 40, image: '/images/products/Vanilya Tozu Karışımlar için vanilya tozu.jpeg' },
  { id: 90, name: 'Muz Tozu', description: 'Karışımlar için muz tozu', category: 'Tozlar', price: 40, image: '/images/products/Muz Tozu Karışımlar için muz tozu.jpeg' },
  { id: 91, name: 'Çikolata Tozu', description: 'Karışımlar için çikolata tozu', category: 'Tozlar', price: 40, image: '/images/products/Çikolata Tozu Karışımlar için çikolata tozu.jpeg' },
  { id: 93, name: 'Sıcak Çikolata Tozu', description: 'Sıcak çikolata karışımı', category: 'Tozlar', price: 120, image: '/images/products/Sıcak Çikolata Tozu Sıcak çikolata karışımı.jpeg' },
  { id: 94, name: 'Frappe Tozu', description: 'Frappe tabanı', category: 'Tozlar', price: 50, image: '/images/products/Frappe Tozu Frappe tabanı.jpeg' },

  // SÜTLER
  { id: 95, name: 'Laktozsuz Süt', description: 'Laktozsuz süt seçeneği', category: 'Sütler', price: 30, image: '/images/products/Laktozsuz Süt Laktozsuz süt seçeneği.jpeg' },
  { id: 96, name: 'Normal Süt', description: 'Tam yağlı taze süt', category: 'Sütler', price: 0, image: '/images/products/Normal Süt Tam yağlı taze süt.jpeg' },
  { id: 97, name: 'Badem Sütü', description: 'Bitkisel badem sütü', category: 'Sütler', price: 50, image: '/images/products/Badem Sütü Bitkisel badem sütü.jpeg' },
  { id: 98, name: 'Yulaf Sütü', description: 'Bitkisel yulaf sütü', category: 'Sütler', price: 50, image: '/images/products/Yulaf Sütü Bitkisel yulaf sütü.jpeg' },

  // YAN ÜRÜNLER
  { id: 99, name: 'Lokum', description: 'Kahve yanı geleneksel lokum', category: 'Yan Ürünler', price: 0, image: '/images/products/extras-collection.png' },
  { id: 100, name: 'Kurutulmuş Limon', description: 'Süsleme ve aroma için kurutulmuş limon', category: 'Yan Ürünler', price: 0, image: '/images/products/extras-collection.png' },

  // KAHVE ÇEKİRDEKLERİ
  { id: 101, name: 'Espresso Çekirdeği (250g)', description: 'Nocca özel espresso çekirdeği', category: 'Kahve Çekirdekleri', price: 450, image: '/images/products/coffee-beans-collection.png' },
  { id: 102, name: 'Filtre Kahve Çekirdeği (250g)', description: 'Nocca özel filtre kahve çekirdeği', category: 'Kahve Çekirdekleri', price: 400, image: '/images/products/coffee-beans-collection.png' },
  { id: 103, name: 'Türk Kahvesi Çekirdeği (250g)', description: 'Geleneksel Türk kahvesi çekirdeği', category: 'Kahve Çekirdekleri', price: 350, image: '/images/products/coffee-beans-collection.png' },

  // MEŞRUBATLAR
  { id: 104, name: 'Coca Cola', description: 'Kutu 330ml', category: 'Meşrubatlar', price: 90, image: '/images/products/Coca Cola Kutu 330ml.jpeg' },
  { id: 105, name: 'Kola Turka', description: 'Kutu 330ml', category: 'Meşrubatlar', price: 50, image: '/images/products/kola-turka.jpeg' },
  { id: 106, name: 'Su', description: 'Pet Şişe 0.5L', category: 'Meşrubatlar', price: 30, image: '/images/products/su.jpeg' },
  { id: 107, name: 'Sade Soda', description: 'Maden Suyu', category: 'Meşrubatlar', price: 50, image: '/images/products/sade soda.jpeg' },
  { id: 108, name: 'Limonlu Soda', description: 'Meyveli Maden Suyu', category: 'Meşrubatlar', price: 70, image: '/images/products/limonlu soda.jpeg' },
  // TATLILAR
  { id: 110, name: 'San Sebastian', description: 'Meşhur yanık cheesecake', category: 'Tatlılar', price: 250, image: '/images/products/san-sebastian.jpg' },
  { id: 111, name: 'Sade Kruvasan', description: 'Taze pişmiş sade kruvasan', category: 'Tatlılar', price: 90, image: '/images/products/san-sebastian.jpg' },
  { id: 112, name: 'Çikolatalı Kruvasan', description: 'Çikolata dolgulu kruvasan', category: 'Tatlılar', price: 110, image: '/images/products/san-sebastian.jpg' },
  { id: 113, name: 'Çikolata Soslu Kruvasan', description: 'Üzerine çikolata sosu dökülmüş kruvasan', category: 'Tatlılar', price: 120, image: '/images/products/san-sebastian.jpg' },
  { id: 114, name: 'Peynirli Kruvasan', description: 'Peynirli sıcak kruvasan', category: 'Tatlılar', price: 100, image: '/images/products/san-sebastian.jpg' },
  { id: 115, name: 'Fıstıklı Snickers', description: 'Fıstıklı ve karamelli özel tatlı', category: 'Tatlılar', price: 150, image: '/images/products/san-sebastian.jpg' },
  { id: 116, name: 'Orman Meyveli Tart', description: 'Taze orman meyveli tart', category: 'Tatlılar', price: 140, image: '/images/products/san-sebastian.jpg' },
  { id: 117, name: 'Bella Vista', description: 'Özel katmanlı meyveli pasta', category: 'Tatlılar', price: 250, image: '/images/products/san-sebastian.jpg' },
  { id: 118, name: 'Nocca Tatlı', description: 'İmza tatlımız', category: 'Tatlılar', price: 170, image: '/images/products/san-sebastian.jpg' },
  { id: 119, name: 'Paris Brest', description: 'Özel kremalı Paris usulü tatlı', category: 'Tatlılar', price: 250, image: '/images/products/san-sebastian.jpg' },
  { id: 120, name: 'İbiza Muzlu Magnolia', description: 'Muzlu ve bisküvili taze magnolia', category: 'Tatlılar', price: 250, image: '/images/products/san-sebastian.jpg' },
  { id: 121, name: 'Çilekli Magnolia', description: 'Taze çilekli magnolia', category: 'Tatlılar', price: 250, image: '/images/products/san-sebastian.jpg' },
  { id: 122, name: 'Tiramisu Cup', description: 'Bardakta pratik tiramisu lezzeti', category: 'Tatlılar', price: 250, image: '/images/products/san-sebastian.jpg' },
  { id: 123, name: 'Magnum - Kitkat Cup', description: 'Kitkat ve Magnum lezzetli bardak tatlısı', category: 'Tatlılar', price: 250, image: '/images/products/san-sebastian.jpg' },
  { id: 124, name: 'Lotus Cheesecake', description: 'Lotus bisküvili eşsiz cheesecake', category: 'Tatlılar', price: 250, image: '/images/products/san-sebastian.jpg' },
  { id: 125, name: 'Muzlu Rulo', description: 'Yumuşak kekli muzlu rulo pasta', category: 'Tatlılar', price: 250, image: '/images/products/san-sebastian.jpg' },
  { id: 126, name: 'Cookie', description: 'Taze pişmiş dev kurabiye', category: 'Tatlılar', price: 150, image: '/images/products/san-sebastian.jpg' },
  { id: 127, name: 'Dereotlu Poğaça', description: 'Taze dereotlu ev poğaçası', category: 'Tatlılar', price: 100, image: '/images/products/kruvasan.jpg' },
  { id: 128, name: 'Sandviç', description: 'Günlük taze sandviç', category: 'Tatlılar', price: 180, image: '/images/products/kruvasan.jpg' },
  { id: 129, name: 'Saçaklı Poğaça', description: 'Peynirli saçaklı poğaça', category: 'Tatlılar', price: 100, image: '/images/products/kruvasan.jpg' },
  { id: 130, name: 'Çikolatalı San Sebastian', description: 'Çikolata soslu San Sebastian cheesecake', category: 'Tatlılar', price: 250, image: '/images/products/san-sebastian.jpg' },
  { id: 131, name: 'Muzlu Kubbe', description: 'Muzlu kubbe pasta', category: 'Tatlılar', price: 250, image: '/images/products/san-sebastian.jpg' },
  { id: 132, name: 'Fıstıklı Tart', description: 'Antep fıstıklı tart', category: 'Tatlılar', price: 250, image: '/images/products/san-sebastian.jpg' },
  { id: 133, name: 'Yer Fıstıklı Pasta', description: 'Yer fıstıklı lezzet dolu pasta', category: 'Tatlılar', price: 250, image: '/images/products/san-sebastian.jpg' },
  { id: 134, name: 'Latte Mono', description: 'Latte aromalı tek porsiyonluk pasta', category: 'Tatlılar', price: 250, image: '/images/products/san-sebastian.jpg' },
  { id: 135, name: 'Beyaz Çikolatalı Brownie', description: 'Beyaz çikolatalı brownie', category: 'Tatlılar', price: 250, image: '/images/products/san-sebastian.jpg' },
  { id: 136, name: 'Limonlu Cheesecake', description: 'Ferah limonlu cheesecake', category: 'Tatlılar', price: 250, image: '/images/products/san-sebastian.jpg' },
  { id: 138, name: 'Frambuazlı Cheesecake', description: 'Taze frambuazlı cheesecake', category: 'Tatlılar', price: 250, image: '/images/products/san-sebastian.jpg' },
];

// Category list for filtering
export const categories = [
  'Tümü',
  'Tatlılar',
  'Soğuk Kahveler',
  'Sıcak Kahveler',
  'Soğuk İçecekler',
  'Espresso',
  'Milkshake',
  'Frappeler',
  'Bubble Tea',
  'Matchalar',
  'Çaylar',
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
