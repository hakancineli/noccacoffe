'use client';

import { useState, useEffect } from 'react';
import UserProfileComponent from '@/components/UserProfile';
import { useRouter } from 'next/navigation';

const ProfilePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Kullanıcının giriş yapmış olup olmadığını kontrol et
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
    } else {
      // Giriş yapmamışsa login sayfasına yönlendir
      router.push('/login');
    }
  }, [router]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nocca-light-green mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profilim</h1>
          <p className="mt-2 text-gray-600">Hesap bilgilerinizi yönetin ve NOCCA REWARDS avantajlarınızı görün</p>
        </div>
        
        <UserProfileComponent />
      </div>
    </div>
  );
};

export default ProfilePage;