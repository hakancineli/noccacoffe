'use client';

import { useState, useEffect } from 'react';
import MenuHero from '@/components/MenuHero';
import MenuItems from '@/components/MenuItems';
import Navbar from '@/components/Navbar';

export default function MenuPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <MenuHero />
      <BirthdayModal />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <MenuItems />
      </div>
    </div>
  );
}

function BirthdayModal() {
  const [show, setShow] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkBirthday = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);

          if (userData.birthDate) {
            const today = new Date();
            const birthDate = new Date(userData.birthDate);

            // Check if month and day match
            if (today.getMonth() === birthDate.getMonth() && today.getDate() === birthDate.getDate()) {
              // Check if we already showed it this session to avoid annoyance? 
              // For now let's show it every page load to be sure they see it, or maybe use sessionStorage
              const hasSeen = sessionStorage.getItem('seenBirthdayModal');
              if (!hasSeen) {
                setShow(true);
                sessionStorage.setItem('seenBirthdayModal', 'true');
              }
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    checkBirthday();
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative overflow-hidden">
        {/* Confetti Background Effect (CSS or SVG) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FFD700 2px, transparent 2.5px)', backgroundSize: '20px 20px' }}></div>

        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl shadow-inner">
          🎂
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">İyi ki Doğdun, {user?.firstName}! 🎉</h2>
        <p className="text-gray-600 mb-6">
          Doğum günün kutlu olsun! Bugün sana özel bir hediyemiz var.
        </p>

        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mb-6">
          <p className="text-orange-800 font-bold text-lg">☕ 1 Adet Kahve HEDİYE!</p>
          <p className="text-orange-600 text-xs mt-1">Sepetindeki en uygun fiyatlı kahve bizden.</p>
        </div>

        <button
          onClick={() => setShow(false)}
          className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-[1.02]"
        >
          Hediyemi Almak İstiyorum 🎁
        </button>
      </div>
    </div>
  );
}
