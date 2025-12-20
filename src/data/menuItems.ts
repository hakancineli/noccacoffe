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
      { size: 'S', price: 145 },
      { size: 'M', price: 155 },
      { size: 'L', price: 165 }
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
      { size: 'S', price: 135 },
      { size: 'M', price: 145 },
      { size: 'L', price: 155 }
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
      { size: 'S', price: 150 },
      { size: 'M', price: 160 },
      { size: 'L', price: 170 }
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
      { size: 'S', price: 170 },
      { size: 'M', price: 180 },
      { size: 'L', price: 190 }
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
      { size: 'S', price: 180 },
      { size: 'M', price: 190 },
      { size: 'L', price: 200 }
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
      { size: 'S', price: 180 },
      { size: 'M', price: 190 },
      { size: 'L', price: 200 }
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
      { size: 'S', price: 180 },
      { size: 'M', price: 190 },
      { size: 'L', price: 200 }
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
      { size: 'S', price: 170 },
      { size: 'M', price: 180 },
      { size: 'L', price: 190 }
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
      { size: 'S', price: 150 },
      { size: 'M', price: 160 },
      { size: 'L', price: 170 }
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
      { size: 'S', price: 165 },
      { size: 'M', price: 175 },
      { size: 'L', price: 185 }
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
      { size: 'S', price: 175 },
      { size: 'M', price: 185 },
      { size: 'L', price: 195 }
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
      { size: 'S', price: 175 },
      { size: 'M', price: 185 },
      { size: 'L', price: 195 }
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
      { size: 'S', price: 165 },
      { size: 'M', price: 175 },
      { size: 'L', price: 185 }
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
      { size: 'S', price: 140 },
      { size: 'M', price: 150 },
      { size: 'L', price: 160 }
    ],
    image: '/images/products/iced-americano.jpg',
  },
  {
    id: 15,
    name: 'Filtre Kahve',
    description: 'Özenle demlenen taze filtre kahve',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 125 },
      { size: 'M', price: 135 },
      { size: 'L', price: 145 }
    ],
    image: '/images/products/cold-brew.jpg',
  },
  {
    id: 16,
    name: 'Latte',
    description: 'Zengin espresso ve sıcak sütün lezzet dolu buluşması',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 140 },
      { size: 'M', price: 150 },
      { size: 'L', price: 160 }
    ],
    image: '/images/products/CaffeLatte.jpeg',
  },
  {
    id: 17,
    name: 'Caramel Latte',
    description: 'Espresso, sıcak süt ve karamel şurubu',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 160 },
      { size: 'M', price: 170 },
      { size: 'L', price: 180 }
    ],
    image: '/images/products/caramel-macchiato.jpg',
  },
  {
    id: 18,
    name: 'Salted Caramel Latte',
    description: 'Tuzlu karamel şurubu ile zenginleştirilmiş latte',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 170 },
      { size: 'M', price: 180 },
      { size: 'L', price: 190 }
    ],
    image: '/images/products/caramel-macchiato.jpg',
  },
  {
    id: 19,
    name: 'Mocha',
    description: 'Espresso, sıcak süt ve çikolata şurubu',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 170 },
      { size: 'M', price: 180 },
      { size: 'L', price: 190 }
    ],
    image: '/images/products/mocha.jpeg',
  },
  {
    id: 20,
    name: 'White Mocha',
    description: 'Espresso, sıcak süt ve beyaz çikolata şurubu',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 180 },
      { size: 'M', price: 190 },
      { size: 'L', price: 200 }
    ],
    image: '/images/products/white-mocha.jpeg',
  },
  {
    id: 21,
    name: 'Caramel Macchiato',
    description: 'Vanilya şurubu, taze süt, espresso ve karamel sosu',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 160 },
      { size: 'M', price: 170 },
      { size: 'L', price: 180 }
    ],
    image: '/images/products/caramel-macchiato.jpg',
  },
  {
    id: 22,
    name: 'Cappuccino',
    description: 'Espresso, sıcak süt ve yoğun süt köpüğü',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 140 },
      { size: 'M', price: 150 },
      { size: 'L', price: 160 }
    ],
    image: '/images/products/CaffeLatte.jpeg',
  },
  {
    id: 23,
    name: 'Chai Tea Latte',
    description: 'Baharatlı chai çayı ve sıcak süt',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 155 },
      { size: 'M', price: 165 },
      { size: 'L', price: 175 }
    ],
    image: '/images/products/Iced Matcha Latte.jpeg',
  },
  {
    id: 24,
    name: 'Toffeenut Latte',
    description: 'Toffeenut şurubu ile tatlandırılmış latte',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 165 },
      { size: 'M', price: 175 },
      { size: 'L', price: 185 }
    ],
    image: '/images/products/caramel-macchiato.jpg',
  },
  {
    id: 25,
    name: 'Chocolate Cookie Latte',
    description: 'Çikolatalı kurabiye aromalı latte',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 165 },
      { size: 'M', price: 175 },
      { size: 'L', price: 185 }
    ],
    image: '/images/products/mocha.jpeg',
  },
  {
    id: 26,
    name: 'Flat White',
    description: 'Çift espresso ve kremsi süt köpüğü',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 155 },
      { size: 'M', price: 165 },
      { size: 'L', price: 175 }
    ],
    image: '/images/products/Flat White.jpeg',
  },
  {
    id: 27,
    name: 'Sıcak Çikolata',
    description: 'Zengin sıcak çikolata ve krema',
    category: 'Sıcak Kahveler',
    sizes: [
      { size: 'S', price: 160 },
      { size: 'M', price: 180 },
      { size: 'L', price: 200 }
    ],
    image: '/images/products/mocha.jpeg',
  },

  // SOĞUK İÇECEKLER (COLD DRINKS)
  {
    id: 28,
    name: 'Cool Lime Fresh',
    description: 'Ferahlatıcı limon ve nane karışımı',
    category: 'Soğuk İçecekler',
    sizes: [
      { size: 'S', price: 165 },
      { size: 'M', price: 175 },
      { size: 'L', price: 185 }
    ],
    image: '/images/products/Iced Matcha Latte.jpeg',
  },
  {
    id: 29,
    name: 'Hibiscus Fresh',
    description: 'Hibiskus çayı ve taze meyve karışımı',
    category: 'Soğuk İçecekler',
    sizes: [
      { size: 'S', price: 165 },
      { size: 'M', price: 175 },
      { size: 'L', price: 185 }
    ],
    image: '/images/products/Iced Matcha Latte.jpeg',
  },
  {
    id: 30,
    name: 'Orange Mango',
    description: 'Portakal ve mango karışımı',
    category: 'Soğuk İçecekler',
    sizes: [
      { size: 'S', price: 175 },
      { size: 'M', price: 185 },
      { size: 'L', price: 195 }
    ],
    image: '/images/products/Iced Spanish Latte.jpeg',
  },
  {
    id: 31,
    name: 'Ored Mocca Special',
    description: 'Özel mocca karışımı',
    category: 'Soğuk İçecekler',
    sizes: [
      { size: 'S', price: 210 },
      { size: 'M', price: 220 },
      { size: 'L', price: 230 }
    ],
    image: '/images/products/buzlu-mocha.jpeg',
  },

  // ESPRESSO BAZLI
  {
    id: 32,
    name: 'Espresso',
    description: 'Yoğun ve sert aromalı klasik espresso',
    category: 'Espresso',
    price: 100,
    image: '/images/products/SBX20190617_Espresso_Single.jpeg',
  },
  {
    id: 33,
    name: 'Double Espresso',
    description: 'Çift shot espresso',
    category: 'Espresso',
    price: 120,
    image: '/images/products/SBX20190617_Espresso_Single.jpeg',
  },
  {
    id: 34,
    name: 'Cortado',
    description: 'Eşit miktarda espresso ve ısıtılmış süt',
    category: 'Espresso',
    price: 135,
    image: '/images/products/Cortado.jpeg',
  },
  {
    id: 35,
    name: 'Espresso Macchiato',
    description: 'Espresso ve süt köpüğü',
    category: 'Espresso',
    price: 120,
    image: '/images/products/Espresso Macchiato.jpeg',
  },
  {
    id: 36,
    name: 'Türk Kahvesi',
    description: 'Geleneksel Türk kahvesi',
    category: 'Espresso',
    price: 100,
    image: '/images/products/Espress.jpeg',
  },
  {
    id: 37,
    name: 'Double Türk Kahvesi',
    description: 'Çift Türk kahvesi',
    category: 'Espresso',
    price: 130,
    image: '/images/products/Espress.jpeg',
  },

  // MILKSHAKE
  {
    id: 38,
    name: 'Chocolate Milkshake',
    description: 'Yoğun çikolatalı milkshake',
    category: 'Milkshake',
    sizes: [
      { size: 'S', price: 180 },
      { size: 'M', price: 190 },
      { size: 'L', price: 200 }
    ],
    image: '/images/products/mocha.jpeg',
  },
  {
    id: 39,
    name: 'Strawberry Milkshake',
    description: 'Taze çilekli milkshake',
    category: 'Milkshake',
    sizes: [
      { size: 'S', price: 180 },
      { size: 'M', price: 190 },
      { size: 'L', price: 200 }
    ],
    image: '/images/products/Iced Spanish Latte.jpeg',
  },
  {
    id: 40,
    name: 'Banana Milkshake',
    description: 'Muzlu milkshake',
    category: 'Milkshake',
    sizes: [
      { size: 'S', price: 180 },
      { size: 'M', price: 190 },
      { size: 'L', price: 200 }
    ],
    image: '/images/products/Iced Spanish Latte.jpeg',
  },
  {
    id: 41,
    name: 'Vanilla Milkshake',
    description: 'Vanilyalı milkshake',
    category: 'Milkshake',
    sizes: [
      { size: 'S', price: 180 },
      { size: 'M', price: 190 },
      { size: 'L', price: 200 }
    ],
    image: '/images/products/white-mocha.jpeg',
  },

  // FRAPPELER (FRAPPUCCINOS)
  {
    id: 42,
    name: 'Caramel Frappuccino',
    description: 'Karamelli buzlu kahve',
    category: 'Frappeler',
    sizes: [
      { size: 'S', price: 180 },
      { size: 'M', price: 190 },
      { size: 'L', price: 200 }
    ],
    image: '/images/products/caramel-macchiato.jpg',
  },
  {
    id: 43,
    name: 'Çikolata Frappuccino',
    description: 'Çikolatalı buzlu kahve',
    category: 'Frappeler',
    sizes: [
      { size: 'S', price: 180 },
      { size: 'M', price: 190 },
      { size: 'L', price: 200 }
    ],
    image: '/images/products/buzlu-mocha.jpeg',
  },
  {
    id: 44,
    name: 'Vanilla Frappuccino',
    description: 'Vanilyalı buzlu kahve',
    category: 'Frappeler',
    sizes: [
      { size: 'S', price: 180 },
      { size: 'M', price: 190 },
      { size: 'L', price: 200 }
    ],
    image: '/images/products/buzlu-white-mocha.jpeg',
  },
  {
    id: 45,
    name: 'Beyaz Çikolata Frappuccino',
    description: 'Beyaz çikolatalı buzlu kahve',
    category: 'Frappeler',
    sizes: [
      { size: 'S', price: 180 },
      { size: 'M', price: 190 },
      { size: 'L', price: 200 }
    ],
    image: '/images/products/Buzlu White Chocolate Mocha.jpeg',
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
    price: 180,
    image: '/images/products/Iced Spanish Latte.jpeg',
  },
  {
    id: 54,
    name: 'Matcha Latte',
    description: 'Japon matcha çayı ve süt',
    category: 'Matchalar',
    price: 170,
    image: '/images/products/Iced Matcha Latte.jpeg',
  },

  // EXTRA
  {
    id: 55,
    name: 'Espresso Shot',
    description: 'Ekstra espresso shot',
    category: 'Extra',
    price: 40,
    image: '/images/products/SBX20190617_Espresso_Single.jpeg',
  },
  {
    id: 56,
    name: 'Ekstra Süt',
    description: 'Ekstra süt ekleme',
    category: 'Extra',
    price: 30,
    image: '/images/products/CaffeLatte.jpeg',
  },
  {
    id: 57,
    name: 'Badem Sütü',
    description: 'Badem sütü ile hazırlama',
    category: 'Extra',
    price: 40,
    image: '/images/products/CaffeLatte.jpeg',
  },
  {
    id: 58,
    name: 'Yulaf Sütü',
    description: 'Yulaf sütü ile hazırlama',
    category: 'Extra',
    price: 40,
    image: '/images/products/CaffeLatte.jpeg',
  },
  {
    id: 59,
    name: 'Şurup',
    description: 'Ekstra şurup ekleme',
    category: 'Extra',
    price: 40,
    image: '/images/products/caramel-macchiato.jpg',
  },
  {
    id: 60,
    name: 'V60/Chemex',
    description: 'Özel demleme yöntemi',
    category: 'Extra',
    price: 180,
    image: '/images/products/cold-brew.jpg',
  },

  // BİTKİ ÇAYLARI (HERBAL TEAS)
  {
    id: 61,
    name: 'Papatya Çayı',
    description: 'Rahatlatıcı papatya çayı',
    category: 'Bitki Çayları',
    price: 160,
    image: '/images/products/Iced Matcha Latte.jpeg',
  },
  {
    id: 62,
    name: 'Kış Çayı',
    description: 'Baharatlı kış çayı',
    category: 'Bitki Çayları',
    price: 160,
    image: '/images/products/Iced Matcha Latte.jpeg',
  },
  {
    id: 63,
    name: 'Kiraz Sapı',
    description: 'Kiraz sapı çayı',
    category: 'Bitki Çayları',
    price: 160,
    image: '/images/products/Iced Matcha Latte.jpeg',
  },
  {
    id: 64,
    name: 'Yeşil Çay',
    description: 'Taze yeşil çay',
    category: 'Bitki Çayları',
    price: 160,
    image: '/images/products/Iced Matcha Latte.jpeg',
  },
  {
    id: 65,
    name: 'Yaseminli Yeşil Çay',
    description: 'Yasemin aromalı yeşil çay',
    category: 'Bitki Çayları',
    price: 180,
    image: '/images/products/Iced Matcha Latte.jpeg',
  },
  {
    id: 66,
    name: 'Hibiscus Çayı',
    description: 'Hibiskus çayı',
    category: 'Bitki Çayları',
    price: 160,
    image: '/images/products/Iced Matcha Latte.jpeg',
  },
  {
    id: 67,
    name: 'Ihlamur',
    description: 'Ihlamur çayı',
    category: 'Bitki Çayları',
    price: 180,
    image: '/images/products/Iced Matcha Latte.jpeg',
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
  { id: 88, name: 'Antep Fıstığı Püresi', description: 'Antep fıstığı püresi', category: 'Püreler', price: 80, image: '/images/products/purees-collection.png' },

  // TOZLAR
  { id: 89, name: 'Vanilya Tozu', description: 'Karışımlar için vanilya tozu', category: 'Tozlar', price: 40, image: '/images/products/extras-collection.png' },
  { id: 90, name: 'Muz Tozu', description: 'Karışımlar için muz tozu', category: 'Tozlar', price: 40, image: '/images/products/extras-collection.png' },
  { id: 91, name: 'Çikolata Tozu', description: 'Karışımlar için çikolata tozu', category: 'Tozlar', price: 40, image: '/images/products/extras-collection.png' },
  { id: 92, name: 'Salep', description: 'Geleneksel salep tozu', category: 'Tozlar', price: 120, image: '/images/products/extras-collection.png' },
  { id: 93, name: 'Sıcak Çikolata Tozu', description: 'Sıcak çikolata karışımı', category: 'Tozlar', price: 120, image: '/images/products/extras-collection.png' },
  { id: 94, name: 'Frappe Tozu', description: 'Frappe tabanı', category: 'Tozlar', price: 50, image: '/images/products/extras-collection.png' },

  // SÜTLER
  { id: 95, name: 'Laktozsuz Süt', description: 'Laktozsuz süt seçeneği', category: 'Sütler', price: 30, image: '/images/products/extras-collection.png' },
  { id: 96, name: 'Normal Süt', description: 'Tam yağlı taze süt', category: 'Sütler', price: 0, image: '/images/products/extras-collection.png' },
  { id: 97, name: 'Badem Sütü', description: 'Bitkisel badem sütü', category: 'Sütler', price: 50, image: '/images/products/extras-collection.png' },
  { id: 98, name: 'Yulaf Sütü', description: 'Bitkisel yulaf sütü', category: 'Sütler', price: 50, image: '/images/products/extras-collection.png' },

  // YAN ÜRÜNLER
  { id: 99, name: 'Lokum', description: 'Kahve yanı geleneksel lokum', category: 'Yan Ürünler', price: 0, image: '/images/products/extras-collection.png' },
  { id: 100, name: 'Kurutulmuş Limon', description: 'Süsleme ve aroma için kurutulmuş limon', category: 'Yan Ürünler', price: 0, image: '/images/products/extras-collection.png' },

  // KAHVE ÇEKİRDEKLERİ
  { id: 101, name: 'Espresso Çekirdeği (250g)', description: 'Nocca özel espresso çekirdeği', category: 'Kahve Çekirdekleri', price: 450, image: '/images/products/coffee-beans-collection.png' },
  { id: 102, name: 'Filtre Kahve Çekirdeği (250g)', description: 'Nocca özel filtre kahve çekirdeği', category: 'Kahve Çekirdekleri', price: 400, image: '/images/products/coffee-beans-collection.png' },
  { id: 103, name: 'Türk Kahvesi Çekirdeği (250g)', description: 'Geleneksel Türk kahvesi çekirdeği', category: 'Kahve Çekirdekleri', price: 350, image: '/images/products/coffee-beans-collection.png' },

  // MEŞRUBATLAR
  { id: 104, name: 'Coca Cola', description: 'Kutu 330ml', category: 'Meşrubatlar', price: 60, image: '/images/products/Coca Cola Kutu 330ml.jpeg' },
  { id: 105, name: 'Kola Turka', description: 'Kutu 330ml', category: 'Meşrubatlar', price: 50, image: '/images/products/kola-turka.jpeg' },
  { id: 106, name: 'Su', description: 'Pet Şişe 0.5L', category: 'Meşrubatlar', price: 20, image: '/images/products/su.jpeg' },
  { id: 107, name: 'Sade Soda', description: 'Maden Suyu', category: 'Meşrubatlar', price: 30, image: '/images/products/beypazari soda.jpeg' },
  { id: 108, name: 'Limonlu Soda', description: 'Meyveli Maden Suyu', category: 'Meşrubatlar', price: 35, image: '/images/products/limonlu soda.jpeg' },
];

// Category list for filtering
export const categories = [
  'Tümü',
  'Soğuk Kahveler',
  'Sıcak Kahveler',
  'Soğuk İçecekler',
  'Espresso',
  'Milkshake',
  'Frappeler',
  'Bubble Tea',
  'Matchalar',
  'Bitki Çayları',
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
