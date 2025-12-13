'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaCheckCircle, FaHome, FaReceipt } from 'react-icons/fa';

interface OrderItem {
    id: string;
    productName: string;
    quantity: number;
    size?: string;
    totalPrice: number;
}

interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    status: string;
    totalAmount: number;
    orderItems: OrderItem[];
}

export default function OrderTracker({ initialOrder }: { initialOrder: Order }) {
    const [order, setOrder] = useState(initialOrder);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/orders/${initialOrder.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrder(data);
                }
            } catch (error) {
                console.error("Failed to poll order status:", error);
            }
        };

        // Poll every 5 seconds
        const intervalId = setInterval(fetchOrder, 5000);
        return () => clearInterval(intervalId);
    }, [initialOrder.id]);

    const getStatusText = (status: string) => {
        const s = status?.toUpperCase();
        switch (s) {
            case 'PENDING': return 'Beklemede';
            case 'PREPARING': return 'Hazırlanıyor';
            case 'READY': return 'Hazır';
            case 'COMPLETED': return 'Tamamlandı';
            case 'CANCELLED': return 'İptal Edildi';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        const s = status?.toUpperCase();
        switch (s) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'PREPARING': return 'bg-orange-100 text-orange-800 animate-pulse';
            case 'READY': return 'bg-green-100 text-green-800';
            case 'COMPLETED': return 'bg-gray-100 text-gray-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const isReady = order.status?.toUpperCase() === 'READY' || order.status?.toUpperCase() === 'COMPLETED';

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex justify-center mb-6">
                        {isReady ? (
                            <FaCheckCircle className="text-green-500 w-20 h-20" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center">
                                <span className="text-4xl">⏳</span>
                            </div>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {order.status?.toUpperCase() === 'PENDING' ? 'Siparişiniz Alındı!' :
                            order.status?.toUpperCase() === 'PREPARING' ? 'Siparişiniz Hazırlanıyor!' :
                                order.status?.toUpperCase() === 'READY' ? 'Siparişiniz Hazır!' : 'Sipariş Durumu'}
                    </h1>
                    <p className="text-gray-600 mb-8">
                        {isReady
                            ? `Harika! Siparişiniz hazır, afiyet olsun ${order.customerName}.`
                            : `Teşekkürler ${order.customerName}. Sipariş durumunu buradan takip edebilirsiniz.`}
                    </p>

                    <div className="bg-green-50 rounded-xl p-8 mb-8 text-center border-2 border-green-100 border-dashed relative overflow-hidden">
                        <p className="text-sm text-green-600 font-bold uppercase tracking-widest mb-2">Sipariş Numaranız</p>
                        <p className="text-6xl font-black text-gray-900 tracking-tighter mb-2">
                            #{order.orderNumber.split('-').pop()}
                        </p>
                        <p className="text-xs text-gray-400">Bu numarayı takip ediniz</p>

                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
                        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                        <div className="flex justify-between items-center mb-4 border-b pb-4">
                            <div>
                                <p className="text-sm text-gray-500">Tam Sipariş Kodu</p>
                                <p className="text-sm font-mono text-gray-700">{order.orderNumber}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Durum</p>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                    {getStatusText(order.status)}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {order.orderItems.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center">
                                        <span className="font-medium text-gray-900">{item.quantity}x</span>
                                        <span className="ml-2 text-gray-600">
                                            {item.productName}
                                            {item.size && <span className="text-gray-400 ml-1">({item.size})</span>}
                                        </span>
                                    </div>
                                    <span className="font-medium text-gray-900">₺{item.totalPrice.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t mt-4 pt-4 flex justify-between items-center">
                            <span className="font-bold text-gray-900">Toplam Tutar</span>
                            <span className="font-bold text-nocca-green text-xl">₺{order.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-nocca-green hover:bg-nocca-light-green transition-colors"
                        >
                            <FaHome className="mr-2" /> Ana Sayfa
                        </Link>
                        <Link
                            href="/menu"
                            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <FaReceipt className="mr-2" /> Yeni Sipariş
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
