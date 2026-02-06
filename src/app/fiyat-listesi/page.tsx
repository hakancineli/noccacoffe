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

const CATEGORIES_PER_PAGE = 6;
const ROTATION_INTERVAL = 15000;

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

                    // Specific sorting/grouping to ensure "Tatlılar" (Desserts) doesn't break layout
                    // We want to balance the items.
                    // This is a simple fetch, but we could sort by size here if needed.
                    setMenuData(data);
                }
            } catch (error) {
                console.error('Menu fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
        const interval = setInterval(fetchMenu, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const totalPages = Math.ceil(menuData.length / CATEGORIES_PER_PAGE);

    const goToNextPage = useCallback(() => {
        setCurrentPage((prev) => (prev + 1) % totalPages);
        setProgress(0);
    }, [totalPages]);

    useEffect(() => {
        if (loading || totalPages <= 1) return;

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 100;
                return prev + (100 / (ROTATION_INTERVAL / 100));
            });
        }, 100);

        const rotationTimer = setInterval(goToNextPage, ROTATION_INTERVAL);

        return () => {
            clearInterval(progressInterval);
            clearInterval(rotationTimer);
        };
    }, [loading, totalPages, goToNextPage]);

    const formatPrice = (price: number) => {
        return `₺${price.toLocaleString('tr-TR')}`;
    };

    const startIndex = currentPage * CATEGORIES_PER_PAGE;
    const currentCategories = menuData.slice(startIndex, startIndex + CATEGORIES_PER_PAGE);

    if (loading) {
        return (
            <div className="h-screen bg-black flex items-center justify-center">
                <div className="text-amber-500 text-4xl font-serif animate-pulse">
                    Nocca Coffee Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen overflow-hidden bg-[#121212] text-white flex flex-col relative font-sans selection:bg-amber-500/30">
            {/* Background Texture - Simplified for performance and clarity */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#000] to-black opacity-80 z-0"></div>

            {/* Subtle Gold Frame */}
            <div className="absolute inset-4 border border-amber-600/30 rounded-3xl z-10 pointer-events-none shadow-[inset_0_0_20px_rgba(217,119,6,0.1)]"></div>

            {/* Content Container */}
            <div className="relative z-30 flex flex-col h-full px-6 py-6 pb-8">

                {/* Header - Compact */}
                <header className="flex flex-col items-center justify-center mb-4 flex-shrink-0 h-[10vh]">
                    <div className="relative w-48 h-full">
                        <Image
                            src="/images/nocca-logo-full.png"
                            alt="Nocca Coffee"
                            fill
                            className="object-contain drop-shadow-[0_0_10px_rgba(217,119,6,0.3)]"
                            priority
                        />
                    </div>
                </header>

                {/* Categories Grid - Optimized for 2-row layout */}
                {/* h-[85vh] ensures it takes up most space but leaves room for header/footer */}
                <div className="flex-1 grid grid-cols-3 gap-x-6 gap-y-4 content-start items-start auto-rows-min">
                    {currentCategories.map((group) => (
                        <div
                            key={group.category}
                            className={`flex flex-col animate-fadeIn ${group.products.length > 10 ? 'row-span-2' : ''}`}
                        >
                            {/* Category Title */}
                            <div className="flex items-center gap-2 mb-2 border-b border-amber-600/30 pb-1">
                                <h2 className="text-xl font-serif font-bold text-amber-500 tracking-wider uppercase truncate">
                                    {group.category}
                                </h2>
                            </div>

                            {/* Products List - Tighter spacing */}
                            <div className="space-y-1.5">
                                {group.products.map((product) => (
                                    <div key={product.id} className="flex items-baseline justify-between group">
                                        <div className="flex flex-col mr-2 overflow-hidden">
                                            <span className="text-base font-medium text-gray-200 truncate group-hover:text-amber-100 transition-colors">
                                                {product.name}
                                            </span>
                                        </div>

                                        {/* Price Section */}
                                        <div className="flex-shrink-0">
                                            {product.prices && product.prices.length > 0 ? (
                                                <div className="flex gap-2 text-right">
                                                    {product.prices.map((p) => (
                                                        <span key={p.size} className="text-base font-bold text-amber-500 font-serif">
                                                            {formatPrice(p.price)}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-base font-bold text-amber-500 font-serif">
                                                    {formatPrice(product.price)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Progress Bar & Indicators - Floating at bottom */}
                {totalPages > 1 && (
                    <div className="absolute bottom-0 left-0 w-full h-1">
                        <div
                            className="h-full bg-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.8)] transition-all duration-100 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                {/* Page Indicators */}
                {totalPages > 1 && (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => { setCurrentPage(i); setProgress(0); }}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentPage ? 'bg-amber-500 w-6' : 'bg-gray-700 w-2 hover:bg-gray-500'
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
