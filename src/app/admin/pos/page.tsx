'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaSearch, FaUser, FaTrash, FaCreditCard, FaMoneyBillWave, FaTimes } from 'react-icons/fa';
import { allMenuItems, categories, MenuItem } from '@/data/menuItems';

interface CartItem {
    id: string; // Unique ID for cart item (productID + size)
    productId: number;
    name: string;
    price: number;
    quantity: number;
    size?: string;
}

interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    userPoints?: {
        points: number;
        tier: string;
    };
}

export default function POSPage() {
    // State
    const [activeCategory, setActiveCategory] = useState('Tümü');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerSearch, setCustomerSearch] = useState('');
    const [searchResults, setSearchResults] = useState<Customer[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);

    // Filter products
    const filteredProducts = activeCategory === 'Tümü'
        ? allMenuItems
        : allMenuItems.filter(item => item.category === activeCategory);

    // Cart Logic
    const addToCart = (product: MenuItem, size?: string) => {
        let price = product.price || 0;
        if (size && product.sizes) {
            const sizeObj = product.sizes.find(s => s.size === size);
            if (sizeObj) price = sizeObj.price;
        }

        const cartItemId = `${product.id}-${size || 'std'}`;

        setCart(prev => {
            const existing = prev.find(item => item.id === cartItemId);
            if (existing) {
                return prev.map(item =>
                    item.id === cartItemId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                id: cartItemId,
                productId: product.id,
                name: product.name,
                price,
                quantity: 1,
                size
            }];
        });
    };

    const removeFromCart = (cartItemId: string) => {
        setCart(prev => prev.filter(item => item.id !== cartItemId));
    };

    const updateQuantity = (cartItemId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === cartItemId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Customer Search Logic
    useEffect(() => {
        const searchCustomers = async () => {
            if (customerSearch.length < 3) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const res = await fetch(`/api/admin/customers?search=${customerSearch}&limit=5`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data.customers);
                }
            } catch (error) {
                console.error('Customer search failed', error);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(searchCustomers, 500);
        return () => clearTimeout(timeoutId);
    }, [customerSearch]);

    const handleCreateOrder = async (paymentMethod: 'CASH' | 'CREDIT_CARD') => {
        if (cart.length === 0) return;

        setProcessingPayment(true);
        try {
            const orderData = {
                items: cart.map(item => ({
                    productId: item.productId,
                    productName: item.name,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    totalPrice: item.price * item.quantity,
                    size: item.size
                })),
                totalAmount: cartTotal,
                status: 'COMPLETED',
                paymentMethod,
                userId: selectedCustomer?.id || null, // Assign to customer if selected
                customerName: selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : 'Misafir',
                customerPhone: selectedCustomer?.phone || '',
                customerEmail: selectedCustomer?.email || '',
                notes: 'POS Satışı'
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                // Success
                alert('Sipariş başarıyla oluşturuldu!');
                setCart([]);
                setSelectedCustomer(null);
                setCustomerSearch('');
            } else {
                alert('Sipariş oluşturulurken hata oluştu.');
            }
        } catch (error) {
            console.error('POS Error:', error);
            alert('Sistem hatası.');
        } finally {
            setProcessingPayment(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* LEFT: Product Grid */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header / Categories */}
                <div className="bg-white p-4 shadow-sm z-10">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-gray-800">Kasa Modu</h1>
                        <div className="text-sm text-gray-500">
                            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>

                    <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-colors ${activeCategory === cat
                                        ? 'bg-nocca-green text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredProducts.map(item => (
                            <button
                                key={item.id}
                                onClick={() => addToCart(item, item.sizes ? item.sizes[0].size : undefined)}
                                className="bg-white p-3 rounded-lg shadow hover:shadow-md transition-all text-left flex flex-col h-full active:scale-95 border border-transparent hover:border-nocca-light-green"
                            >
                                <div className="relative w-full h-32 mb-2 rounded-md overflow-hidden bg-gray-100">
                                    {item.image ? (
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Resim Yok</div>
                                    )}
                                </div>
                                <div className="mt-auto">
                                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">{item.name}</h3>
                                    <p className="text-nocca-green font-bold mt-1">
                                        {item.price ? `₺${item.price}` : (item.sizes ? `₺${item.sizes[0].price}` : '-')}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT: Cart & Checkout */}
            <div className="w-96 bg-white shadow-2xl flex flex-col h-full z-20 border-l border-gray-200">
                {/* Customer Search */}
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    {selectedCustomer ? (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                                    <FaUser />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                                    {selectedCustomer.userPoints && (
                                        <p className="text-xs text-green-600 font-medium">{selectedCustomer.userPoints.points} Puan ({selectedCustomer.userPoints.tier})</p>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-red-500">
                                <FaTimes />
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Müşteri Ara (Tel / İsim)"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                                value={customerSearch}
                                onChange={(e) => setCustomerSearch(e.target.value)}
                            />
                            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />

                            {/* Search Results Dropdown */}
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-xl rounded-lg border border-gray-100 max-h-60 overflow-y-auto z-50">
                                    {searchResults.map(customer => (
                                        <button
                                            key={customer.id}
                                            onClick={() => {
                                                setSelectedCustomer(customer);
                                                setCustomerSearch('');
                                                setSearchResults([]);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                                        >
                                            <p className="font-medium text-gray-800">{customer.firstName} {customer.lastName}</p>
                                            <p className="text-xs text-gray-500">{customer.phone}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <span className="text-4xl mb-2">🛒</span>
                            <p>Sepet Boş</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cart.map(item => (
                                <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                                        {item.size && <span className="text-xs text-gray-500 bg-gray-100 px-1 rounded">{item.size}</span>}
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center bg-gray-100 rounded">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 hover:bg-gray-200 text-gray-600">-</button>
                                            <span className="px-2 text-sm font-medium">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 hover:bg-gray-200 text-gray-600">+</button>
                                        </div>
                                        <div className="text-right w-16">
                                            <p className="font-bold text-gray-800">₺{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                                            <FaTrash className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Totals & Payment */}
                <div className="p-4 bg-white border-t border-gray-200 shadow-inner">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600 font-medium">Toplam Tutar</span>
                        <span className="text-2xl font-bold text-gray-900">₺{cartTotal.toFixed(2)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleCreateOrder('CASH')}
                            disabled={cart.length === 0 || processingPayment}
                            className="flex flex-col items-center justify-center py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            <FaMoneyBillWave className="w-6 h-6 mb-1" />
                            <span className="font-bold">NAKİT</span>
                        </button>
                        <button
                            onClick={() => handleCreateOrder('CREDIT_CARD')}
                            disabled={cart.length === 0 || processingPayment}
                            className="flex flex-col items-center justify-center py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            <FaCreditCard className="w-6 h-6 mb-1" />
                            <span className="font-bold">KREDİ KARTI</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
