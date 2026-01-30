'use client';

import { useState, useEffect, useCallback } from 'react';
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

const CATEGORIES_PER_PAGE = 4; // How many categories to show per page
const ROTATION_INTERVAL = 12000; // 12 seconds per page

export default function FiyatListesi() {
    const [menuData, setMenuData] = useState<CategoryGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [progress, setProgress] = useState(0);

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

    const totalPages = Math.ceil(menuData.length / CATEGORIES_PER_PAGE);

    // Page rotation logic
    const goToNextPage = useCallback(() => {
        setCurrentPage((prev) => (prev + 1) % totalPages);
        setProgress(0);
    }, [totalPages]);

    useEffect(() => {
        if (loading || totalPages <= 1) return;

        // Progress bar update
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 100;
                return prev + (100 / (ROTATION_INTERVAL / 100));
            });
        }, 100);

        // Page rotation
        const rotationTimer = setInterval(goToNextPage, ROTATION_INTERVAL);

        return () => {
            clearInterval(progressInterval);
            clearInterval(rotationTimer);
        };
    }, [loading, totalPages, goToNextPage]);

    const formatPrice = (price: number) => {
        return `₺${price.toLocaleString('tr-TR')}`;
    };

    // Get current page categories
    const startIndex = currentPage * CATEGORIES_PER_PAGE;
    const currentCategories = menuData.slice(startIndex, startIndex + CATEGORIES_PER_PAGE);

    if (loading) {
        return (
            <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-white text-4xl font-bold animate-pulse">
                    Menü Yükleniyor...
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col overflow-hidden">
            {/* Progress bar at very top */}
            <div className="h-1 bg-gray-700 w-full">
                <div
                    className="h-full bg-amber-400 transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Fixed Header */}
            <header className="py-2 bg-[#d4cab8] flex-shrink-0">
                <div className="flex items-center justify-center">
                    <Image
                        src="/images/logo/menubannaer.png"
                        alt="Nocca Coffee & Roastery"
                        width={180}
                        height={70}
                        className="object-contain"
                        priority
                    />
                </div>
            </header>

            {/* Menu Content - Fixed height, no scroll */}
            <div className="flex-1 p-6 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
                    {currentCategories.map((group) => (
                        <div
                            key={group.category}
                            className="bg-gray-800/50 rounded-xl p-5 backdrop-blur-sm border border-gray-700/50 flex flex-col animate-fadeIn"
                        >
                            {/* Category Header */}
                            <h2 className="text-xl font-bold text-amber-400 mb-4 pb-2 border-b border-amber-400/30 flex-shrink-0">
                                {group.category}
                            </h2>

                            {/* Products */}
                            <div className="space-y-2 flex-1 overflow-hidden">
                                {group.products.map((product) => (
                                    <div key={product.id} className="flex justify-between items-start gap-2">
                                        <span className="text-sm font-medium text-gray-100 flex-1 truncate">
                                            {product.name}
                                        </span>

                                        {/* Pricing */}
                                        {product.prices && product.prices.length > 0 ? (
                                            <div className="flex gap-1 text-right flex-shrink-0">
                                                {product.prices.map((p) => (
                                                    <div key={p.size} className="text-center min-w-[40px]">
                                                        <span className="text-[10px] text-gray-400 block">{p.size}</span>
                                                        <span className="text-sm font-bold text-green-400">
                                                            {formatPrice(p.price)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-base font-bold text-green-400 flex-shrink-0">
                                                {formatPrice(product.price)}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Page indicators */}
                <div className="flex justify-center items-center gap-2 mt-4">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => { setCurrentPage(i); setProgress(0); }}
                            className={`w-3 h-3 rounded-full transition-all ${i === currentPage
                                ? 'bg-amber-400 scale-125'
                                : 'bg-gray-600 hover:bg-gray-500'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center text-gray-500 text-xs py-2 bg-gray-900/80 border-t border-gray-700/50">
                <p>Fiyatlarımız TL cinsindendir ve KDV dahildir. © {new Date().getFullYear()} Nocca Coffee</p>
            </footer>

            {/* Fade in animation */}
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
        </div>
    );
}
