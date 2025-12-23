'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { FaUser, FaStar, FaHistory, FaGift, FaCog, FaSignOutAlt } from 'react-icons/fa';
import Link from 'next/link';

export default function AccountPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsLoggedIn(true);
        } else {
            router.push('/login');
        }
    }, [router]);

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nocca-green"></div>
            </div>
        );
    }

    const menuItems = [
        { title: 'Profilim', desc: 'Kişisel bilgilerinizi güncelleyin', icon: <FaUser />, href: '/profile', color: 'bg-blue-500' },
        { title: 'Yıldızlarım', desc: 'Kazandığınız yıldızları takip edin', icon: <FaStar />, href: '/rewards', color: 'bg-yellow-500' },
        { title: 'Sipariş Geçmişi', desc: 'Önceki siparişlerinizi görüntüleyin', icon: <FaHistory />, href: '/orders', color: 'bg-green-500' },
        { title: 'Ödüllerim', desc: 'Size özel tanımlanmış hediye çekleri', icon: <FaGift />, href: '/rewards', color: 'bg-purple-500' },
        { title: 'Ayarlar', desc: 'Bildirim ve güvenlik ayarları', icon: <FaCog />, href: '/settings', color: 'bg-gray-500' },
    ];

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-20">
                <h1 className="text-3xl font-black text-gray-900 mb-2">HESABIM</h1>
                <p className="text-gray-500 mb-12">Nocca Coffee dünyasındaki tüm hesap işlemlerinizi buradan yönetebilirsiniz.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {menuItems.map((item, index) => (
                        <Link key={index} href={item.href} className="flex items-center p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                            <div className={`${item.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl mr-6 group-hover:scale-110 transition-transform`}>
                                {item.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900">{item.title}</h3>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                            <div className="text-gray-300 group-hover:text-nocca-green group-hover:translate-x-1 transition-all">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    ))}

                    <button
                        onClick={() => {
                            localStorage.removeItem('authToken');
                            window.location.href = '/login';
                        }}
                        className="flex items-center p-6 bg-red-50 rounded-3xl border border-red-100 shadow-sm hover:bg-red-100 transition-all group"
                    >
                        <div className="bg-red-500 w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl mr-6 group-hover:scale-110 transition-transform">
                            <FaSignOutAlt />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-bold text-red-600">Çıkış Yap</h3>
                            <p className="text-sm text-red-400">Oturumu güvenli bir şekilde kapatın</p>
                        </div>
                    </button>
                </div>
            </div>

            <Footer />
        </main>
    );
}
