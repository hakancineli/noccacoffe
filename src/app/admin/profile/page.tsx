'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminProfile() {
    const [admin, setAdmin] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchAdminProfile();
    }, []);

    const fetchAdminProfile = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                if (data.role === 'CUSTOMER') {
                    router.push('/login');
                }
                // allow MANAGER, BARISTA, etc to view profile
                setAdmin(data);
            } else {
                router.push('/login');
            }
        } catch (error) {
            console.error('Failed to fetch admin profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Yeni şifreler eşleşmiyor.');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('Yeni şifre en az 6 karakter olmalıdır.');
            return;
        }

        try {
            const res = await fetch('/api/admin/profile/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(data.message);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => setShowPasswordForm(false), 2000);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Bir hata oluştu.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!admin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Profil Yüklenemedi</h2>
                    <p className="text-gray-600 mb-4">Kullanıcı bilgileri alınamadı veya yetkiniz yok.</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="text-blue-600 hover:text-blue-800 underline"
                    >
                        Giriş Sayfasına Dön
                    </button>
                    <div className="mt-4 text-xs text-gray-400">
                        Debug: Admin state is null. Loading is {loading.toString()}.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">Yönetici Profili</h1>
                        </div>
                        <nav className="flex space-x-4">
                            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                                Admin Panel
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Hesap Bilgileri
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Yönetici hesap detayları ve güvenlik ayarları.
                            </p>
                        </div>
                        <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            {admin.role || 'YÖNETİCİ'}
                        </div>
                    </div>
                    <div className="border-t border-gray-200">
                        <dl>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Ad Soyad
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {admin.firstName || admin.name} {admin.lastName}
                                </dd>
                            </div>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    E-posta Adresi
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {admin.email}
                                </dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Telefon
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {admin.phone || '-'}
                                </dd>
                            </div>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Kayıt Tarihi
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {new Date(admin.startDate || admin.createdAt).toLocaleDateString('tr-TR')}
                                </dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Şifre İşlemleri
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    <button
                                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                                        className="text-blue-600 hover:text-blue-500 font-medium"
                                    >
                                        {showPasswordForm ? 'İptal' : 'Şifre Değiştir'}
                                    </button>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Password Change Form */}
                {showPasswordForm && (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg animate-fade-in">
                        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Şifre Değiştir
                            </h3>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                {error && (
                                    <div className="bg-red-50 text-red-700 p-3 rounded text-sm mb-4">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="bg-green-50 text-green-700 p-3 rounded text-sm mb-4">
                                        {success}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mevcut Şifre</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 px-3 py-2 border"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 px-3 py-2 border"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre (Tekrar)</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 px-3 py-2 border"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Şifreyi Güncelle
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
