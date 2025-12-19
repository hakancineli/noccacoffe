'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaSearch, FaUser, FaTrash, FaCreditCard, FaMoneyBillWave, FaTimes, FaPrint } from 'react-icons/fa';
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
    const [lastOrder, setLastOrder] = useState<any>(null); // For Success Modal

    // Size Selection Modal State
    const [selectedProductForSize, setSelectedProductForSize] = useState<MenuItem | null>(null);

    const [productSearch, setProductSearch] = useState('');
    const [discountRate, setDiscountRate] = useState(0);
    const [showDiscountInput, setShowDiscountInput] = useState(false);

    // Filter products
    const filteredProducts = allMenuItems.filter(item => {
        const matchesCategory = activeCategory === 'Tümü' || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(productSearch.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Cart Logic
    const handleProductClick = (product: MenuItem) => {
        // If product has sizes, open selection modal
        if (product.sizes && product.sizes.length > 0) {
            setSelectedProductForSize(product);
        } else {
            // Otherwise add directly
            addToCart(product);
        }
    };

    const addToCart = (product: MenuItem, size?: string) => {
        if (lastOrder) setLastOrder(null); // Clear old receipt when starting new order

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

        // Close modal if open
        setSelectedProductForSize(null);
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
    const discountAmount = cartTotal * (discountRate / 100);
    const finalTotal = cartTotal - discountAmount;

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

    // Auto-print when order is created
    useEffect(() => {
        if (lastOrder) {
            // Small delay to ensure DOM is updated
            const timer = setTimeout(() => {
                window.print();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [lastOrder]);

    // Order Creation Logic
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
                finalAmount: finalTotal,
                discountAmount: discountAmount,
                status: 'PENDING',
                paymentMethod,
                userId: selectedCustomer?.id || null,
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
                const createdOrder = await res.json();

                // 1. Set receipt data (triggers useEffect -> print)
                // API returns minimal data, so we combine it with local state
                setLastOrder({
                    ...createdOrder,
                    items: cart,
                    totalAmount: cartTotal,
                    finalAmount: finalTotal,
                    discountAmount: discountAmount,
                    customerName: orderData.customerName,
                    creatorName: 'Kasa' // Default for now
                });

                // 2. Clear Cart & Reset State immediately (Auto-New Order)
                setCart([]);
                setSelectedCustomer(null);
                setCustomerSearch('');
                setDiscountRate(0);
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
        <>
            {/* Screen UI - Hidden when printing */}
            <div className="flex h-screen bg-gray-100 overflow-hidden relative print:hidden">
                {/* Size Selection Modal */}
                {selectedProductForSize && (
                    <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in">
                        <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full relative">
                            <button
                                onClick={() => setSelectedProductForSize(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes />
                            </button>

                            <h3 className="text-xl font-bold text-gray-800 mb-4">{selectedProductForSize.name}</h3>
                            <p className="text-gray-500 mb-6 text-sm">Lütfen boy seçiniz:</p>

                            <div className="grid grid-cols-1 gap-3">
                                {selectedProductForSize.sizes?.map((size) => (
                                    <button
                                        key={size.size}
                                        onClick={() => addToCart(selectedProductForSize, size.size)}
                                        className="flex justify-between items-center p-4 rounded-xl border-2 border-gray-100 hover:border-nocca-green hover:bg-green-50 transition-all group"
                                    >
                                        <div className="flex items-center">
                                            <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center group-hover:bg-nocca-green group-hover:text-white transition-colors">
                                                {size.size}
                                            </span>
                                            <span className="ml-3 font-medium text-gray-700 group-hover:text-nocca-green">
                                                {size.size === 'S' ? 'Küçük Boy' : size.size === 'M' ? 'Orta Boy' : 'Büyük Boy'}
                                            </span>
                                        </div>
                                        <span className="font-bold text-gray-900">₺{(size.price ?? 0).toFixed(2)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* LEFT: Product Grid */}
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    {/* Header / Categories */}
                    <div className="bg-white p-4 shadow-sm z-10">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-2xl font-bold text-gray-800">Kasa Modu</h1>
                            <div className="text-sm text-gray-500" suppressHydrationWarning>
                                {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white px-4 pb-4 shadow-sm z-10 border-t border-gray-100">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-3 text-nocca-green" />
                            <input
                                type="text"
                                placeholder="Ürün Ara (örn: Latte, Mocha)..."
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none bg-gray-50 transition-all font-medium text-gray-800 placeholder-gray-400 opacity-90 hover:opacity-100" // Styled to match image
                            />
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
                                    onClick={() => handleProductClick(item)}
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
                                                <p className="font-bold text-gray-800">₺{((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}</p>
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

                        {/* Discount Control */}
                        <div className="flex justify-between items-center mb-2">
                            <button
                                onClick={() => setShowDiscountInput(!showDiscountInput)}
                                className="text-xs font-semibold text-nocca-green hover:underline flex items-center"
                            >
                                {showDiscountInput ? 'İskontoyu Kapat' : '+ İskonto Uygula'}
                            </button>
                            {showDiscountInput && (
                                <div className="flex items-center space-x-1 animate-fade-in-right">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={discountRate}
                                        onChange={(e) => {
                                            let val = parseFloat(e.target.value);
                                            if (val > 100) val = 100;
                                            if (val < 0) val = 0;
                                            setDiscountRate(val);
                                        }}
                                        className="w-16 p-1 border border-gray-300 rounded text-right text-sm focus:ring-1 focus:ring-green-500"
                                        placeholder="0"
                                    />
                                    <span className="text-gray-600 text-sm font-bold">%</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-500 text-sm">Ara Toplam</span>
                            <span className="font-medium text-gray-700">₺{(cartTotal ?? 0).toFixed(2)}</span>
                        </div>

                        {discountRate > 0 && (
                            <div className="flex justify-between items-center mb-1 text-red-500 font-medium">
                                <span className="text-sm">İskonto (%{discountRate})</span>
                                <span>-₺{(discountAmount ?? 0).toFixed(2)}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-4 pt-2 border-t border-dashed border-gray-300">
                            <span className="text-gray-800 font-bold text-lg">Genel Toplam</span>
                            <span className="text-2xl font-bold text-gray-900">₺{(finalTotal ?? 0).toFixed(2)}</span>
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

            {/* Print Only Receipt - Visible only when printing */}
            {lastOrder && (
                <div className="hidden print:block absolute top-0 left-0 w-full h-full bg-white z-[9999] p-0 m-0">
                    <style jsx global>{`
                        @media print {
                            body { margin: 0; padding: 0; }
                            @page { margin: 0; size: 80mm 210mm; }
                            .print\\:block { display: block !important; }
                            .print\\:hidden { display: none !important; }
                        }
                    `}</style>
                    <div style={{
                        fontFamily: "'Courier New', Courier, monospace",
                        width: '80mm',
                        margin: '0',
                        padding: '10px 0',
                        fontSize: '13px',
                        lineHeight: '1.2',
                        color: 'black'
                    }}>
                        <div className="text-center mb-4 border-b border-black pb-2">
                            <div className="text-lg font-bold">SİPARİŞ FİŞİ</div>
                            <div className="text-[10px] uppercase font-bold tracking-widest mt-1">Bilgi Amaçlıdır</div>
                        </div>

                        <div className="text-[11px] mb-2 space-y-0.5">
                            <div className="flex justify-between">
                                <span suppressHydrationWarning>Tarih: {new Date().toLocaleDateString('tr-TR')}</span>
                                <span suppressHydrationWarning>{new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div>No: #{lastOrder.orderNumber ? lastOrder.orderNumber.split('-').pop() : '---'}</div>
                            <div className="flex justify-between border-t border-black pt-1 mt-1">
                                <span>Kasiyer: {lastOrder.creatorName || 'Kasa'}</span>
                                <span>Müşteri: {lastOrder.customerName || 'Misafir'}</span>
                            </div>
                            <div className="font-bold border-y border-black py-1 mt-1">
                                ÖDEME: {lastOrder.paymentMethod === 'CREDIT_CARD' ? 'KREDİ KARTI' : 'NAKİT'}
                            </div>
                        </div>

                        <table className="w-full border-collapse mb-2">
                            <thead>
                                <tr className="border-b border-black">
                                    <th className="text-left text-[11px] py-1 w-[30px]">Adet</th>
                                    <th className="text-left text-[11px] py-1">Ürün</th>
                                    <th className="text-right text-[11px] py-1 whitespace-nowrap">Tutar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lastOrder.items.map((item: any, idx: number) => (
                                    <tr key={idx} className="border-b border-gray-100 border-dashed last:border-0">
                                        <td className="py-2 align-top font-bold">{item.quantity}</td>
                                        <td className="py-2 align-top">
                                            <div className="font-bold uppercase">{item.name}</div>
                                            {item.size && (
                                                <div className="text-[10px] bg-gray-100 inline-block px-1 font-bold">
                                                    BOY: {item.size === 'S' ? 'KÜÇÜK' : item.size === 'M' ? 'ORTA' : item.size === 'L' ? 'BÜYÜK' : item.size}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-2 align-top text-right font-bold whitespace-nowrap">
                                            {((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}₺
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="border-t-2 border-black pt-2 mt-1 space-y-1">
                            <div className="flex justify-between text-[11px]">
                                <span>ARA TOPLAM</span>
                                <span>{(lastOrder.totalAmount ?? 0).toFixed(2)}₺</span>
                            </div>
                            {lastOrder.discountAmount > 0 && (
                                <div className="flex justify-between text-[11px] text-black">
                                    <span>İNDİRİM</span>
                                    <span>-{(lastOrder.discountAmount ?? 0).toFixed(2)}₺</span>
                                </div>
                            )}
                            <div className="flex justify-between text-[15px] font-black mt-1 border-t border-black pt-1">
                                <span>GENEL TOPLAM</span>
                                <span>{(typeof lastOrder.finalAmount === 'number' ? lastOrder.finalAmount : parseFloat(lastOrder.finalAmount ?? '0')).toFixed(2)}₺</span>
                            </div>
                        </div>

                        <div className="text-center mt-6 pt-4 border-t border-dashed border-black">
                            <img
                                src="/images/logo/receipt-logo.jpg"
                                alt="NOCCA Logo"
                                style={{
                                    width: '45mm',
                                    margin: '0 auto 10px',
                                    filter: 'grayscale(100%) contrast(1.2) brightness(1.1)',
                                    mixBlendMode: 'multiply'
                                }}
                            />
                            <div className="text-base font-black tracking-widest">NOCCA COFFEE</div>
                            <div className="text-[10px] mt-1 italic">Caddebostan, İstanbul</div>
                            <div className="text-[10px]">www.noccacoffee.com.tr</div>
                            <div className="mt-4 text-[11px] font-bold">* AFİYET OLSUN *</div>
                            <div className="text-[9px] mt-4 opacity-70 italic">Mali değeri yoktur. Teşekkür ederiz.</div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
