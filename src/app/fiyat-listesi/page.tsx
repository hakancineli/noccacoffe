'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    prices: { size: string; price: number }[] | null;
    imageUrl: string | null;
}

interface CategoryGroup {
    category: string;
    products: Product[];
}

export default function FiyatListesi() {
    const [menuData, setMenuData] = useState<CategoryGroup[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await fetch('/api/menu-display');
                if (res.ok) {
                    const data = await res.json();
                    setMenuData(data);
                }
            } catch (error) {
                console.error('Menu fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchMenu, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const formatPrice = (price: number) => {
        return `₺${price.toLocaleString('tr-TR')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-white text-4xl font-bold animate-pulse">
                    Menü Yükleniyor...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
            {/* Header */}
            <header className="text-center mb-12">
                <div className="flex items-center justify-center gap-6 mb-4">
                    <Image
                        src="/images/logo.png"
                        alt="Nocca Coffee"
                        width={80}
                        height={80}
                        className="rounded-full"
                    />
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                        NOCCA COFFEE
                    </h1>
                </div>
                <p className="text-xl text-gray-400">Menü & Fiyat Listesi</p>
            </header>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {menuData.map((group) => (
                    <div key={group.category} className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-gray-700/50">
                        {/* Category Header */}
                        <h2 className="text-2xl font-bold text-amber-400 mb-6 pb-3 border-b border-amber-400/30">
                            {group.category}
                        </h2>

                        {/* Products */}
                        <div className="space-y-4">
                            {group.products.map((product) => (
                                <div key={product.id} className="flex justify-between items-start gap-4">
                                    <span className="text-lg font-medium text-gray-100 flex-1">
                                        {product.name}
                                    </span>

                                    {/* Pricing */}
                                    {product.prices && product.prices.length > 0 ? (
                                        <div className="flex gap-3 text-right">
                                            {product.prices.map((p) => (
                                                <div key={p.size} className="text-center">
                                                    <span className="text-xs text-gray-400 block">{p.size}</span>
                                                    <span className="text-lg font-bold text-green-400">
                                                        {formatPrice(p.price)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-xl font-bold text-green-400">
                                            {formatPrice(product.price)}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <footer className="mt-12 text-center text-gray-500 text-sm">
                <p>Fiyatlarımız TL cinsindendir ve KDV dahildir.</p>
                <p className="mt-2">© {new Date().getFullYear()} Nocca Coffee - Tüm hakları saklıdır.</p>
            </footer>
        </div>
    );
}
