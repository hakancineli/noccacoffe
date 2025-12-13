'use client';

import Link from 'next/link';
import { FaArrowLeft, FaUsersCog } from 'react-icons/fa';

export default function PersonnelPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/admin"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <FaArrowLeft className="mr-2" />
                        Admin Paneline Dön
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <FaUsersCog className="text-pink-600" />
                        Personel Yönetimi
                    </h1>
                </div>

                {/* Coming Soon Card */}
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-pink-100 rounded-full mb-4">
                            <FaUsersCog className="text-5xl text-pink-600" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Yakında Gelecek
                    </h2>

                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Personel yönetimi modülü şu anda geliştirme aşamasındadır.
                        Bu bölümde personel ekleme, düzenleme, maaş yönetimi ve
                        performans takibi gibi özellikler bulunacak.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                        <h3 className="font-semibold text-blue-900 mb-2">Planlanmış Özellikler:</h3>
                        <ul className="text-left text-blue-800 space-y-2">
                            <li>✓ Personel profil yönetimi</li>
                            <li>✓ Maaş ve ödeme takibi</li>
                            <li>✓ Vardiya planlaması</li>
                            <li>✓ Performans raporları</li>
                            <li>✓ İzin ve devamsızlık takibi</li>
                        </ul>
                    </div>

                    <div className="mt-8">
                        <Link
                            href="/admin"
                            className="inline-flex items-center px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
                        >
                            Ana Sayfaya Dön
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
