'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaSearch, FaUser, FaTrash, FaCreditCard, FaMoneyBillWave, FaTimes, FaPrint, FaWifi, FaSync, FaClipboardList, FaFire } from 'react-icons/fa';
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
    image?: string;
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
    const [isBOGOActive, setIsBOGOActive] = useState(false);

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

    // Staff Consumption State
    const [staffMode, setStaffMode] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [allStaff, setAllStaff] = useState<any[]>([]);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [isStaffSubmitting, setIsStaffSubmitting] = useState(false);
    const [staffPaymentMethod, setStaffPaymentMethod] = useState<'CASH' | 'CREDIT_CARD'>('CASH');
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

    // Prayer Alert State
    const [prayerTimings, setPrayerTimings] = useState<Record<string, string> | null>(null);
    const [activePrayerAlert, setActivePrayerAlert] = useState<string | null>(null);

    // Closing Announcement State
    const [showClosingAlert, setShowClosingAlert] = useState(false);
    const [lastAnnouncedTime, setLastAnnouncedTime] = useState<string | null>(null);

    // Staff Performance PIN Logic
    const [showStaffPinModal, setShowStaffPinModal] = useState(false);
    const [enteredPin, setEnteredPin] = useState('');
    const [pendingOrderArgs, setPendingOrderArgs] = useState<{ method: 'CASH' | 'CREDIT_CARD' | 'SPLIT', payments?: any[] } | null>(null);
    const [isPinError, setIsPinError] = useState(false);

    // Order Confirmation State
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmingMethod, setConfirmingMethod] = useState<'CASH' | 'CREDIT_CARD' | 'SPLIT' | null>(null);

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
                const res = await fetch('/api/admin/products?limit=1000');
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

        // Fetch Staff
        const fetchStaff = async () => {
            try {
                const res = await fetch('/api/admin/staff');
                if (res.ok) {
                    const data = await res.json();
                    setAllStaff(Array.isArray(data) ? data : (data.staff || []));
                }
            } catch (error) {
                console.error('Staff fetch error:', error);
            }
        };

        // Fetch current user role
        const fetchMe = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setCurrentUserRole(data.role || 'BARISTA');
                }
            } catch (error) {
                console.error('Fetch me error:', error);
            }
        };

        // Fetch Istanbul Prayer Times (Diyanet Method - 13)
        const fetchPrayerTimes = async () => {
            try {
                const res = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Istanbul&country=Turkey&method=13');
                if (res.ok) {
                    const data = await res.json();
                    setPrayerTimings(data.data.timings);
                }
            } catch (error) {
                console.error('Prayer times fetch error:', error);
            }
        };

        fetchProducts();
        fetchStaff();
        fetchMe();
        fetchPrayerTimes();
    }, []);

    // Check for Ezan Alert - every minute
    useEffect(() => {
        if (!prayerTimings) return;

        const checkEzan = () => {
            const now = new Date();
            const nowHours = now.getHours();
            const nowMinutes = now.getMinutes();

            // We only care about major prayers
            const prayersToCheck = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
            const prayerLabels: Record<string, string> = {
                'Fajr': 'İmsak',
                'Dhuhr': 'Öğle',
                'Asr': 'İkindi',
                'Maghrib': 'Akşam',
                'Isha': 'Yatsı'
            };

            for (const key of prayersToCheck) {
                const [pours, pMinutes] = prayerTimings[key].split(':').map(Number);

                // Alert 1 minute before
                // Example: Ezan is at 13:00. We want alert at 12:59.
                let alertMinute = pMinutes - 1;
                let alertHour = pours;
                if (alertMinute < 0) {
                    alertMinute = 59;
                    alertHour -= 1;
                }

                if (nowHours === alertHour && nowMinutes === alertMinute) {
                    setActivePrayerAlert(prayerLabels[key]);
                    return;
                }
            }

            // If none matched the exact "1 minute before", clear if it was there for more than a minute
            setActivePrayerAlert(null);
        };

        const interval = setInterval(checkEzan, 30000); // Check every 30s
        checkEzan();
        return () => clearInterval(interval);
    }, [prayerTimings]);

    // Closing Announcement & Audio Logic
    const playClosingAnnouncement = useCallback(() => {
        if (typeof window === 'undefined') return;

        try {
            // Pelin Yıldız - Sincere and Warm Ses Kaydı
            const audio = new Audio('/nons_2026-02-23T15_59_05_Pelin Yildiz - Sincere and Warm_pvc_sp100_s64_sb75_se8_b_m2.mp3');
            audio.play().catch(e => console.error('Audio playback failed:', e));

            setShowClosingAlert(true);

            // Görsel uyarıyı 30 saniye sonra kapat
            setTimeout(() => setShowClosingAlert(false), 30000);
        } catch (error) {
            console.error('Announcement error:', error);
        }
    }, []);

    // Kapanış zamanı kontrolü (00:30, 00:35, 00:40...)
    useEffect(() => {
        const checkClosingTime = () => {
            const now = new Date();
            const hour = now.getHours();
            const mins = now.getMinutes();
            const timeKey = `${hour}:${mins}`;

            // Her gece 00:30 ile 01:00 arası 5 dakikada bir anons yap
            if (hour === 0 && mins >= 30 && mins % 5 === 0 && lastAnnouncedTime !== timeKey) {
                setLastAnnouncedTime(timeKey);
                playClosingAnnouncement();
            }
        };

        const interval = setInterval(checkClosingTime, 30000); // 30 saniyede bir kontrol et
        return () => clearInterval(interval);
    }, [lastAnnouncedTime, playClosingAnnouncement]);

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

        let successCount = 0;
        let errorCount = 0;
        let lastErrorMessage = '';

        for (const order of pending) {
            try {
                // IMPORTANT: Staff orders require PIN for performance tracking
                // If the order was created while offline, we need to ensure it's processed correctly.
                // For now, the API handles POS orders.
                const res = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(order.data)
                });

                if (res.ok) {
                    await noccaDB.markOrderSynced(order.tempId);
                    successCount++;
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

        if (successCount > 0 && remaining.length === 0) {
            toast.success(`${successCount} çevrimdışı sipariş başarıyla senkronize edildi!`, { icon: '✅' });
        } else if (errorCount > 0) {
            toast.error(`${errorCount} sipariş senkronize edilemedi. Lütfen interneti kontrol edin.`, { duration: 6000 });
        }
    }, [isSyncing]);

    const getDbProduct = (name: string) => {
        if (!dbProducts || !Array.isArray(dbProducts)) return undefined;
        return dbProducts.find(p => p && p.name === name);
    };

    const getStockInfo = (name: string) => {
        const found = getDbProduct(name);
        // If DB has loaded (has products) but this item is not in DB → treat as inactive/hidden
        if (!found) {
            const dbLoaded = (dbProducts || []).length > 0;
            if (dbLoaded) return { stock: 0, isAvailable: false, hasRecipe: false, isActive: false };
            // DB not yet loaded → show item optimistically
            return { stock: 100, isAvailable: true, hasRecipe: false, isActive: true };
        }
        return {
            stock: found.stock || 0,
            isAvailable: (found.isAvailable ?? true) && (found.isActive !== false),
            hasRecipe: found.hasRecipe ?? false,
            isActive: found.isActive ?? true
        };
    };

    // Categories that are likely hot drinks (needing porcelain option)
    const HOT_DRINK_CATEGORIES = ['Sıcak Kahveler', 'Çaylar', 'Espresso Ve Türk Kahvesi', 'Matchalar'];

    // Categories to hide from POS filter bar (technical/ingredient categories)
    const HIDDEN_CATEGORIES = ['Püreler', 'Tozlar'];

    // Filter products - category, search, and active status
    const filteredProducts = activeCategory === 'En Çok Satanlar'
        ? (allMenuItems || [])
            .filter(item => {
                if (!dbProducts || !Array.isArray(dbProducts)) return false;
                const dbProd = dbProducts.find(p => p && p.name === item.name);
                const stockInfo = getStockInfo(item.name);
                const matchesSearch = (item.name || '').toLocaleLowerCase('tr').includes((productSearch || '').toLocaleLowerCase('tr'));
                return dbProd && stockInfo.isActive !== false && matchesSearch;
            })
            .sort((a, b) => {
                if (!dbProducts || !Array.isArray(dbProducts)) return 0;
                const countA = dbProducts.find(p => p && p.name === a.name)?.soldCount || 0;
                const countB = dbProducts.find(p => p && p.name === b.name)?.soldCount || 0;
                return countB - countA;
            })
            .slice(0, 15) // Show top 15 most sold
        : (allMenuItems || []).filter(item => {
            const matchesCategory = activeCategory === 'Tümü' || item.category === activeCategory;
            const matchesSearch = (item.name || '').toLocaleLowerCase('tr').includes((productSearch || '').toLocaleLowerCase('tr'));

            const stockInfo = getStockInfo(item.name);
            if (!stockInfo || stockInfo.isActive === false) return false;

            return matchesCategory && matchesSearch;
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

            return [...prev, {
                id: cartItemId,
                productId: dbProduct?.id || product.id,
                name: product.name,
                price,
                quantity: 1,
                size,
                category: product.category,
                image: dbProduct?.imageUrl || product.image,
                isPorcelain: false
            }];
        });

        // Automatic Discount UI prompt for Desserts
        if (product.category === 'Tatlılar') {
            setShowDiscountInput(true);
        }

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

    // Staff Price Calculation
    // Free for everything except "Tatlılar" which are 50%
    const getStaffPrice = (item: CartItem) => {
        if (item.category === 'Tatlılar') return item.price * 0.5;
        return 0;
    };

    const staffTotal = cart.reduce((sum, item) => sum + (getStaffPrice(item) * item.quantity), 0);

    // BOGO Discount Calculation (Only for 'Tatlılar' category)
    // Buy any 2 desserts, the cheaper one is free
    const bogoDiscountAmount = isBOGOActive
        ? (() => {
            // Sepetteki tüm tatlıların fiyatlarını tekil liste haline getir
            const dessertPrices = cart
                .filter(item => item.category === 'Tatlılar')
                .flatMap(item => Array(item.quantity).fill(item.price))
                .sort((a, b) => b - a); // Mahalden ucuza sırala

            let discount = 0;
            // Her 2 üründen 2.si (listede daha sonra gelen, yani ucuz olan) bedava
            for (let i = 1; i < dessertPrices.length; i += 2) {
                discount += dessertPrices[i];
            }
            return discount;
        })()
        : 0;

    const discountAmount = (cartTotal - bogoDiscountAmount) * (discountRate / 100);
    const totalDiscount = bogoDiscountAmount + discountAmount;
    const finalTotal = staffMode ? staffTotal : (cartTotal - totalDiscount);

    // Broadcast cart to Customer Display
    useEffect(() => {
        const channel = new BroadcastChannel('nocca_pos_display');
        channel.postMessage({
            type: 'UPDATE_CART',
            data: {
                cart,
                totals: {
                    subtotal: cartTotal,
                    discount: totalDiscount,
                    total: finalTotal
                },
                customer: selectedCustomer
            }
        });
        return () => channel.close();
    }, [cart, cartTotal, totalDiscount, finalTotal]);

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
    const handleCreateOrder = async (paymentMethod: 'CASH' | 'CREDIT_CARD' | 'SPLIT', customPayments?: any[], pinOverride?: string) => {
        if (cart.length === 0) return;

        const currentPin = pinOverride || enteredPin;

        // NEW: Confirmation check
        if (!showConfirmModal && !showStaffPinModal && !currentPin) {
            setConfirmingMethod(paymentMethod);
            setShowConfirmModal(true);
            setPendingOrderArgs({ method: paymentMethod, payments: customPayments });
            return;
        }

        // Requirement: PIN check before actual creation
        if (!showStaffPinModal && !currentPin) {
            setPendingOrderArgs({ method: paymentMethod, payments: customPayments });
            setShowStaffPinModal(true);
            setEnteredPin('');
            setIsPinError(false);
            return;
        }

        const tempId = `off_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const orderData = {
            items: cart.map(item => {
                const unitPrice = item.price * (1 - discountRate / 100);
                return {
                    productId: item.productId,
                    productName: item.name,
                    quantity: item.quantity,
                    unitPrice: unitPrice,
                    totalPrice: unitPrice * item.quantity,
                    size: item.size,
                    isPorcelain: item.isPorcelain
                };
            }),
            totalAmount: cartTotal,
            finalAmount: finalTotal,
            discountAmount: totalDiscount,
            status: 'PENDING',
            paymentStatus: 'COMPLETED',
            paymentMethod: paymentMethod === 'SPLIT' ? 'CASH' : paymentMethod,
            payments: customPayments || [{
                amount: finalTotal,
                method: paymentMethod === 'SPLIT' ? 'CASH' : paymentMethod,
                status: 'COMPLETED'
            }],
            userId: selectedCustomer?.id || null,
            customerName: selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : 'Misafir',
            customerPhone: selectedCustomer?.phone || '',
            customerEmail: selectedCustomer?.email || '',
            notes: isBOGOActive ? 'POS Satışı (1 ALANA 1 BEDAVA, OFFLINE_SUPPORT)' : 'POS Satışı (OFFLINE_SUPPORT)',
            offlineTempId: tempId,
            createdAt: new Date().toISOString()
        };

        setProcessingPayment(true);
        try {
            // First, try to send to server if online
            if (navigator.onLine) {
                const res = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...orderData, staffPin: currentPin })
                });

                if (res.ok) {
                    const createdOrder = await res.json();

                    // Success! Show receipt
                    setLastOrder({
                        ...createdOrder,
                        items: cart,
                        payments: customPayments,
                        totalAmount: cartTotal,
                        finalAmount: finalTotal,
                        discountAmount: totalDiscount,
                        customerName: orderData.customerName,
                        creatorName: 'Kasa',
                        isBOGO: isBOGOActive,
                        bogoDiscount: bogoDiscountAmount,
                        percentageDiscount: discountAmount
                    });

                    // Cleanup
                    finalizeOrderSuccess();
                    return;
                } else {
                    const errorData = await res.json().catch(() => ({}));
                    if (errorData.error === 'Hatalı Personel PIN kodu!') {
                        setIsPinError(true);
                        setEnteredPin('');
                        setProcessingPayment(false);
                        return;
                    }

                    // Specific server errors that we shouldn't retry (like validation errors)
                    if (res.status === 400) {
                        toast.error(`Sipariş Hatası: ${errorData.error || 'Geçersiz veri'}`);
                        setProcessingPayment(false);
                        return;
                    }

                    // Otherwise, fall through to offline storage for other errors (500 etc)
                    throw new Error(errorData.error || 'Server error');
                }
            } else {
                // Not online, go directly to offline storage
                throw new Error('Offline');
            }
        } catch (error) {
            console.warn('POS Order going offline:', error);

            // SAVE TO LOCAL STORAGE (IndexedDB)
            await noccaDB.saveOrder(orderData, tempId);
            setPendingOrdersCount(prev => prev + 1);

            // Show success receipt to user even if offline!
            setLastOrder({
                id: tempId,
                items: cart,
                payments: customPayments || [{ amount: finalTotal, method: paymentMethod }],
                totalAmount: cartTotal,
                finalAmount: finalTotal,
                discountAmount: totalDiscount,
                customerName: orderData.customerName,
                creatorName: 'Kasa (Çevrimdışı)',
                createdAt: orderData.createdAt,
                isOffline: true
            });

            toast.error('İnternet yok: Sipariş şubeye kaydedildi, bağlantı gelince senkronize edilecek.', {
                icon: '📶',
                duration: 5000
            });

            finalizeOrderSuccess();
        } finally {
            setProcessingPayment(false);
        }
    };

    const finalizeOrderSuccess = () => {
        setEnteredPin('');
        setShowStaffPinModal(false);
        setPendingOrderArgs(null);
        setCart([]);
        setShowConfirmModal(false);
        setConfirmingMethod(null);

        const channel = new BroadcastChannel('nocca_pos_display');
        channel.postMessage({ type: 'ORDER_COMPLETED' });
        channel.close();

        setSelectedCustomer(null);
        setCustomerSearch('');
        setDiscountRate(0);
        setIsBOGOActive(false);
    };

    // Staff Consumption Submission
    const handleCreateStaffConsumption = async () => {
        if (cart.length === 0 || !selectedStaff) {
            toast.error('Lütfen personel seçin ve ürün ekleyin.');
            return;
        }

        setIsStaffSubmitting(true);
        try {
            const consumptionData = {
                staffId: selectedStaff.id,
                paymentMethod: staffPaymentMethod,
                items: cart.map(item => ({
                    productId: item.productId,
                    productName: item.name,
                    quantity: item.quantity,
                    originalPrice: item.price,
                    staffPrice: getStaffPrice(item),
                    size: item.size,
                    isPorcelain: item.isPorcelain,
                    category: item.category
                }))
            };

            const res = await fetch('/api/admin/staff-consumption', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(consumptionData)
            });

            if (res.ok) {
                toast.success(`${selectedStaff.name} tüketimi başarıyla kaydedildi.`);
                setCart([]);
                const chan3 = new BroadcastChannel('nocca_pos_display');
                chan3.postMessage({ type: 'ORDER_COMPLETED' });
                chan3.close();
                setStaffMode(false);
                setSelectedStaff(null);
            } else {
                const err = await res.json();
                toast.error(`Hata: ${err.error || 'Kaydedilemedi'}`);
            }
        } catch (error) {
            console.error('Staff consumption error:', error);
            toast.error('Bağlantı hatası.');
        } finally {
            setIsStaffSubmitting(false);
        }
    };



    return (
        <>
            {/* Screen UI - Hidden when printing */}
            <div className="flex flex-col md:flex-row h-screen h-[100dvh] bg-gray-100 overflow-hidden relative print:hidden">
                {/* Staff Selection Modal */}
                {showStaffModal && (
                    <div className="absolute inset-0 bg-black/50 z-[60] flex items-center justify-center backdrop-blur-sm animate-fade-in">
                        <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full relative">
                            <button
                                onClick={() => {
                                    setShowStaffModal(false);
                                    setStaffMode(false);
                                }}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes size={24} />
                            </button>

                            <h3 className="text-xl font-bold text-gray-800 mb-4">Personel Seçin</h3>
                            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                                {allStaff.length === 0 ? (
                                    <p className="col-span-2 text-center text-gray-500 py-10">Personel bulunamadı.</p>
                                ) : (
                                    allStaff.map(staff => (
                                        <button
                                            key={staff.id}
                                            onClick={() => {
                                                setSelectedStaff(staff);
                                                setShowStaffModal(false);
                                            }}
                                            className="p-4 rounded-xl border-2 border-gray-100 hover:border-purple-600 hover:bg-purple-50 transition-all text-center group"
                                        >
                                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                                {staff.name.split(' ').map((n: string) => n[0]).join('')}
                                            </div>
                                            <span className="font-bold text-gray-800 block text-sm">{staff.name}</span>
                                            <span className="text-[10px] text-gray-500 uppercase">{staff.role}</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

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
                                    href="/kitchen"
                                    target="_blank"
                                    className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1 md:py-1.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider bg-orange-600 text-white hover:bg-orange-700 transition-all shadow-lg"
                                >
                                    <FaFire className="text-xs" />
                                    <span className="hidden md:inline">Mutfak</span>
                                </Link>
                                {currentUserRole === 'MANAGER' && (
                                    <>
                                        <Link
                                            href="/admin/accounting?report=today"
                                            className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1 md:py-1.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-lg"
                                        >
                                            <FaMoneyBillWave className="text-xs" />
                                            <span className="hidden md:inline">Rapor</span>
                                        </Link>
                                        <button
                                            onClick={playClosingAnnouncement}
                                            className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1 md:py-1.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider bg-indigo-500 text-white hover:bg-indigo-600 transition-all shadow-lg"
                                        >
                                            <span>📢 Test</span>
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => setShowRecentOrders(true)}
                                    className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1 md:py-1.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg"
                                >
                                    <FaSync className="text-xs" />
                                    <span className="hidden md:inline">Son Siparişler</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setStaffMode(!staffMode);
                                        if (!staffMode) {
                                            setShowStaffModal(true);
                                            setDiscountRate(0);
                                            setSelectedCustomer(null);
                                        } else {
                                            setSelectedStaff(null);
                                        }
                                    }}
                                    className={`flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1 md:py-1.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${staffMode ? 'bg-purple-600 text-white animate-pulse' : 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-50'}`}
                                >
                                    <FaUser className="text-xs" />
                                    <span>{staffMode ? (selectedStaff?.name || 'Personel') : 'Personel'}</span>
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

                        {/* Category Filter - Wrapped to show all in one glance */}
                        <div className="flex flex-wrap gap-2 mb-4 bg-white p-2 rounded-xl shadow-sm">
                            {['Tümü', 'En Çok Satanlar', ...categories.filter(c =>
                                c &&
                                c !== 'Tümü' &&
                                c !== 'Yan Ürünler' &&
                                !HIDDEN_CATEGORIES.includes(c)
                            )].map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === category
                                        ? 'bg-nocca-green text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {category}
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
                                                {/* Cup Selection - Broadened categories to include cold drinks */}
                                                {['Sıcak Kahveler', 'Çaylar', 'Espresso Ve Türk Kahvesi', 'Matchalar', 'Soğuk Kahveler', 'Soğuk İçecekler', 'Frappeler', 'Milkshake', 'Bubble Tea'].includes(item.category || '') && (
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
                                <div className="mt-2 space-y-2 animate-fade-in-right">
                                    {/* Preset Percentage Buttons */}
                                    <div className="grid grid-cols-2 gap-1">
                                        <button
                                            onClick={() => setDiscountRate(20)}
                                            className={`py-1 text-[10px] md:text-sm font-bold rounded border transition-all ${discountRate === 20
                                                ? 'bg-nocca-green text-white border-nocca-green'
                                                : 'bg-white text-gray-600 border-gray-300 hover:border-nocca-green'
                                                }`}
                                        >
                                            %20 İSKONTO
                                        </button>
                                        <button
                                            onClick={() => setDiscountRate(0)}
                                            className="py-1 text-[10px] md:text-sm font-bold rounded border bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                                        >
                                            SIFIRLA
                                        </button>
                                    </div>

                                    {/* BOGO Toggle */}
                                    <button
                                        onClick={() => setIsBOGOActive(!isBOGOActive)}
                                        className={`w-full py-1.5 md:py-2 px-3 rounded-lg border font-bold text-[10px] md:text-xs flex items-center justify-center gap-2 transition-all ${isBOGOActive
                                            ? 'bg-purple-100 text-purple-700 border-purple-300 shadow-sm'
                                            : 'bg-white text-gray-600 border-gray-300 hover:border-purple-300'
                                            }`}
                                    >
                                        <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full border-2 flex items-center justify-center ${isBOGOActive ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
                                            {isBOGOActive && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                        </div>
                                        <span>TATLI: 1 ALANA 1 BEDAVA</span>
                                    </button>

                                    {/* Custom Discount Input */}
                                    <div className="flex items-center justify-end space-x-1 pt-1 border-t border-gray-100">
                                        <span className="text-[10px] text-gray-400">Özel: </span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={discountRate}
                                            onChange={(e) => {
                                                let val = parseFloat(e.target.value);
                                                if (isNaN(val)) val = 0;
                                                if (val > 100) val = 100;
                                                if (val < 0) val = 0;
                                                setDiscountRate(val);
                                            }}
                                            className="w-12 md:w-16 p-0.5 md:p-1 border border-gray-300 rounded text-right text-[10px] md:text-sm focus:ring-1 focus:ring-green-500"
                                            placeholder="0"
                                        />
                                        <span className="text-gray-600 font-bold">%</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center mb-0.5 md:mb-1">
                            <span className="text-gray-500 text-[10px] md:text-sm">Ara Toplam</span>
                            <span className="font-medium text-gray-700 text-[10px] md:text-sm">₺{(cartTotal ?? 0).toFixed(2)}</span>
                        </div>

                        {totalDiscount > 0 && (
                            <div className="flex flex-col space-y-0.5 mb-0.5 md:mb-1">
                                {isBOGOActive && bogoDiscountAmount > 0 && (
                                    <div className="flex justify-between items-center text-purple-600 text-[10px] md:text-sm font-medium">
                                        <span>1 Alana 1 Bedava (Tatlı)</span>
                                        <span>-₺{bogoDiscountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                {discountRate > 0 && (
                                    <div className="flex justify-between items-center text-red-500 text-[10px] md:text-sm font-medium">
                                        <span>Genel İskonto (%{discountRate})</span>
                                        <span>-₺{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-between items-end mb-2 md:mb-4 pt-1 md:pt-2 border-t border-dashed border-gray-300">
                            <span className="text-gray-800 font-bold text-sm md:text-lg">Genel Toplam</span>
                            <div className="flex flex-col items-end">
                                {totalDiscount > 0 && (
                                    <span className="text-xs md:text-sm text-gray-400 line-through font-medium">
                                        ₺{(cartTotal ?? 0).toFixed(2)}
                                    </span>
                                )}
                                <span className={`text-xl md:text-3xl font-black ${totalDiscount > 0 ? 'text-nocca-green' : 'text-gray-900'}`}>
                                    ₺{(finalTotal ?? 0).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4">
                            {staffMode ? (
                                <div className="space-y-3">
                                    {finalTotal > 0 && (
                                        <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                                            <p className="text-[10px] font-bold text-purple-700 uppercase mb-2">Ödeme Yöntemi</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => setStaffPaymentMethod('CASH')}
                                                    className={`py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 border-2 ${staffPaymentMethod === 'CASH'
                                                        ? 'bg-purple-600 text-white border-purple-600'
                                                        : 'bg-white text-purple-600 border-purple-200 hover:border-purple-400'
                                                        }`}
                                                >
                                                    <FaMoneyBillWave /> NAKİT
                                                </button>
                                                <button
                                                    onClick={() => setStaffPaymentMethod('CREDIT_CARD')}
                                                    className={`py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 border-2 ${staffPaymentMethod === 'CREDIT_CARD'
                                                        ? 'bg-purple-600 text-white border-purple-600'
                                                        : 'bg-white text-purple-600 border-purple-200 hover:border-purple-400'
                                                        }`}
                                                >
                                                    <FaCreditCard /> KREDİ KARTI
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        onClick={handleCreateStaffConsumption}
                                        disabled={cart.length === 0 || !selectedStaff || isStaffSubmitting}
                                        className="w-full h-16 bg-purple-600 text-white rounded-xl font-bold flex flex-col items-center justify-center shadow-lg hover:bg-purple-700 transition-all disabled:opacity-50"
                                    >
                                        <span className="text-lg uppercase">TÜKETİMİ KAYDET</span>
                                        <span className="text-xs opacity-80">{selectedStaff?.name}</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                    <button
                                        onClick={() => handleCreateOrder('CASH')}
                                        disabled={cart.length === 0 || processingPayment}
                                        className="flex flex-col items-center justify-center py-2 md:py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 shadow-lg"
                                    >
                                        <FaMoneyBillWave className="w-4 h-4 md:w-6 md:h-6 mb-0.5 md:mb-1" />
                                        <span className="font-bold text-[10px] md:text-base uppercase underline-offset-2">NAKİT</span>
                                    </button>
                                    <button
                                        onClick={() => handleCreateOrder('CREDIT_CARD')}
                                        disabled={cart.length === 0 || processingPayment}
                                        className="flex flex-col items-center justify-center py-2 md:py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg"
                                    >
                                        <FaCreditCard className="w-4 h-4 md:w-6 md:h-6 mb-0.5 md:mb-1" />
                                        <span className="font-bold text-[10px] md:text-base uppercase">K. KARTI</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSplitCash(0);
                                            setSplitCard(0);
                                            setItemAssignments({});
                                            setShowSplitModal(true);
                                        }}
                                        disabled={cart.length === 0 || processingPayment}
                                        className="col-span-2 lg:col-span-1 flex flex-col items-center justify-center py-2 md:py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 shadow-lg"
                                    >
                                        <FaClipboardList className="w-4 h-4 md:w-6 md:h-6 mb-0.5 md:mb-1" />
                                        <span className="font-bold text-[10px] md:text-base uppercase tracking-tight">PARÇALI</span>
                                    </button>
                                </div>
                            )}
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

                            {lastOrder.isBOGO && (
                                <div className="flex justify-between text-[11px] font-bold">
                                    <span>* 1 ALANA 1 BEDAVA</span>
                                    <span>-{lastOrder.bogoDiscount.toFixed(2)}₺</span>
                                </div>
                            )}

                            {lastOrder.discountAmount > 0 && !lastOrder.isBOGO && (
                                <div className="flex justify-between text-[11px]">
                                    <span>İNDİRİM</span>
                                    <span>-{(lastOrder.discountAmount ?? 0).toFixed(2)}₺</span>
                                </div>
                            )}

                            {lastOrder.discountAmount > 0 && lastOrder.isBOGO && lastOrder.percentageDiscount > 0 && (
                                <div className="flex justify-between text-[11px]">
                                    <span>EKSTRA İNDİRİM</span>
                                    <span>-{lastOrder.percentageDiscount.toFixed(2)}₺</span>
                                </div>
                            )}

                            <div className="flex flex-col border-t border-black mt-1 pt-1">
                                {lastOrder.discountAmount > 0 && (
                                    <div className="text-right text-[10px] line-through opacity-60">
                                        {(lastOrder.totalAmount ?? 0).toFixed(2)}₺
                                    </div>
                                )}
                                <div className="flex justify-between text-[16px] font-black">
                                    <span>GENEL TOPLAM</span>
                                    <span>{(typeof lastOrder.finalAmount === 'number' ? lastOrder.finalAmount : parseFloat(lastOrder.finalAmount ?? '0')).toFixed(2)}₺</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-2 pt-2 border-t border-dashed border-black">
                            <div className="my-1 flex justify-center">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://www.noccacoffee.com.tr/menu`}
                                    alt="Menu QR"
                                    style={{
                                        width: '25mm',
                                        height: '25mm',
                                        imageRendering: 'pixelated'
                                    }}
                                />
                            </div>

                            <div className="text-base font-black tracking-widest">NOCCA COFFEE</div>
                            <div className="text-[10px]">www.noccacoffee.com.tr</div>
                            <div className="mt-2 text-[11px] font-bold">* AFİYET OLSUN *</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Prayer Alert Overlay */}
            {activePrayerAlert && (
                <div className="fixed top-0 inset-x-0 z-[100] flex justify-center p-4 animate-bounce-in-top pointer-events-none">
                    <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-8 py-4 rounded-2xl shadow-2xl border-4 border-white flex items-center gap-4 pointer-events-auto">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-3xl animate-pulse">
                            📢
                        </div>
                        <div>
                            <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Ezan Vakti Yaklaşıyor</p>
                            <h3 className="text-xl font-black">{activePrayerAlert} Ezanı (1 DK Kaldı)</h3>
                            <p className="text-sm font-medium">Lütfen kafedeki müziği kapatınız.</p>
                        </div>
                        <button
                            onClick={() => setActivePrayerAlert(null)}
                            className="ml-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>
            )}

            {/* Closing Announcement Alert Overlay */}
            {showClosingAlert && (
                <div className="fixed top-0 inset-x-0 z-[100] flex justify-center p-4 animate-bounce-in-top pointer-events-none">
                    <div className="bg-gradient-to-r from-indigo-800 to-purple-900 text-white px-8 py-4 rounded-2xl shadow-2xl border-4 border-white flex items-center gap-4 pointer-events-auto">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-3xl animate-pulse">
                            📢
                        </div>
                        <div>
                            <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Kapanış Zamanı</p>
                            <h3 className="text-xl font-black">Kapanış Anonsu Yapılıyor</h3>
                            <p className="text-sm font-medium">Kafemiz saat 01:00'de tamamen kapanacaktır.</p>
                        </div>
                        <button
                            onClick={() => setShowClosingAlert(false)}
                            className="ml-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>
            )}

            {/* Staff Performance PIN Modal */}
            {showStaffPinModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border-2 border-nocca-green animate-scale-up">
                        <div className="bg-nocca-green p-6 text-white text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">👤</div>
                            <h3 className="text-xl font-black uppercase tracking-widest">Personel Onayı</h3>
                            <p className="text-xs opacity-80 mt-1 uppercase">Satışı performansınıza kaydetmek için 4 haneli PIN kodunuzu giriniz.</p>
                        </div>

                        <div className="p-8">
                            <div className="flex justify-center gap-4 mb-4">
                                {[0, 1, 2, 3].map((idx) => (
                                    <div
                                        key={idx}
                                        className={`w-12 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl font-black transition-all ${idx < enteredPin.length
                                            ? 'border-nocca-green bg-nocca-green/10 text-nocca-green'
                                            : isPinError ? 'border-red-300' : 'border-gray-200'
                                            }`}
                                    >
                                        {idx < enteredPin.length ? '●' : ''}
                                    </div>
                                ))}
                            </div>

                            {isPinError && (
                                <p className="text-center text-red-500 font-bold text-sm mb-4 animate-shake">
                                    Hatalı PIN! Lütfen tekrar deneyiniz.
                                </p>
                            )}

                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '⌫'].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => {
                                            if (num === 'C') {
                                                setEnteredPin('');
                                                setIsPinError(false);
                                            } else if (num === '⌫') {
                                                setEnteredPin(prev => prev.slice(0, -1));
                                                setIsPinError(false);
                                            } else if (enteredPin.length < 4) {
                                                const nextPin = enteredPin + num;
                                                setEnteredPin(nextPin);
                                                setIsPinError(false);

                                                // Automatic submission when 4 digits reached
                                                if (nextPin.length === 4) {
                                                    // Trigger the order creation with the PIN
                                                    if (pendingOrderArgs) {
                                                        // We need to wait slightly so the UI shows the 4th dot
                                                        setTimeout(() => {
                                                            handleCreateOrder(pendingOrderArgs.method, pendingOrderArgs.payments, nextPin);
                                                        }, 300);
                                                    }
                                                }
                                            }
                                        }}
                                        className={`h-16 rounded-2xl flex items-center justify-center text-2xl font-black transition-all active:scale-95 ${num === 'C' ? 'bg-red-50 text-red-600' :
                                            num === '⌫' ? 'bg-amber-50 text-amber-600' :
                                                'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => {
                                    setShowStaffPinModal(false);
                                    setProcessingPayment(false);
                                    setEnteredPin('');
                                    setPendingOrderArgs(null);
                                }}
                                className="w-full mt-6 py-3 text-gray-500 font-bold hover:text-red-500 transition-colors"
                            >
                                İşlemi İptal Et
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* General Order Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up">
                        <div className="bg-gray-800 p-6 text-white text-center">
                            <h3 className="text-xl font-black uppercase tracking-widest">Siparişi Onayla</h3>
                            <p className="text-xs opacity-80 mt-1 uppercase">Satış işlemi tamamlanacak ve fiş yazdırılacak.</p>
                        </div>
                        <div className="p-8">
                            <div className="mb-6 text-center">
                                <p className="text-gray-500 text-sm mb-1 uppercase font-bold tracking-widest">Ödeme Yöntemi</p>
                                <p className="text-2xl font-black text-nocca-green uppercase">
                                    {confirmingMethod === 'CASH' ? 'NAKİT' : confirmingMethod === 'CREDIT_CARD' ? 'KREDİ KARTI' : 'PARÇALI ÖDEME'}
                                </p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        // Trigger the PIN step (which is inside handleCreateOrder)
                                        handleCreateOrder(confirmingMethod!, pendingOrderArgs?.payments);
                                    }}
                                    className="w-full h-16 bg-nocca-green text-white rounded-2xl font-black text-xl hover:bg-nocca-light-green transition-all shadow-lg active:scale-95 flex items-center justify-center"
                                >
                                    EVET, ONAYLA
                                </button>
                                <button
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        setConfirmingMethod(null);
                                        setPendingOrderArgs(null);
                                    }}
                                    className="w-full py-4 text-gray-400 font-bold hover:text-red-500 transition-colors uppercase tracking-widest"
                                >
                                    İPTAL ET
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
