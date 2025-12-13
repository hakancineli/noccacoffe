'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    status: string;
    notes?: string;
    createdAt: string;
    orderItems: OrderItem[];
}

interface OrderItem {
    id: string;
    productName: string;
    quantity: number;
    size?: string;
    notes?: string;
}

export default function KitchenPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Audio Alarm Logic
    const [audio] = useState(typeof window !== 'undefined' ? new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3') : null);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    // Alarm Check
    useEffect(() => {
        const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
        if (pendingOrders > 0 && audio) {
            audio.play().catch(e => console.log("Audio block", e));
        }
    }, [orders]);

    const fetchOrders = async () => {
        try {
            // Fetch all non-completed orders: Pending, Preparing
            // Only these concern the kitchen. READY is also useful to see what's done but waiting pickup.
            const res = await fetch('/api/admin/orders?status=all&limit=50');
            if (res.ok) {
                const data = await res.json();
                // Filter mainly for PENDING and PREPARING for the main view
                // But showing READY might be good too. Let's filter client side or ask API.
                const kitchenOrders = data.orders.filter((o: Order) =>
                    ['PENDING', 'PREPARING'].includes(o.status)
                );
                setOrders(kitchenOrders);
            }
        } catch (error) {
            console.error('Kitchen fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchOrders(); // Refresh immediately
            }
        } catch (e) { console.error(e); }
    };

    if (loading) return <div className="p-10 text-center text-2xl">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <span className="mr-3">🍳</span> Mutfak Ekranı (KDS)
                </h1>
                <div className="flexspace-x-4">
                    <div className="text-xl font-mono bg-gray-800 px-4 py-2 rounded">
                        Bekleyen: <span className="text-red-400 font-bold">{orders.filter(o => o.status === 'PENDING').length}</span>
                    </div>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 text-gray-500 text-2xl">
                    Şu an aktif sipariş yok. ☕
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className={`rounded-xl overflow-hidden border-2 shadow-2xl relative ${order.status === 'PENDING' ? 'border-red-500 bg-gray-800' : 'border-blue-500 bg-gray-800'
                                }`}
                        >
                            {/* Header */}
                            <div className={`p-4 ${order.status === 'PENDING' ? 'bg-red-600' : 'bg-blue-600'} text-white flex justify-between items-center`}>
                                <h2 className="text-xl font-bold">#{order.orderNumber.split('-')[2]}</h2>
                                <span className="text-sm font-light">{new Date(order.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-4">
                                <div className="text-gray-400 text-sm border-b border-gray-700 pb-2">
                                    {order.customerName}
                                </div>

                                <div className="space-y-3">
                                    {order.orderItems.map((item) => (
                                        <div key={item.id} className="flex flex-col">
                                            <div className="flex justify-between items-start">
                                                <span className="text-2xl font-bold">{item.quantity}x</span>
                                                <span className="text-lg flex-1 ml-3">{item.productName}</span>
                                            </div>
                                            {item.size && (
                                                <div className="ml-9 text-yellow-400 font-bold text-sm">Boy: {item.size}</div>
                                            )}
                                            {item.notes && (
                                                <div className="ml-9 text-red-300 italic text-sm">Not: {item.notes}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {order.notes && (
                                    <div className="mt-4 bg-gray-700 p-2 rounded text-red-200 border border-red-900/50">
                                        <strong>Sipariş Notu:</strong> {order.notes}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="p-4 bg-gray-900/50 border-t border-gray-700 mt-auto">
                                {order.status === 'PENDING' ? (
                                    <button
                                        onClick={() => updateStatus(order.id, 'PREPARING')}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg text-lg transition shadow-lg"
                                    >
                                        HAZIRLA 👨‍🍳
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => updateStatus(order.id, 'READY')}
                                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg text-lg transition shadow-lg animate-pulse"
                                    >
                                        HAZIR ✅
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
