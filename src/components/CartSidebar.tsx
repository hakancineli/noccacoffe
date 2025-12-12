'use client';

import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { FaTimes, FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import { useEffect, useRef } from 'react';

export default function CartSidebar() {
    const {
        items,
        isCartOpen,
        setIsCartOpen,
        removeFromCart,
        updateQuantity,
        totalPrice
    } = useCart();

    const sidebarRef = useRef<HTMLDivElement>(null);

    // Close sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isCartOpen) {
                setIsCartOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isCartOpen, setIsCartOpen]);

    // Prevent body scroll when cart is open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isCartOpen]);

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
            />

            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-xl font-bold text-gray-800">Sepetim ({items.length})</h2>
                        <button
                            onClick={() => setIsCartOpen(false)}
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                        >
                            <FaTimes className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <p className="text-lg">Sepetiniz boş</p>
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="mt-4 px-6 py-2 bg-nocca-green text-white rounded-full hover:bg-nocca-light-green transition-colors"
                                >
                                    Alışverişe Başla
                                </button>
                            </div>
                        ) : (
                            items.map((item, index) => (
                                <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    {/* Product Image */}
                                    <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded-md overflow-hidden">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200" />
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-800 line-clamp-1">{item.name}</h3>
                                            {item.selectedSize && (
                                                <p className="text-sm text-gray-500">Boyut: {item.selectedSize}</p>
                                            )}
                                            <p className="font-bold text-nocca-green mt-1">₺{item.finalPrice * item.quantity}</p>
                                        </div>

                                        {/* Controls */}
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="flex items-center bg-white border rounded-md">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)}
                                                    className="p-1 px-2 hover:bg-gray-100 text-gray-600"
                                                >
                                                    <FaMinus className="h-3 w-3" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                                                    className="p-1 px-2 hover:bg-gray-100 text-gray-600"
                                                >
                                                    <FaPlus className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id, item.selectedSize)}
                                                className="text-red-400 hover:text-red-500 p-1"
                                                aria-label="Ürünü kaldır"
                                            >
                                                <FaTrash className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="p-4 border-t bg-gray-50">
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Ara Toplam</span>
                                    <span>₺{totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
                                    <span>TOPLAM</span>
                                    <span>₺{totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                            <Link
                                href="/checkout"
                                onClick={() => setIsCartOpen(false)}
                                className="block w-full text-center bg-nocca-green text-white py-3 rounded-lg font-semibold hover:bg-nocca-light-green transition-colors shadow-md hover:shadow-lg"
                            >
                                Siparişi Tamamla
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
