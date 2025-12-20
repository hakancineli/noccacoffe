'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaFire, FaCheck, FaClock, FaBell, FaBellSlash, FaCashRegister, FaMobileAlt } from 'react-icons/fa';

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

// Timer Component to show elapsed time since order creation
const OrderTimer = ({ createdAt }: { createdAt: string }) => {
    const [elapsed, setElapsed] = useState('');
    const [colorClass, setColorClass] = useState('text-gray-400');

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date().getTime();
            const start = new Date(createdAt).getTime();
            const diff = now - start;

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);

            setElapsed(`${minutes}:${seconds.toString().padStart(2, '0')}`);

            // Color coding based on wait time
            if (minutes < 5) setColorClass('text-green-500');       // < 5 mins
            else if (minutes < 10) setColorClass('text-orange-500'); // 5-10 mins
            else setColorClass('text-red-600 animate-pulse');        // > 10 mins
        };

        updateTimer(); // Initial call
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [createdAt]);

    return (
        <div className={`flex items-center font-mono font-bold ${colorClass}`}>
            <FaClock className="mr-1" />
            {elapsed}
        </div>
    );
};

export default function KitchenPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    // Web Audio API Context
    const audioContextRef = useRef<AudioContext | null>(null);
    const prevPendingCountReq = useRef<number>(0);

    const [debugInfo, setDebugInfo] = useState<any>(null);

    // Initialize Audio Context on user interaction (to bypass autoplay policy)
    const initAudio = () => {
        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContext();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    };

    const playBellSound = () => {
        if (!audioContextRef.current) initAudio();
        const ctx = audioContextRef.current;
        if (!ctx) return;

        // Create a pleasant "Ding" sound (Sine wave with decay)
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Bell characteristics
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(660, ctx.currentTime); // E5 note
        oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // Slide up to A5

        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.1); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2); // Decay

        oscillator.start();
        oscillator.stop(ctx.currentTime + 2);
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    // Alarm Check Logic
    useEffect(() => {
        if (!orders) return;
        const currentPendingCount = orders.filter(o => o.status === 'PENDING').length;

        // Only play if count INCREASED and audio is enabled
        if (currentPendingCount > prevPendingCountReq.current && currentPendingCount > 0) {
            if (!isMuted && hasInteracted) {
                playBellSound();
            }
        }

        prevPendingCountReq.current = currentPendingCount;
    }, [orders, isMuted, hasInteracted]);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`/api/admin/orders?status=all&limit=50&_t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                setDebugInfo({
                    fetchedCount: data.orders?.length || 0,
                    totalPagination: data.pagination?.total || 0,
                    firstOrder: data.orders?.[0] ? `${data.orders[0].orderNumber} (${data.orders[0].status})` : 'None',
                    allStatuses: data.orders?.map((o: any) => o.status).join(', ')
                });

                const kitchenOrders = data.orders.filter((o: Order) =>
                    ['PENDING', 'PREPARING'].includes(o.status)
                );
                kitchenOrders.sort((a: Order, b: Order) => {
                    if (a.status === b.status) return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    return a.status === 'PENDING' ? -1 : 1;
                });
                setOrders(kitchenOrders);
            } else {
                setDebugInfo({ error: `API Error: ${res.status}` });
            }
        } catch (error) {
            console.error('Kitchen fetch error:', error);
            setDebugInfo({ error: `Fetch Error: ${error}` });
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
            if (res.ok) fetchOrders();
        } catch (e) { console.error(e); }
    };

    const toggleMute = () => setIsMuted(!isMuted);

    // Interaction handler to unlock audio
    const handleInteraction = () => {
        if (!hasInteracted) {
            setHasInteracted(true);
            initAudio();
            playBellSound(); // Play test sound confirmation
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-[#E5D9C8] text-[#3E2723] text-2xl font-mono">Sistem Yükleniyor...</div>;

    if (!hasInteracted) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#E5D9C8] text-[#3E2723]" onClick={handleInteraction}>
                <div className="text-center p-10 border border-[#5C4033] rounded-2xl bg-[#3E2723] text-[#EAD8C0] shadow-2xl cursor-pointer animate-pulse">
                    <div className="text-6xl mb-4">🔇 ➔ 🔊</div>
                    <h1 className="text-3xl font-bold mb-2">Mutfak Ekranını Başlat</h1>
                    <p className="text-[#A1887F]">Sesli bildirimleri etkinleştirmek için ekrana dokunun.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#E5D9C8] text-[#3E2723] p-6 font-sans">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 bg-[#3E2723] p-4 rounded-2xl shadow-lg border border-[#5C4033]">
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-[#8D6E63] rounded-full flex items-center justify-center text-2xl mr-4 shadow-[#8D6E63]/20 shadow-xl text-[#3E2723]">
                        🍳
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-wide text-[#EAD8C0]">MUTFAK PANELİ</h1>
                        <p className="text-[#A1887F] text-xs tracking-wider uppercase">Nocca Coffee KDS v1.0</p>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    {/* Stats */}
                    <div className="flex space-x-4">
                        <div className="flex flex-col items-center bg-[#4E342E] px-4 py-2 rounded-xl border border-[#5C4033]">
                            <span className="text-xs text-[#A1887F] uppercase font-bold">Bekleyen</span>
                            <span className="text-2xl font-bold text-[#FF8A65]">{orders.filter(o => o.status === 'PENDING').length}</span>
                        </div>
                        <div className="flex flex-col items-center bg-[#4E342E] px-4 py-2 rounded-xl border border-[#5C4033]">
                            <span className="text-xs text-[#A1887F] uppercase font-bold">Hazırlanan</span>
                            <span className="text-2xl font-bold text-[#81C784]">{orders.filter(o => o.status === 'PREPARING').length}</span>
                        </div>
                    </div>

                    {/* Mute Toggle */}
                    <button
                        onClick={toggleMute}
                        className={`p-4 rounded-xl transition-all duration-300 ${isMuted ? 'bg-[#4E342E] text-[#A1887F]' : 'bg-[#D7CCC8] text-[#3E2723] shadow-lg shadow-white/10'}`}
                    >
                        {isMuted ? <FaBellSlash className="text-xl" /> : <FaBell className="text-xl animate-wiggle" />}
                    </button>
                </div>
            </div>

            {/* Debug Info Overlay */}
            {debugInfo && (
                <div className="mb-4 p-2 bg-black/80 text-green-400 text-xs font-mono rounded overflow-hidden">
                    <p>DEBUG MODE:</p>
                    <p>Fetched: {debugInfo.fetchedCount} orders</p>
                    <p>Total in DB: {debugInfo.totalPagination}</p>
                    <p>First Order: {debugInfo.firstOrder}</p>
                    <p className="truncate">Statuses: {debugInfo.allStatuses}</p>
                    {debugInfo.error && <p className="text-red-500 font-bold">{debugInfo.error}</p>}
                </div>
            )}

            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-[#8D6E63]">
                    <div className="text-6xl mb-4 grayscale opacity-20">☕</div>
                    <h2 className="text-2xl font-light">Aktif sipariş bulunmuyor</h2>
                    <p className="text-sm mt-2">Yeni siparişler düştüğünde burada görünecek.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {orders.map((order) => {
                        const isPos = order.notes?.includes('POS');
                        const cardTheme = isPos
                            ? {
                                bg: 'bg-[#3E2723]',
                                border: 'border-[#FF8A65]',
                                accent: 'text-[#FF8A65]',
                                subBg: 'bg-[#FF8A65]/10'
                            } // POS: Warm Orange/Brown
                            : {
                                bg: 'bg-[#263238]',
                                border: 'border-[#4DB6AC]',
                                accent: 'text-[#4DB6AC]',
                                subBg: 'bg-[#4DB6AC]/10'
                            }; // Mobile: Cool Teal/BlueSlate

                        return (
                            <div
                                key={order.id}
                                className={`relative flex flex-col rounded-xl overflow-hidden shadow-2xl transition-all duration-300 transform hover:scale-[1.02] 
                                ${cardTheme.bg} border-l-4 ${order.status === 'PENDING' ? 'border-[#FF8A65]' : 'border-[#81C784]'} 
                                ${isPos ? 'ring-1 ring-[#FF8A65]/20' : 'ring-1 ring-[#4DB6AC]/20'}
                            `}
                            >
                                {/* Urgency Strip (Animated for Pending) */}
                                {order.status === 'PENDING' && (
                                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isPos ? 'from-[#FF8A65] via-[#FFCCBC] to-[#FF8A65]' : 'from-[#4DB6AC] via-[#B2DFDB] to-[#4DB6AC]'} animate-gradient-x`}></div>
                                )}

                                {/* Card Header */}
                                <div className="p-5 border-b border-dashed border-[#5C4033] flex justify-between items-start bg-black/10">
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-2xl font-black tracking-tight ${order.status === 'PENDING' ? 'text-[#EAD8C0]' : 'text-[#D7CCC8]'}`}>
                                                #{order.orderNumber.split('-').pop()}
                                            </span>
                                            {order.status === 'PENDING' && <span className="animate-pulse text-[#FF8A65] text-xs font-bold px-2 py-0.5 rounded bg-[#FF8A65]/10 border border-[#FF8A65]/20">YENİ</span>}
                                        </div>
                                        <div className="text-[#A1887F] text-sm mt-1 flex items-center">
                                            {/* Timer replaces static time */}
                                            <OrderTimer createdAt={order.createdAt} />
                                            <span className="text-xs text-[#A1887F] ml-2">({new Date(order.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })})</span>

                                            {/* Source Badge */}
                                            <div className={`ml-3 flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${isPos ? 'bg-orange-900/40 text-orange-200 border border-orange-700/30' : 'bg-teal-900/40 text-teal-200 border border-teal-700/30'}`}>
                                                {isPos ? (
                                                    <>
                                                        <FaCashRegister className="mr-1" /> KASA
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaMobileAlt className="mr-1" /> MOBİL
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-1">Müşteri</div>
                                        <div className="font-medium text-[#D7CCC8] truncate max-w-[120px]" title={order.customerName}>
                                            {order.customerName}
                                        </div>
                                    </div>
                                </div>

                                {/* Card Body (Items) */}
                                <div className="p-5 flex-1 overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-[#5C4033] scrollbar-track-transparent">
                                    <div className="space-y-4">
                                        {order.orderItems.map((item, idx) => (
                                            <div key={item.id} className="flex flex-col">
                                                <div className="flex items-start">
                                                    <span className={`text-xl font-bold w-8 text-right mr-3 ${order.status === 'PENDING' ? 'text-[#FF8A65]' : 'text-[#81C784]'}`}>
                                                        {item.quantity}x
                                                    </span>
                                                    <div className="flex-1">
                                                        <span className="text-lg font-medium text-[#EAD8C0] leading-snug block">
                                                            {item.productName}
                                                        </span>
                                                        {item.size && (
                                                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold bg-[#5D4037] text-[#D7CCC8] border border-[#795548]">
                                                                {item.size}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {item.notes && (
                                                    <div className="ml-11 mt-1 text-sm text-[#FFCCBC] italic bg-[#FF8A65]/10 p-1 rounded border-l-2 border-[#FF8A65]/50 pl-2">
                                                        "{item.notes}"
                                                    </div>
                                                )}
                                                {idx < order.orderItems.length - 1 && <div className="border-b border-dashed border-[#5C4033] my-2 ml-11"></div>}
                                            </div>
                                        ))}
                                    </div>

                                    {order.notes && (
                                        <div className={`mt-4 p-3 border rounded-lg ${cardTheme.subBg} ${cardTheme.border}/30`}>
                                            <span className={`text-xs font-bold uppercase block mb-1 ${cardTheme.accent}`}>Sipariş Notu</span>
                                            <p className="text-[#FFE0B2] text-sm">{order.notes}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Card Footer (Actions) */}
                                <div className="p-4 bg-black/20 border-t border-[#5C4033]">
                                    {order.status === 'PENDING' ? (
                                        <button
                                            onClick={() => updateStatus(order.id, 'PREPARING')}
                                            className="w-full group relative flex items-center justify-center py-3 bg-gradient-to-r from-[#8D6E63] to-[#795548] hover:from-[#795548] hover:to-[#6D4C41] text-[#EAD8C0] font-bold rounded-lg shadow-lg shadow-black/20 transition-all transform active:scale-95 border border-[#A1887F]/30"
                                        >
                                            <span className="mr-2 text-xl group-hover:rotate-12 transition-transform">🔥</span>
                                            HAZIRLA
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => updateStatus(order.id, 'READY')}
                                            className="w-full group relative flex items-center justify-center py-3 bg-gradient-to-r from-[#388E3C] to-[#2E7D32] hover:from-[#2E7D32] hover:to-[#1B5E20] text-white font-bold rounded-lg shadow-lg shadow-green-900/40 transition-all transform active:scale-95 border border-green-700/50"
                                        >
                                            <span className="mr-2 text-xl group-hover:-rotate-12 transition-transform">✅</span>
                                            HAZIR
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
