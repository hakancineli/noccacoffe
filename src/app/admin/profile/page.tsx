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
                if (data.role !== 'ADMIN' && data.email !== 'admin@noccacoffee.com') {
                    // Basic check, middleware handles security usually
                    // But good to double check role if available
                }
                setAdmin(data.user);
            } else {
                router.push('/login');
            }
        } catch (error) {
            console.error('Failed to fetch admin profile:', error);
        } finally {
            setLoading(false);
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
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
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
                            ADMIN YETKİSİ
                        </div>
                    </div>
                    <div className="border-t border-gray-200">
                        <dl>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Ad Soyad
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {admin.firstName} {admin.lastName}
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
                                    {new Date(admin.createdAt).toLocaleDateString('tr-TR')}
                                </dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Şifre İşlemleri
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    <button className="text-blue-600 hover:text-blue-500 font-medium">
                                        Şifre Değiştir
                                    </button>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </main>
        </div>
    );
}
