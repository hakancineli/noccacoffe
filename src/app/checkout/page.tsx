'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        notes: ''
    });

    // Check for logged in user to auto-fill
    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                try {
                    const response = await fetch('/api/auth/me', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const user = await response.json();
                        setFormData(prev => ({
                            ...prev,
                            customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                            customerEmail: user.email || '',
                            customerPhone: user.phone || ''
                        }));
                    }
                } catch (err) {
                    console.error('Failed to load user profile', err);
                }
            }
        };
        fetchUserProfile();
    }, []);

    // Redirect if cart is empty
    useEffect(() => {
        if (items.length === 0) {
            router.push('/menu');
        }
    }, [items, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const orderData = {
                ...formData,
                items: items.map(item => ({
                    productId: item.id,
                    productName: item.name,
                    quantity: item.quantity,
                    unitPrice: item.finalPrice,
                    totalPrice: item.finalPrice * item.quantity,
                    size: item.selectedSize
                })),
                totalAmount: totalPrice,
                finalAmount: totalPrice // Future: Apply discounts here
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                throw new Error('Sipariş oluşturulurken bir hata oluştu');
            }

            const result = await response.json();

            // Clear cart and redirect to success page
            clearCart();
            router.push(`/order-confirmation/${result.orderId}`);

        } catch (err) {
            setError('Siparişiniz alınamadı. Lütfen tekrar deneyin.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href="/menu" className="flex items-center text-gray-600 hover:text-nocca-green transition-colors">
                        <FaArrowLeft className="mr-2" /> Menüye Dön
                    </Link>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Siparişi Tamamla</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Order Form */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold flex items-center">
                                <span className="bg-nocca-green text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">1</span>
                                İletişim Bilgileri
                            </h2>
                            {formData.customerName && formData.customerPhone && (
                                <button
                                    onClick={() => {
                                        // Toggle edit mode logic could be here if we had a dedicated state,
                                        // for now we rely on the form being always visible but let's make it collapsible
                                    }}
                                    className="text-sm text-nocca-green hover:underline"
                                >

                                </button>
                            )}
                        </div>

                        {/* Logged in User Summary */}
                        {formData.customerName && formData.customerPhone && (
                            <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-100 relative group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-gray-900">{formData.customerName}</p>
                                        <p className="text-gray-600">{formData.customerPhone}</p>
                                        <p className="text-gray-600 text-sm">{formData.customerEmail}</p>
                                    </div>
                                    <button
                                        onClick={() => setFormData({ ...formData, customerPhone: '' })} // Hack to force re-entry or use a proper state
                                        className="text-xs text-gray-500 hover:text-nocca-green underline"
                                    >
                                        Bilgileri Düzenle
                                    </button>
                                </div>
                                <div className="mt-2 text-xs text-green-700 flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    Kayıtlı bilgileriniz kullanılıyor
                                </div>
                            </div>
                        )}

                        {/* Show form only if phone is missing (or cleared for edit) */}
                        {(!formData.customerName || !formData.customerPhone) && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green focus:border-transparent"
                                        value={formData.customerName}
                                        onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                        placeholder="Adınız Soyadınız"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numarası</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green focus:border-transparent"
                                        value={formData.customerPhone}
                                        onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                                        placeholder="05XX XXX XX XX"
                                    />
                                </div>
                            </form>
                        )}

                        {/* Extra fields that should always be visible or conditional? 
                            Let's keep email and notes visible but maybe styled differently if verified.
                            Actually, simpler approach:
                            If verified, show summary and HIDE the inputs.
                            Then show the rest (notes, button).
                        */}

                        {(formData.customerName && formData.customerPhone) ? (
                            // Simplified view when verified
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">E-posta (İsteğe bağlı)</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green focus:border-transparent bg-gray-50"
                                        value={formData.customerEmail}
                                        onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                                        placeholder="ornek@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sipariş Notu</label>
                                    <textarea
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green focus:border-transparent"
                                        rows={3}
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Varsa özel istekleriniz..."
                                    />
                                </div>
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                        {error}
                                    </div>
                                )}
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full bg-nocca-green text-white py-3 rounded-lg font-bold hover:bg-nocca-light-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                >
                                    {loading ? 'İşleniyor...' : `Siparişi Onayla (₺${totalPrice.toFixed(2)})`}
                                </button>
                            </div>
                        ) : (
                            // Full form continued for guest/incomplete profile
                            <div className="space-y-4">
                                {/* Email and Notes part of the form above */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">E-posta (İsteğe bağlı)</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green focus:border-transparent"
                                        value={formData.customerEmail}
                                        onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                                        placeholder="ornek@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sipariş Notu</label>
                                    <textarea
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green focus:border-transparent"
                                        rows={3}
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Varsa özel istekleriniz..."
                                    />
                                </div>
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                        {error}
                                    </div>
                                )}
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full bg-nocca-green text-white py-3 rounded-lg font-bold hover:bg-nocca-light-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                >
                                    {loading ? 'İşleniyor...' : `Siparişi Onayla (₺${totalPrice.toFixed(2)})`}
                                </button>
                            </div>
                        )}

                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-lg shadow-md p-6 h-fit">
                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                            <span className="bg-nocca-green text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">2</span>
                            Sipariş Özeti
                        </h2>

                        <div className="divide-y max-h-96 overflow-y-auto pr-2">
                            {items.map((item, idx) => (
                                <div key={`${item.id}-${idx}`} className="py-4 flex gap-4">
                                    <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                        {item.image && (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {item.selectedSize && <span className="mr-2">Boyut: {item.selectedSize}</span>}
                                            <span>x{item.quantity}</span>
                                        </p>
                                        <p className="text-nocca-green font-semibold mt-1">
                                            ₺{(item.finalPrice * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t mt-4 pt-4 space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>Ara Toplam</span>
                                <span>₺{totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                                <span>TOPLAM</span>
                                <span>₺{totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
