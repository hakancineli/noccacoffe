'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
}

export default function CustomerDisplayPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [totals, setTotals] = useState({ subtotal: 0, discount: 0, total: 0 });
    const [isIdle, setIsIdle] = useState(true);

    useEffect(() => {
        const channel = new BroadcastChannel('nocca_pos_display');

        channel.onmessage = (event) => {
            const { type, data } = event.data;
            if (type === 'UPDATE_CART') {
                setCart(data.cart);
                setTotals(data.totals);
                setIsIdle(data.cart.length === 0);
            } else if (type === 'ORDER_COMPLETED') {
                setIsIdle(true);
                setCart([]);
            }
        };

        return () => channel.close();
    }, []);

    if (isIdle) {
        return (
            <div className="min-h-screen bg-nocca-green flex flex-col items-center justify-center text-white p-10 overflow-hidden">
                <div className="relative w-64 h-64 mb-12 animate-pulse">
                    <Image
                        src="/images/logo.png"
                        alt="Nocca Logo"
                        fill
                        className="object-contain brightness-0 invert"
                    />
                </div>
                <h1 className="text-6xl font-black mb-4 tracking-tighter">HOŞ GELDİNİZ</h1>
                <p className="text-2xl font-medium opacity-80 uppercase tracking-[0.3em]">En İyi Kahve Deneyimi</p>

                {/* Promo Slider Placeholder */}
                <div className="mt-20 grid grid-cols-2 gap-8 max-w-5xl w-full">
                    <div className="bg-white/10 backdrop-blur-md p-8 rounded-[40px] border border-white/20">
                        <p className="text-amber-400 font-black text-sm uppercase mb-2">Günün Kombini</p>
                        <h2 className="text-3xl font-black mb-1">San Sebastian + Çay</h2>
                        <p className="text-4xl font-black text-white">₺250.00</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-8 rounded-[40px] border border-white/20">
                        <p className="text-blue-400 font-black text-sm uppercase mb-2">Yeni Lezzet</p>
                        <h2 className="text-3xl font-black mb-1">Iced Salted Caramel</h2>
                        <p className="text-4xl font-black text-white">₺210.00</p>
                    </div>
                </div>

                <div className="absolute bottom-10 left-0 right-0 text-center opacity-40 text-sm font-bold tracking-widest uppercase">
                    www.noccacoffee.com.tr
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex overflow-hidden">
            {/* Left Side: Branding / Visual */}
            <div className="w-1/2 bg-nocca-green relative p-12 flex flex-col justify-between overflow-hidden">
                <div className="relative w-32 h-32 z-10">
                    <Image
                        src="/images/logo.png"
                        alt="Nocca Logo"
                        fill
                        className="object-contain brightness-0 invert"
                    />
                </div>

                <div className="relative z-10">
                    <h2 className="text-7xl font-black text-white mb-6 leading-none">AFİYET<br />OLSUN</h2>
                    <p className="text-white/70 text-xl font-medium">Siparişiniz Hazırlanıyor...</p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute -left-10 top-40 w-64 h-64 bg-black/5 rounded-full blur-2xl"></div>
            </div>

            {/* Right Side: Order Summary */}
            <div className="w-1/2 bg-white flex flex-col p-12 shadow-[-20px_0_50px_rgba(0,0,0,0.05)] relative z-20">
                <div className="flex justify-between items-end mb-10 pb-6 border-b-2 border-gray-100">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Sipariş Özeti</h1>
                    <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">{cart.length} ÜRÜN</span>
                </div>

                <div className="flex-1 overflow-y-auto pr-4 space-y-6 custom-scrollbar">
                    {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-start group">
                            <div className="flex-1">
                                <h3 className="text-2xl font-black text-gray-800 leading-tight">
                                    {item.name}
                                </h3>
                                <div className="flex gap-2 mt-1">
                                    {item.size && (
                                        <span className="text-xs font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase">
                                            {item.size} BOY
                                        </span>
                                    )}
                                    <span className="text-xs font-black text-nocca-green uppercase">
                                        {item.quantity} ADET
                                    </span>
                                </div>
                            </div>
                            <div className="text-2xl font-black text-gray-900 ml-4">
                                ₺{(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-auto pt-10 border-t-2 border-gray-100 space-y-4">
                    <div className="flex justify-between text-xl font-bold text-gray-500">
                        <span>Ara Toplam</span>
                        <span>₺{totals.subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {totals.discount > 0 && (
                        <div className="flex justify-between text-xl font-bold text-red-500">
                            <span>İskonto</span>
                            <span>-₺{totals.discount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center bg-gray-900 text-white p-8 rounded-3xl mt-6 shadow-2xl scale-105 transform origin-bottom">
                        <span className="text-2xl font-bold opacity-80 uppercase tracking-widest">ÖDENECEK</span>
                        <span className="text-6xl font-black">₺{totals.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
