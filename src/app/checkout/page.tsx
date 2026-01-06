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
    const [successOrder, setSuccessOrder] = useState<{ id: string, number: string } | null>(null);

    const [birthdayDiscount, setBirthdayDiscount] = useState<{ itemId: string, amount: number } | null>(null);

    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        notes: '',
        createAccount: false,
        password: '',
        confirmPassword: ''
    });

    const [isEditing, setIsEditing] = useState(true);
    const [acceptedAgreement, setAcceptedAgreement] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'BRANCH'>('CREDIT_CARD');
    const [cardData, setCardData] = useState({
        holderName: '',
        cardNumber: '',
        expiry: '',
        cvv: ''
    });

    // Check for logged in user to auto-fill AND logic for birthday
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
                        if (user.phone) {
                            setIsEditing(false);
                        }

                        // Birthday Check
                        if (user.birthDate) {
                            const today = new Date();
                            const birthDate = new Date(user.birthDate);
                            if (today.getMonth() === birthDate.getMonth() && today.getDate() === birthDate.getDate()) {
                                // It is birthday! Find cheapest item
                                if (items.length > 0) {
                                    // Find min price item
                                    let minPrice = Infinity;
                                    let minItemId = '';

                                    items.forEach(item => {
                                        if (item.finalPrice < minPrice) {
                                            minPrice = item.finalPrice;
                                            minItemId = `${item.id}-${item.selectedSize || ''}`; // Assuming this unique key construction for simplified tracking, though item.id is number usually. CartContext uses number id + string size to match. Let's use index or construct a unique key logic if CartContext doesn't expose one. 
                                            // Actually CartContext doesn't expose a unique 'cartItemId'. 
                                            // Let's rely on finding the first occurrence of the cheapest item.
                                        }
                                    });

                                    // Let's just find the item object directly for simplicity in logic
                                    const cheapestItem = [...items].sort((a, b) => a.finalPrice - b.finalPrice)[0];
                                    if (cheapestItem) {
                                        setBirthdayDiscount({
                                            itemId: cheapestItem.id.toString(), // Store ID to match
                                            amount: cheapestItem.finalPrice
                                        });
                                    }
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.error('Failed to load user profile', err);
                }
            }
        };
        fetchUserProfile();
    }, [items]); // Re-run if items change to re-calc cheapest

    // Redirect if cart is empty
    useEffect(() => {
        if (items.length === 0 && !successOrder) {
            router.push('/menu');
        }
    }, [items, router, successOrder]);

    const finalTotal = birthdayDiscount ? (totalPrice - birthdayDiscount.amount) : totalPrice;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.createAccount) {
            if (formData.password !== formData.confirmPassword) {
                setError('Şifreler eşleşmiyor!');
                setLoading(false);
                return;
            }
            if (formData.password.length < 6) {
                setError('Şifre en az 6 karakter olmalıdır!');
                setLoading(false);
                return;
            }
        }

        if (!acceptedAgreement) {
            setError('Lütfen Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formunu onaylayınız.');
            setLoading(false);
            return;
        }

        if (paymentMethod === 'CREDIT_CARD') {
            if (!cardData.holderName || !cardData.cardNumber || !cardData.expiry || !cardData.cvv) {
                setError('Lütfen tüm kart bilgilerini doldurunuz.');
                setLoading(false);
                return;
            }
            if (cardData.cardNumber.replace(/\s/g, '').length < 16) {
                setError('Geçersiz kart numarası.');
                setLoading(false);
                return;
            }
        }

        try {
            // Apply discount to items payload
            // ... (rest of item mapping)

            const orderItems = items.map(item => {
                let unitPrice = item.finalPrice;
                let totalLinePrice = item.finalPrice * item.quantity;
                return {
                    productId: item.id,
                    productName: item.name,
                    quantity: item.quantity,
                    unitPrice: unitPrice,
                    totalPrice: totalLinePrice,
                    size: item.selectedSize
                };
            });

            const orderData = {
                ...formData,
                items: orderItems,
                paymentMethod: paymentMethod,
                totalAmount: totalPrice,
                finalAmount: finalTotal,
                discount: birthdayDiscount ? {
                    type: 'BIRTHDAY',
                    amount: birthdayDiscount.amount,
                    description: 'Doğum Günü Hediyesi'
                } : undefined,
                notes: formData.notes + (birthdayDiscount ? ' (Doğum Günü Hediyesi Uygulandı)' : '')
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Sipariş oluşturulurken bir hata oluştu');
            }

            const result = await response.json();

            // Clear cart logic without redirect
            clearCart();
            setSuccessOrder({ id: result.orderId, number: result.orderNumber });

        } catch (err: any) {
            setError(err.message || 'Siparişiniz alınamadı. Lütfen tekrar deneyin.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0 && !successOrder) return null;

    if (successOrder) {
        return (
            <div className="fixed inset-0 bg-green-500 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-green-400 to-green-600"></div>

                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">✅</span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Sipariş Alındı!</h2>
                    <p className="text-gray-500 mb-8">Teşekkürler, siparişiniz hazırlanıyor.</p>

                    <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200 mb-8 relative">
                        <div className="absolute -left-3 top-1/2 w-6 h-6 bg-white rounded-full border-r border-gray-200 transform -translate-y-1/2"></div>
                        <div className="absolute -right-3 top-1/2 w-6 h-6 bg-white rounded-full border-l border-gray-200 transform -translate-y-1/2"></div>

                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Sipariş Numaranız</p>
                        <p className="text-5xl font-black text-gray-900 tracking-tighter">
                            #{successOrder.number.split('-').pop()}
                        </p>
                    </div>

                    <button
                        onClick={() => router.push(`/order-confirmation/${successOrder.id}`)}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg"
                    >
                        Siparişim Ne Durumda? ➔
                    </button>

                    <button
                        onClick={() => { router.push('/menu'); }}
                        className="mt-4 text-sm text-gray-400 hover:text-gray-600 font-medium"
                    >
                        Yeni Sipariş Oluştur
                    </button>
                </div>
            </div>
        );
    }

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
                        {!isEditing && formData.customerName && formData.customerPhone && (
                            <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-gray-900">{formData.customerName}</p>
                                        <p className="text-gray-600">{formData.customerPhone}</p>
                                        {formData.customerEmail && <p className="text-gray-600 text-sm">{formData.customerEmail}</p>}
                                    </div>
                                    <button
                                        onClick={() => setIsEditing(true)}
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

                        {/* Show form if editing, else show just notes and confirm button */}
                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green"
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
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green"
                                        value={formData.customerPhone}
                                        onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                                        placeholder="05XX XXX XX XX"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">E-posta (İsteğe bağlı)</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green"
                                        value={formData.customerEmail}
                                        onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                                        placeholder="ornek@email.com"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3 cursor-pointer select-none border p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 text-nocca-green rounded border-gray-300 focus:ring-nocca-green"
                                            checked={formData.createAccount}
                                            onChange={e => setFormData({ ...formData, createAccount: e.target.checked })}
                                        />
                                        <span className="flex-1">Bilgilerimle hesabımı oluştur (Sonraki siparişlerinizde puan kazanın!)</span>
                                    </label>

                                    {formData.createAccount && (
                                        <div className="space-y-4 pl-2 border-l-2 border-nocca-green bg-green-50/30 p-4 rounded-r-lg animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Şifre Belirleyin</label>
                                                <input
                                                    type="password"
                                                    required={formData.createAccount}
                                                    minLength={6}
                                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green"
                                                    value={formData.password}
                                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                    placeholder="En az 6 karakter"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Şifre Tekrar</label>
                                                <input
                                                    type="password"
                                                    required={formData.createAccount}
                                                    minLength={6}
                                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green"
                                                    value={formData.confirmPassword}
                                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                    placeholder="Şifrenizi tekrar girin"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sipariş Notu</label>
                                    <textarea
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green"
                                        rows={3}
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Bardağa yazılacak İsim..."
                                    />
                                </div>

                                <div className="pt-4 border-t">
                                    <h2 className="text-xl font-semibold flex items-center mb-4 text-gray-900">
                                        Ödeme Yöntemi
                                    </h2>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('CREDIT_CARD')}
                                            className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center transition-all ${paymentMethod === 'CREDIT_CARD' ? 'border-nocca-green bg-green-50 text-nocca-green' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                        >
                                            <span className="text-2xl mb-2">💳</span>
                                            <span className="font-bold text-sm text-center">Kredi / Banka Kartı</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('BRANCH')}
                                            className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center transition-all ${paymentMethod === 'BRANCH' ? 'border-nocca-green bg-green-50 text-nocca-green' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                        >
                                            <span className="text-2xl mb-2">🏪</span>
                                            <span className="font-bold text-sm text-center">Şubede Öde</span>
                                        </button>
                                    </div>

                                    {paymentMethod === 'CREDIT_CARD' && (
                                        <div className="space-y-4 animate-in fade-in duration-300">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Kart Üzerindeki İsim</label>
                                                <input
                                                    type="text"
                                                    required={paymentMethod === 'CREDIT_CARD'}
                                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green uppercase"
                                                    value={cardData.holderName}
                                                    onChange={e => setCardData({ ...cardData, holderName: e.target.value.toUpperCase() })}
                                                    placeholder="AD SOYAD"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Kart Numarası</label>
                                                <input
                                                    type="text"
                                                    required={paymentMethod === 'CREDIT_CARD'}
                                                    maxLength={19}
                                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green font-mono"
                                                    value={cardData.cardNumber}
                                                    onChange={e => {
                                                        const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                                                        setCardData({ ...cardData, cardNumber: val });
                                                    }}
                                                    placeholder="0000 0000 0000 0000"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">SKT</label>
                                                    <input
                                                        type="text"
                                                        required={paymentMethod === 'CREDIT_CARD'}
                                                        maxLength={5}
                                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green"
                                                        value={cardData.expiry}
                                                        onChange={e => {
                                                            let val = e.target.value.replace(/\D/g, '');
                                                            if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                                            setCardData({ ...cardData, expiry: val });
                                                        }}
                                                        placeholder="AA/YY"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                                    <input
                                                        type="text"
                                                        required={paymentMethod === 'CREDIT_CARD'}
                                                        maxLength={3}
                                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green"
                                                        value={cardData.cvv}
                                                        onChange={e => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                                                        placeholder="123"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

                                <div className="flex items-start py-4">
                                    <input
                                        type="checkbox"
                                        id="agreement-edit"
                                        checked={acceptedAgreement}
                                        onChange={(e) => setAcceptedAgreement(e.target.checked)}
                                        className="mt-1 h-4 w-4 text-nocca-green focus:ring-nocca-green border-gray-300 rounded cursor-pointer"
                                    />
                                    <label htmlFor="agreement-edit" className="ml-2 block text-sm text-gray-700 select-none cursor-pointer">
                                        <Link href="/mesafeli-satis-sozlesmesi" target="_blank" className="font-medium text-nocca-green hover:underline">Mesafeli Satış Sözleşmesi'ni</Link> ve <Link href="/iptal-iade-kosullari" target="_blank" className="font-medium text-nocca-green hover:underline">İptal İade Koşulları'nı</Link> okudum, onaylıyorum.
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-nocca-green text-white py-4 rounded-xl font-bold hover:bg-nocca-light-green transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'İşleniyor...' : `Siparişi Onayla (₺${finalTotal.toFixed(2)})`}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sipariş Notu</label>
                                    <textarea
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green"
                                        rows={3}
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Bardağa yazılacak İsim..."
                                    />
                                </div>

                                <div className="pt-4 border-t">
                                    <h2 className="text-xl font-semibold mb-4 text-gray-900">
                                        Ödeme Yöntemi
                                    </h2>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('CREDIT_CARD')}
                                            className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center transition-all ${paymentMethod === 'CREDIT_CARD' ? 'border-nocca-green bg-green-50 text-nocca-green' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                        >
                                            <span className="text-2xl mb-2">💳</span>
                                            <span className="font-bold text-sm text-center">Kredi / Banka Kartı</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('BRANCH')}
                                            className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center transition-all ${paymentMethod === 'BRANCH' ? 'border-nocca-green bg-green-50 text-nocca-green' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                        >
                                            <span className="text-2xl mb-2">🏪</span>
                                            <span className="font-bold text-sm text-center">Şubede Öde</span>
                                        </button>
                                    </div>

                                    {paymentMethod === 'CREDIT_CARD' && (
                                        <div className="space-y-4 animate-in fade-in duration-300">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Kart Üzerindeki İsim</label>
                                                <input
                                                    type="text"
                                                    required={paymentMethod === 'CREDIT_CARD'}
                                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green uppercase"
                                                    value={cardData.holderName}
                                                    onChange={e => setCardData({ ...cardData, holderName: e.target.value.toUpperCase() })}
                                                    placeholder="AD SOYAD"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Kart Numarası</label>
                                                <input
                                                    type="text"
                                                    required={paymentMethod === 'CREDIT_CARD'}
                                                    maxLength={19}
                                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green font-mono"
                                                    value={cardData.cardNumber}
                                                    onChange={e => {
                                                        const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                                                        setCardData({ ...cardData, cardNumber: val });
                                                    }}
                                                    placeholder="0000 0000 0000 0000"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">SKT</label>
                                                    <input
                                                        type="text"
                                                        required={paymentMethod === 'CREDIT_CARD'}
                                                        maxLength={5}
                                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green"
                                                        value={cardData.expiry}
                                                        onChange={e => {
                                                            let val = e.target.value.replace(/\D/g, '');
                                                            if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                                            setCardData({ ...cardData, expiry: val });
                                                        }}
                                                        placeholder="AA/YY"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                                    <input
                                                        type="text"
                                                        required={paymentMethod === 'CREDIT_CARD'}
                                                        maxLength={3}
                                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nocca-green"
                                                        value={cardData.cvv}
                                                        onChange={e => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                                                        placeholder="123"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

                                <div className="flex items-start py-4">
                                    <input
                                        type="checkbox"
                                        id="agreement-view"
                                        checked={acceptedAgreement}
                                        onChange={(e) => setAcceptedAgreement(e.target.checked)}
                                        className="mt-1 h-4 w-4 text-nocca-green focus:ring-nocca-green border-gray-300 rounded cursor-pointer"
                                    />
                                    <label htmlFor="agreement-view" className="ml-2 block text-sm text-gray-700 select-none cursor-pointer">
                                        <Link href="/mesafeli-satis-sozlesmesi" target="_blank" className="font-medium text-nocca-green hover:underline">Mesafeli Satış Sözleşmesi'ni</Link> ve <Link href="/iptal-iade-kosullari" target="_blank" className="font-medium text-nocca-green hover:underline">İptal İade Koşulları'nı</Link> okudum, onaylıyorum.
                                    </label>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full bg-nocca-green text-white py-4 rounded-xl font-bold hover:bg-nocca-light-green transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'İşleniyor...' : `Siparişi Onayla (₺${finalTotal.toFixed(2)})`}
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

                            {birthdayDiscount && (
                                <div className="flex justify-between text-green-600 font-medium animate-pulse">
                                    <span className="flex items-center">
                                        <span className="mr-2">🎂</span>
                                        Doğum Günü Hediyesi
                                    </span>
                                    <span>-₺{birthdayDiscount.amount.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                                <span>TOPLAM</span>
                                <span>₺{finalTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
