'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaSearch, FaUser, FaTrash, FaCreditCard, FaMoneyBillWave, FaTimes, FaPrint, FaWifi, FaSync, FaClipboardList } from 'react-icons/fa';
import { allMenuItems, categories, MenuItem } from '@/data/menuItems';
import { noccaDB } from '@/lib/db';
import { toast } from 'react-hot-toast';

interface CartItem {
    id: string; // Unique ID for cart item (productID + size)
    productId: number;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    isPorcelain?: boolean;
    category?: string;
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

    const [dbProducts, setDbProducts] = useState<any[]>([]);

    // Split Bill State
    const [showSplitModal, setShowSplitModal] = useState(false);
    const [splitCash, setSplitCash] = useState(0);
    const [splitCard, setSplitCard] = useState(0);
    // Assignments: { cartItemId: { cash: number, card: number } }
    const [itemAssignments, setItemAssignments] = useState<Record<string, { cash: number, card: number }>>({});

    // Recent Orders State
    const [showRecentOrders, setShowRecentOrders] = useState(false);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [recentOrdersLoading, setRecentOrdersLoading] = useState(false);

    // Offline State
    const [isOnline, setIsOnline] = useState(true);
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    // Monitor Online Status
    useEffect(() => {
        const updateOnlineStatus = () => {
            const online = navigator.onLine;
            setIsOnline(online);
            if (online) {
                syncOfflineOrders();
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        setIsOnline(navigator.onLine);

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    // Fetch DB products for stock check
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                await noccaDB.init(); // <--- Ensure DB is ready
                const res = await fetch('/api/admin/products?limit=1000&active=true');
                if (res.ok) {
                    const data = await res.json();
                    const products = data.products || [];
                    setDbProducts(products);
                    // Cache for offline
                    await noccaDB.cacheProducts(products);
                } else {
                    // Try to load from cache if API fails
                    const cached = await noccaDB.getCachedProducts();
                    if (cached.length > 0) {
                        setDbProducts(cached);
                    }
                }
            } catch (error) {
                console.error('POS stock fetch error:', error);
                // Load from cache on network error
                try {
                    const cached = await noccaDB.getCachedProducts();
                    if (cached.length > 0) {
                        setDbProducts(cached);
                    }
                } catch (e) {
                    console.error('Cache load error:', e);
                }
            }
        };
        fetchProducts();
    }, []);

    // Track pending orders count
    useEffect(() => {
        const checkPending = async () => {
            const pending = await noccaDB.getPendingOrders();
            setPendingOrdersCount(pending.length);
        };
        checkPending();
        const interval = setInterval(checkPending, 10000); // Check every 10s
        return () => clearInterval(interval);
    }, []);

    const syncOfflineOrders = useCallback(async () => {
        if (!navigator.onLine || isSyncing) return;

        const pending = await noccaDB.getPendingOrders();
        if (pending.length === 0) return;

        setIsSyncing(true);
        console.log(`Syncing ${pending.length} offline orders...`);

        let errorCount = 0;
        let lastErrorMessage = '';

        for (const order of pending) {
            try {
                const res = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(order.data)
                });

                if (res.ok) {
                    await noccaDB.markOrderSynced(order.tempId);
                } else {
                    errorCount++;
                    const errorData = await res.json().catch(() => ({}));
                    lastErrorMessage = errorData.error || 'Sunucu hatası';
                    console.error('Sync failed for order:', order.tempId, lastErrorMessage);
                }
            } catch (error) {
                errorCount++;
                lastErrorMessage = 'Ağ hatası';
                console.error('Failed to sync order due to network:', order.tempId, error);
            }
        }

        const remaining = await noccaDB.getPendingOrders();
        setPendingOrdersCount(remaining.length);
        setIsSyncing(false);

        if (remaining.length === 0) {
            toast.success('Tüm çevrimdışı siparişler senkronize edildi!');
        } else if (errorCount > 0) {
            toast.error(`${errorCount} sipariş senkronize edilemedi: ${lastErrorMessage}`, { duration: 6000 });
        }
    }, [isSyncing]);

    const getDbProduct = (name: string) => {
        return dbProducts.find(p => p.name === name);
    };

    const getStockInfo = (name: string) => {
        const found = getDbProduct(name);
        // Safety: If not found in DB (sync issue), assume OUT OF STOCK to prevent errors
        if (!found) return { stock: 0, isAvailable: false, hasRecipe: false };
        return {
            stock: found.stock,
            isAvailable: (found.isAvailable ?? true) && (found.isActive !== false),
            hasRecipe: found.hasRecipe ?? false,
            isActive: found.isActive ?? true
        };
    };

    // Categories that are likely hot drinks (needing porcelain option)
    const HOT_DRINK_CATEGORIES = ['Sıcak Kahveler', 'Çaylar', 'Espresso', 'Matchalar'];

    // Categories that don't require recipes (unit-based products or simple stock tracking)
    const UNIT_BASED_CATEGORIES = ['Meşrubatlar', 'Yan Ürünler', 'Kahve Çekirdekleri', 'Çaylar', 'Şuruplar', 'Soslar', 'Püreler', 'Tozlar', 'Sütler', 'Extra'];

    // Categories to hide from POS filter bar (technical/ingredient categories)
    const HIDDEN_CATEGORIES = ['Şuruplar', 'Soslar', 'Püreler', 'Tozlar', 'Sütler', 'Extra'];

    // Filter products - show products with recipes OR unit-based categories with stock
    const filteredProducts = allMenuItems.filter(item => {
        const matchesCategory = activeCategory === 'Tümü' || item.category === activeCategory;
        const matchesSearch = item.name.toLocaleLowerCase('tr').includes(productSearch.toLocaleLowerCase('tr'));
        const stockInfo = getStockInfo(item.name);

        // Unit-based products only need stock, not recipes
        const isUnitBased = UNIT_BASED_CATEGORIES.includes(item.category);
        // A product must be active to be sold
        const canBeSold = (stockInfo.hasRecipe || (isUnitBased && stockInfo.isAvailable)) && (stockInfo as any).isActive !== false;

        return matchesCategory && matchesSearch && canBeSold;
    });

    // Cart Logic
    const handleProductClick = (product: MenuItem) => {
        const stockInfo = getStockInfo(product.name);
        if (!stockInfo.isAvailable) {
            alert(`"${product.name}" için gerekli hammaddeler veya stok tükendi!`);
            return;
        }

        const dbProduct = getDbProduct(product.name);
        const sizes = dbProduct?.prices && Array.isArray(dbProduct.prices) ? dbProduct.prices : product.sizes;

        // If product has sizes, open selection modal
        if (sizes && sizes.length > 0) {
            // Enrich product with DB sizes for the modal
            setSelectedProductForSize({ ...product, sizes });
        } else {
            // Otherwise add directly
            addToCart(product);
        }
    };

    const addToCart = (product: MenuItem, size?: string) => {
        if (lastOrder) setLastOrder(null); // Clear old receipt when starting new order

        const dbProduct = getDbProduct(product.name);
        const dbPrices = dbProduct?.prices && Array.isArray(dbProduct.prices) ? dbProduct.prices : null;

        let price = dbProduct?.price || product.price || 0;

        if (size) {
            const sizes = dbPrices || product.sizes;
            if (sizes) {
                const sizeObj = sizes.find((s: any) => s.size === size);
                if (sizeObj) price = sizeObj.price;
            }
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
            const isHot = HOT_DRINK_CATEGORIES.includes(product.category);

            return [...prev, {
                id: cartItemId,
                productId: dbProduct?.id || product.id,
                name: product.name,
                price,
                quantity: 1,
                size,
                category: product.category,
                isPorcelain: isHot // Default to porcelain for hot drinks
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

    const togglePorcelain = (cartItemId: string) => {
        setCart(prev => prev.map(item =>
            item.id === cartItemId ? { ...item, isPorcelain: !item.isPorcelain } : item
        ));
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

    // Fetch Recent Orders
    const fetchRecentOrders = async () => {
        setRecentOrdersLoading(true);
        try {
            const res = await fetch('/api/admin/orders?limit=10');
            if (res.ok) {
                const data = await res.json();
                setRecentOrders(data.orders || []);
            }
        } catch (error) {
            console.error('Failed to fetch recent orders', error);
            toast.error('Geçmiş siparişler yüklenemedi.');
        } finally {
            setRecentOrdersLoading(false);
        }
    };

    // Auto-load recent orders when modal opens
    useEffect(() => {
        if (showRecentOrders) {
            fetchRecentOrders();
        }
    }, [showRecentOrders]);

    // Auto-print when order is created
    useEffect(() => {
        if (lastOrder) {
            // Small delay to ensure DOM and external images (QR) are updated/loaded
            const timer = setTimeout(() => {
                window.print();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [lastOrder]);

    // Order Creation Logic
    const handleCreateOrder = async (paymentMethod: 'CASH' | 'CREDIT_CARD' | 'SPLIT', customPayments?: any[]) => {
        if (cart.length === 0) return;

        const orderData = {
            items: cart.map(item => ({
                productId: item.productId,
                productName: item.name,
                quantity: item.quantity,
                unitPrice: item.price,
                totalPrice: item.price * item.quantity,
                size: item.size,
                isPorcelain: item.isPorcelain
            })),
            totalAmount: cartTotal,
            finalAmount: finalTotal,
            discountAmount: discountAmount,
            status: 'COMPLETED',
            paymentMethod: paymentMethod === 'SPLIT' ? 'CASH' : paymentMethod,
            payments: customPayments,
            userId: selectedCustomer?.id || null,
            customerName: selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : 'Misafir',
            customerPhone: selectedCustomer?.phone || '',
            customerEmail: selectedCustomer?.email || '',
            notes: 'POS Satışı'
        };

        setProcessingPayment(true);
        try {

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const tempId = `off_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            if (res.ok) {
                const createdOrder = await res.json();

                // Still save for history/resilience if needed, or just proceed
                await noccaDB.saveOrder(orderData, tempId);
                await noccaDB.markOrderSynced(tempId);

                // 1. Set receipt data (triggers useEffect -> print)
                setLastOrder({
                    ...createdOrder,
                    items: cart,
                    payments: customPayments,
                    itemAssignments: customPayments ? itemAssignments : null,
                    totalAmount: cartTotal,
                    finalAmount: finalTotal,
                    discountAmount: discountAmount,
                    customerName: orderData.customerName,
                    creatorName: 'Kasa'
                });

                setCart([]);
                setSelectedCustomer(null);
                setCustomerSearch('');
                setDiscountRate(0);
            } else {
                // SERVER ERROR - Check if it's a validation error (400) or other
                const errorData = await res.json().catch(() => ({}));
                const errorMessage = errorData.error || 'Bilinmeyen bir hata oluştu.';

                if (res.status === 400) {
                    // Validation error - Don't save to offline, show to user
                    toast.error(`Sipariş Hatası: ${errorMessage}`, { duration: 6000 });
                } else {
                    // Actual server error or timeout - Save to offline for later sync
                    await noccaDB.saveOrder(orderData, tempId);
                    setPendingOrdersCount(prev => prev + 1);

                    // Show success to user even if offline
                    setLastOrder({
                        id: tempId,
                        items: cart,
                        payments: customPayments,
                        totalAmount: cartTotal,
                        finalAmount: finalTotal,
                        discountAmount: discountAmount,
                        customerName: orderData.customerName,
                        creatorName: 'Kasa (Offline)',
                        createdAt: new Date().toISOString()
                    });

                    toast.error(`Bağlantı sorunu: ${errorMessage} (Sipariş lokale kaydedildi)`, { duration: 5000 });

                    setCart([]);
                    setSelectedCustomer(null);
                    setCustomerSearch('');
                    setDiscountRate(0);
                }
            }
        } catch (error) {
            console.error('POS Error:', error);
            // NETWORK ERROR - Save to offline
            const tempId = `off_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await noccaDB.saveOrder(orderData, tempId);
            setPendingOrdersCount(prev => prev + 1);

            setLastOrder({
                id: tempId,
                items: cart,
                payments: customPayments,
                totalAmount: cartTotal,
                finalAmount: finalTotal,
                discountAmount: discountAmount,
                customerName: orderData.customerName,
                creatorName: 'Kasa (Offline)',
                createdAt: new Date().toISOString()
            });

            toast.error('İnternet yok: Sipariş lokale kaydedildi.', { duration: 5000 });

            setCart([]);
            setSelectedCustomer(null);
            setCustomerSearch('');
            setDiscountRate(0);
        } finally {
            setProcessingPayment(false);
        }
    };



    return (
        <>
            {/* Screen UI - Hidden when printing */}
            <div className="flex flex-col md:flex-row h-screen h-[100dvh] bg-gray-100 overflow-hidden relative print:hidden">
                {/* Split Bill Modal */}
                {showSplitModal && (
                    <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in">
                        <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full relative">
                            <button
                                onClick={() => setShowSplitModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes size={24} />
                            </button>

                            <h3 className="text-xl font-bold text-gray-800 mb-2">Hesap Böl (Parçalı Ödeme)</h3>
                            <p className="text-gray-500 mb-4 text-sm">Toplam Tutar: <span className="font-bold text-gray-900 text-lg">₺{finalTotal.toFixed(2)}</span></p>

                            {/* Itemized Split Section */}
                            <div className="mb-6 max-h-60 overflow-y-auto border rounded-xl p-2 bg-gray-50 space-y-2">
                                <div className="flex justify-between items-center px-1 mb-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ürünlere Göre Dağıt</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                const newAssignments: Record<string, { cash: number, card: number }> = {};
                                                cart.forEach(item => {
                                                    newAssignments[item.id] = { cash: item.quantity, card: 0 };
                                                });
                                                setItemAssignments(newAssignments);
                                                setSplitCash(Number(finalTotal.toFixed(2)));
                                                setSplitCard(0);
                                            }}
                                            className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full hover:bg-green-200 transition-colors font-bold"
                                        >
                                            TÜMÜ NAKİT
                                        </button>
                                        <button
                                            onClick={() => {
                                                const newAssignments: Record<string, { cash: number, card: number }> = {};
                                                cart.forEach(item => {
                                                    newAssignments[item.id] = { cash: 0, card: item.quantity };
                                                });
                                                setItemAssignments(newAssignments);
                                                setSplitCash(0);
                                                setSplitCard(Number(finalTotal.toFixed(2)));
                                            }}
                                            className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full hover:bg-blue-200 transition-colors font-bold"
                                        >
                                            TÜMÜ KART
                                        </button>
                                    </div>
                                </div>
                                {cart.map(item => {
                                    const assignment = itemAssignments[item.id] || { cash: 0, card: 0 };
                                    const remaining = item.quantity - assignment.cash - assignment.card;
                                    const unitPrice = item.price * (1 - discountRate / 100);

                                    const updateAssignment = (method: 'cash' | 'card', delta: number) => {
                                        const newAssignment = { ...assignment };
                                        if (method === 'cash') {
                                            if (delta > 0 && remaining > 0) newAssignment.cash += 1;
                                            if (delta < 0 && newAssignment.cash > 0) newAssignment.cash -= 1;
                                        } else {
                                            if (delta > 0 && remaining > 0) newAssignment.card += 1;
                                            if (delta < 0 && newAssignment.card > 0) newAssignment.card -= 1;
                                        }

                                        const newItemAssignments = { ...itemAssignments, [item.id]: newAssignment };
                                        setItemAssignments(newItemAssignments);

                                        // Recalculate splitCash and splitCard
                                        let newCash = 0;
                                        let newCard = 0;
                                        cart.forEach(cartItem => {
                                            const asgn = newItemAssignments[cartItem.id] || { cash: 0, card: 0 };
                                            const up = cartItem.price * (1 - discountRate / 100);
                                            newCash += asgn.cash * up;
                                            newCard += asgn.card * up;
                                        });
                                        setSplitCash(Number(newCash.toFixed(2)));
                                        setSplitCard(Number(newCard.toFixed(2)));
                                    };

                                    return (
                                        <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-100 flex flex-col gap-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm leading-tight">{item.name}</p>
                                                    <p className="text-[10px] text-gray-500">{item.size} • ₺{unitPrice.toFixed(2)}/adet</p>
                                                </div>
                                                <div className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                                    {assignment.cash + assignment.card}/{item.quantity}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex items-center justify-between bg-green-50 p-1.5 rounded-lg border border-green-100">
                                                    <div className="flex items-center gap-1.5">
                                                        <FaMoneyBillWave className="text-green-600 text-xs" />
                                                        <span className="text-[11px] font-bold text-green-700">NAKİT</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => updateAssignment('cash', -1)} className="w-5 h-5 flex items-center justify-center rounded-full bg-white text-green-600 border border-green-200 hover:bg-green-100">-</button>
                                                        <span className="text-xs font-bold text-green-800 w-3 text-center">{assignment.cash}</span>
                                                        <button onClick={() => updateAssignment('cash', 1)} className="w-5 h-5 flex items-center justify-center rounded-full bg-white text-green-600 border border-green-200 hover:bg-green-100">+</button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between bg-blue-50 p-1.5 rounded-lg border border-blue-100">
                                                    <div className="flex items-center gap-1.5">
                                                        <FaCreditCard className="text-blue-600 text-xs" />
                                                        <span className="text-[11px] font-bold text-blue-700">KART</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => updateAssignment('card', -1)} className="w-5 h-5 flex items-center justify-center rounded-full bg-white text-blue-600 border border-blue-200 hover:bg-blue-100">-</button>
                                                        <span className="text-xs font-bold text-blue-800 w-3 text-center">{assignment.card}</span>
                                                        <button onClick={() => updateAssignment('card', 1)} className="w-5 h-5 flex items-center justify-center rounded-full bg-white text-blue-600 border border-blue-200 hover:bg-blue-100">+</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nakit Tutar</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500">₺</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={splitCash === 0 ? '' : splitCash}
                                            onChange={(e) => {
                                                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                                setSplitCash(val);
                                                // Auto-calculate remaining for card if possible, but let user type freely for now or implement smart fill
                                            }}
                                            className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-lg border p-2"
                                            placeholder="0.00"
                                        />
                                        <button
                                            onClick={() => {
                                                const remain = Math.max(0, finalTotal - splitCard);
                                                setSplitCash(Number(remain.toFixed(2)));
                                            }}
                                            className="absolute right-2 top-2 text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                                        >
                                            Kalanı Ekle
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kredi Kartı Tutar</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500">₺</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={splitCard === 0 ? '' : splitCard}
                                            onChange={(e) => {
                                                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                                setSplitCard(val);
                                            }}
                                            className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-lg border p-2"
                                            placeholder="0.00"
                                        />
                                        <button
                                            onClick={() => {
                                                const remain = Math.max(0, finalTotal - splitCash);
                                                setSplitCard(Number(remain.toFixed(2)));
                                            }}
                                            className="absolute right-2 top-2 text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                                        >
                                            Kalanı Ekle
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">Girilen Toplam:</span>
                                        <span className={`font-bold ${(splitCash + splitCard).toFixed(2) === finalTotal.toFixed(2) ? 'text-green-600' : 'text-red-500'}`}>
                                            ₺{(splitCash + splitCard).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm text-gray-600">Kalan:</span>
                                        <span className="font-bold text-gray-800">
                                            ₺{Math.max(0, finalTotal - (splitCash + splitCard)).toFixed(2)}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => {
                                            const totalEntered = splitCash + splitCard;
                                            if (Math.abs(totalEntered - finalTotal) > 0.01) {
                                                alert(`Girilen tutar (${totalEntered.toFixed(2)}) toplam tutara (${finalTotal.toFixed(2)}) eşit değil!`);
                                                return;
                                            }

                                            // Construct payments array
                                            const payments = [];
                                            if (splitCash > 0) payments.push({ method: 'CASH', amount: splitCash });
                                            if (splitCard > 0) payments.push({ method: 'CREDIT_CARD', amount: splitCard });

                                            setShowSplitModal(false);
                                            handleCreateOrder('SPLIT', payments);
                                        }}
                                        disabled={Math.abs((splitCash + splitCard) - finalTotal) > 0.01}
                                        className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        ÖDEMEYİ TAMAMLA
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
                <div className="flex-1 md:flex-1 h-[55vh] md:h-full flex flex-col overflow-hidden">
                    {/* Header / Categories */}
                    <div className="bg-white p-2 md:p-4 shadow-sm z-10">
                        <div className="flex justify-between items-center mb-2 md:mb-4">
                            <div className="flex items-center space-x-1 md:space-x-4 flex-wrap gap-y-1">
                                <h1 className="text-lg md:text-2xl font-bold text-gray-800">Kasa Modu</h1>
                                <Link
                                    href="/admin/orders"
                                    className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1 md:py-1.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider bg-gray-800 text-white hover:bg-black transition-all shadow-lg"
                                >
                                    <FaClipboardList className="text-xs" />
                                    <span className="hidden md:inline">Siparişler</span>
                                </Link>
                                <Link
                                    href="/admin/accounting?report=today"
                                    className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1 md:py-1.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-lg"
                                >
                                    <FaMoneyBillWave className="text-xs" />
                                    <span className="hidden md:inline">Rapor</span>
                                </Link>
                                <button
                                    onClick={() => setShowRecentOrders(true)}
                                    className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1 md:py-1.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg"
                                >
                                    <FaSync className="text-xs" />
                                    <span className="hidden md:inline">Son Siparişler</span>
                                </button>
                                <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    <FaWifi />
                                    <span className="hidden md:inline">{isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}</span>
                                </div>
                                {pendingOrdersCount > 0 && (
                                    <button
                                        onClick={syncOfflineOrders}
                                        disabled={isSyncing || !isOnline}
                                        className={`flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1 md:py-1.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider bg-orange-500 text-white hover:bg-orange-600 transition-all shadow-lg ${isSyncing ? 'animate-pulse' : ''}`}
                                    >
                                        <FaSync className={isSyncing ? 'animate-spin' : ''} />
                                        <span>{pendingOrdersCount}</span>
                                    </button>
                                )}
                            </div>
                            <div className="hidden md:block text-sm text-gray-500" suppressHydrationWarning>
                                {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white px-2 md:px-4 pb-2 md:pb-4 shadow-sm z-10 border-t border-gray-100">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-2 md:top-3 text-nocca-green text-sm" />
                            <input
                                type="text"
                                placeholder="Ürün Ara..."
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                className="w-full pl-8 md:pl-10 pr-4 py-1.5 md:py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none bg-gray-50 transition-all font-medium text-gray-800 placeholder-gray-400 text-sm"
                            />
                        </div>

                        <div className="flex space-x-1 md:space-x-2 overflow-x-auto pb-1 md:pb-2 scrollbar-hide mt-1 md:mt-2">
                            {categories
                                .filter(cat => !HIDDEN_CATEGORIES.includes(cat))
                                .map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-2 md:px-4 py-1 md:py-2 rounded-full whitespace-nowrap font-medium text-xs md:text-sm transition-colors ${activeCategory === cat
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
                    <div className="flex-1 overflow-y-auto p-2 md:p-4">
                        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
                            {filteredProducts.map(item => {
                                const stockInfo = getStockInfo(item.name);
                                const isOutOfStock = !stockInfo.isAvailable;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleProductClick(item)}
                                        disabled={isOutOfStock}
                                        className={`bg-white p-1.5 md:p-3 rounded-lg shadow hover:shadow-md transition-all text-left flex flex-col h-full active:scale-95 border border-transparent hover:border-nocca-light-green relative ${isOutOfStock ? 'opacity-70 grayscale' : ''}`}
                                    >
                                        {isOutOfStock && (
                                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-10 flex justify-center pointer-events-none">
                                                <span className="bg-red-600 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 md:py-1 rounded shadow-lg transform -rotate-12 border border-white uppercase tracking-tighter">
                                                    TÜKENDİ
                                                </span>
                                            </div>
                                        )}
                                        <div className="relative w-full h-16 md:h-32 mb-1 md:mb-2 rounded-md overflow-hidden bg-gray-50">
                                            {(() => {
                                                const dbProduct = getDbProduct(item.name);
                                                const imgSource = dbProduct?.imageUrl || item.image;

                                                if (imgSource) {
                                                    return (
                                                        <Image
                                                            src={imgSource}
                                                            alt={item.name}
                                                            fill
                                                            sizes="(max-width: 768px) 33vw, 25vw"
                                                            className="object-contain p-0.5 md:p-1"
                                                            unoptimized={imgSource.startsWith('data:')}
                                                        />
                                                    );
                                                }
                                                return <div className="w-full h-full flex items-center justify-center text-[10px] md:text-xs text-gray-400">Resim Yok</div>;
                                            })()}
                                        </div>
                                        <div className="mt-auto">
                                            <h3 className="font-semibold text-gray-800 text-[10px] md:text-sm line-clamp-2 leading-tight">{item.name}</h3>
                                            <div className="flex justify-between items-end mt-0.5 md:mt-1">
                                                <p className="text-nocca-green font-bold text-xs md:text-base">
                                                    {(() => {
                                                        const dbProduct = getDbProduct(item.name);
                                                        const price = dbProduct?.price || item.price;
                                                        const sizes = dbProduct?.prices || item.sizes;
                                                        return price ? `₺${price}` : (sizes?.length > 0 ? `₺${sizes[0].price}` : '-');
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Cart & Checkout */}
                <div className="w-full md:w-96 h-[45vh] md:h-full bg-white shadow-2xl flex flex-col z-20 border-t md:border-t-0 md:border-l border-gray-200">
                    {/* Customer Search */}
                    <div className="p-2 md:p-4 border-b border-gray-100 bg-gray-50">
                        {selectedCustomer ? (
                            <div className="flex items-center justify-between p-2 md:p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center">
                                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-2 md:mr-3">
                                        <FaUser className="text-xs md:text-base" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 text-xs md:text-sm">{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                                        {selectedCustomer.userPoints && (
                                            <p className="text-[10px] text-green-600 font-medium">{selectedCustomer.userPoints.points} Puan ({selectedCustomer.userPoints.tier})</p>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-red-500">
                                    <FaTimes className="text-sm md:text-base" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Müşteri Ara..."
                                    className="w-full pl-8 md:pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nocca-light-green focus:border-transparent text-sm"
                                    value={customerSearch}
                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                />
                                <FaSearch className="absolute left-3 top-2.5 md:top-3.5 text-gray-400 text-sm md:text-base" />

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
                                                className="w-full text-left px-4 py-2 md:py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                                            >
                                                <p className="font-medium text-gray-800 text-sm">{customer.firstName} {customer.lastName}</p>
                                                <p className="text-[10px] md:text-xs text-gray-500">{customer.phone}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-2 md:p-4">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <span className="text-2xl md:text-4xl mb-2">🛒</span>
                                <p className="text-sm md:text-base">Sepet Boş</p>
                            </div>
                        ) : (
                            <div className="space-y-2 md:space-y-3">
                                {cart.map(item => (
                                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-2 rounded border border-gray-100 shadow-sm gap-2">
                                        {/* Product Info & Options */}
                                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                                            <p className="font-semibold text-gray-800 text-xs md:text-sm truncate">{item.name}</p>

                                            <div className="flex flex-wrap items-center gap-2">
                                                {item.size && (
                                                    <span className="text-[10px] text-amber-600 bg-amber-50 font-bold px-1.5 py-0.5 rounded border border-amber-100 uppercase whitespace-nowrap">
                                                        {item.size}
                                                    </span>
                                                )}

                                                {/* Cup Selection - Compact on mobile */}
                                                {HOT_DRINK_CATEGORIES.includes(item.category || '') && (
                                                    <div className="flex shadow-sm rounded-md overflow-hidden shrink-0">
                                                        <button
                                                            onClick={() => setCart(prev => prev.map(p => p.id === item.id ? { ...p, isPorcelain: true } : p))}
                                                            className={`text-[10px] px-2 py-1 flex items-center gap-1 transition-colors ${item.isPorcelain
                                                                ? 'bg-amber-500 text-white font-medium'
                                                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                                            title="Porselen Fincan"
                                                        >
                                                            <span>☕</span>
                                                            <span className="hidden xl:inline">Fincan</span>
                                                        </button>
                                                        <div className="w-[1px] bg-gray-200"></div>
                                                        <button
                                                            onClick={() => setCart(prev => prev.map(p => p.id === item.id ? { ...p, isPorcelain: false } : p))}
                                                            className={`text-[10px] px-2 py-1 flex items-center gap-1 transition-colors ${!item.isPorcelain
                                                                ? 'bg-blue-500 text-white font-medium'
                                                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                                            title="Karton Bardak"
                                                        >
                                                            <span>🥡</span>
                                                            <span className="hidden xl:inline">Karton</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quantity & Price & Actions - Always visible and accessible */}
                                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 mt-1 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-dashed border-gray-100">
                                            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 h-7">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-7 h-full flex items-center justify-center hover:bg-gray-200 text-gray-600 font-bold transition-colors rounded-l-lg"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center text-xs font-bold text-gray-800">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-7 h-full flex items-center justify-center hover:bg-gray-200 text-gray-600 font-bold transition-colors rounded-r-lg"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="text-right min-w-[60px]">
                                                    <p className="font-bold text-gray-800 text-sm">₺{((item.price ?? 0) * (item.quantity ?? 0)).toFixed(0)}</p>
                                                </div>

                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                                    title="Sil"
                                                >
                                                    <FaTrash className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Totals & Payment */}
                    <div className="p-3 md:p-4 bg-white border-t border-gray-200 shadow-inner">

                        {/* Discount Control */}
                        <div className="flex justify-between items-center mb-1 md:mb-2 text-[10px] md:text-xs">
                            <button
                                onClick={() => setShowDiscountInput(!showDiscountInput)}
                                className="font-semibold text-nocca-green hover:underline flex items-center"
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
                                        className="w-12 md:w-16 p-0.5 md:p-1 border border-gray-300 rounded text-right text-[10px] md:text-sm focus:ring-1 focus:ring-green-500"
                                        placeholder="0"
                                    />
                                    <span className="text-gray-600 font-bold">%</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center mb-0.5 md:mb-1">
                            <span className="text-gray-500 text-[10px] md:text-sm">Ara Toplam</span>
                            <span className="font-medium text-gray-700 text-[10px] md:text-sm">₺{(cartTotal ?? 0).toFixed(2)}</span>
                        </div>

                        {discountRate > 0 && (
                            <div className="flex justify-between items-center mb-0.5 md:mb-1 text-red-500 font-medium">
                                <span className="text-[10px] md:text-sm">İskonto (%{discountRate})</span>
                                <span className="text-[10px] md:text-sm">-₺{(discountAmount ?? 0).toFixed(2)}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-2 md:mb-4 pt-1 md:pt-2 border-t border-dashed border-gray-300">
                            <span className="text-gray-800 font-bold text-sm md:text-lg">Genel Toplam</span>
                            <span className="text-lg md:text-2xl font-bold text-gray-900">₺{(finalTotal ?? 0).toFixed(2)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                            <button
                                onClick={() => handleCreateOrder('CASH')}
                                disabled={cart.length === 0 || processingPayment}
                                className="flex flex-col items-center justify-center py-2 md:py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 shadow-lg"
                            >
                                <FaMoneyBillWave className="w-4 h-4 md:w-6 md:h-6 mb-0.5 md:mb-1" />
                                <span className="font-bold text-[10px] md:text-base">NAKİT</span>
                            </button>
                            <button
                                onClick={() => handleCreateOrder('CREDIT_CARD')}
                                disabled={cart.length === 0 || processingPayment}
                                className="flex flex-col items-center justify-center py-2 md:py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg"
                            >
                                <FaCreditCard className="w-4 h-4 md:w-6 md:h-6 mb-0.5 md:mb-1" />
                                <span className="font-bold text-[10px] md:text-base">KREDİ KARTI</span>
                            </button>
                            <button
                                onClick={() => {
                                    setSplitCash(0);
                                    setSplitCard(0);
                                    setItemAssignments({});
                                    setShowSplitModal(true);
                                }}
                                disabled={cart.length === 0 || processingPayment}
                                className="col-span-2 flex items-center justify-center py-2 md:py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 shadow-lg mt-1 md:mt-2"
                            >
                                <span className="font-bold text-xs md:text-lg">⚖️ HESAP BÖL</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders Modal */}
            {showRecentOrders && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in print:hidden">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col relative">
                        <button
                            onClick={() => setShowRecentOrders(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <FaTimes size={24} />
                        </button>

                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">Son Siparişler</h3>
                            <button
                                onClick={fetchRecentOrders}
                                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg text-gray-600 flex items-center gap-1"
                            >
                                <FaSync size={12} /> Yenile
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 border rounded-xl">
                            {recentOrdersLoading ? (
                                <div className="flex justify-center items-center h-40">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                </div>
                            ) : recentOrders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                                    <p>Henüz sipariş bulunmuyor.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Tarih</th>
                                            <th className="px-4 py-3 font-semibold">Müşteri</th>
                                            <th className="px-4 py-3 font-semibold text-center">Tutar</th>
                                            <th className="px-4 py-3 font-semibold text-center">Ödeme</th>
                                            <th className="px-4 py-3 font-semibold text-right">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {recentOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                                    {new Date(order.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                    <div className="text-[10px] text-gray-400">#{order.orderNumber?.split('-').pop()}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                                    {order.customerName || 'Misafir'}
                                                    <div className="text-xs text-xs text-gray-400 line-clamp-1">{order.items?.map((i: any) => i.productName).join(', ')}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-bold text-gray-900 text-center">
                                                    ₺{(order.finalAmount || 0).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${order.paymentMethod === 'CASH' ? 'bg-green-100 text-green-700' :
                                                        order.paymentMethod === 'CREDIT_CARD' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-purple-100 text-purple-700'
                                                        }`}>
                                                        {order.paymentMethod === 'CASH' ? 'NAKİT' :
                                                            order.paymentMethod === 'CREDIT_CARD' ? 'KART' : 'PARÇALI'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => {
                                                            setLastOrder(order); // Triggers print logic via useEffect
                                                            setShowRecentOrders(false); // Close modal
                                                        }}
                                                        className="text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                                                        title="Fiş Yazdır"
                                                    >
                                                        <FaPrint />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
                            <div className="font-bold border-y border-black py-1 mt-1 uppercase">
                                {lastOrder.payments && lastOrder.payments.length > 0 ? (
                                    <div className="space-y-0.5">
                                        <div className="text-[10px] mb-1">ÖDEME DETAYI:</div>
                                        {lastOrder.payments.map((p: any, i: number) => (
                                            <div key={i} className="flex justify-between text-[11px]">
                                                <span>{p.method === 'CASH' ? 'NAKİT' : 'KREDİ KARTI'}</span>
                                                <span>{p.amount.toFixed(2)}₺</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span>ÖDEME: {lastOrder.paymentMethod === 'CREDIT_CARD' ? 'KREDİ KARTI' : 'NAKİT'}</span>
                                )}
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
                                            <div className="font-bold uppercase">
                                                {item.name || item.productName}
                                                {lastOrder.itemAssignments && lastOrder.itemAssignments[item.id] && (
                                                    <span className="text-[9px] ml-1 bg-gray-200 px-1 rounded lowercase">
                                                        ({lastOrder.itemAssignments[item.id].cash > 0 && lastOrder.itemAssignments[item.id].card > 0
                                                            ? 'nakit+kart'
                                                            : lastOrder.itemAssignments[item.id].cash > 0 ? 'nakit' : 'kart'})
                                                    </span>
                                                )}
                                            </div>
                                            {item.size && (
                                                <div className="text-[10px] bg-gray-100 inline-block px-1 font-bold mr-2">
                                                    BOY: {item.size === 'S' ? 'KÜÇÜK' : item.size === 'M' ? 'ORTA' : item.size === 'L' ? 'BÜYÜK' : item.size}
                                                </div>
                                            )}
                                            {item.isPorcelain !== undefined && (
                                                <div className="text-[10px] bg-amber-50 inline-block px-1 font-bold">
                                                    {item.isPorcelain ? '☕ FİNCAN' : '🥡 KARTON'}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-2 align-top text-right font-bold whitespace-nowrap">
                                            {((item.price || item.unitPrice || 0) * (item.quantity ?? 0)).toFixed(2)}₺
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
                            <div className="my-2 flex justify-center">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.noccacoffee.com.tr/menu`}
                                    alt="Menu QR"
                                    style={{
                                        width: '40mm',
                                        height: '40mm',
                                        imageRendering: 'pixelated'
                                    }}
                                />
                            </div>

                            <div className="text-base font-black tracking-widest">NOCCA COFFEE</div>
                            <div className="text-[10px] mt-1 italic">Yenibosna Bahçelievler İstanbul</div>
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
