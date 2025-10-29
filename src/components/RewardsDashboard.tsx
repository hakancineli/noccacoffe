'use client';

import { useState } from 'react';
import Image from 'next/image';
import AuthModal from './AuthModal';
import PointsSystem from './PointsSystem';
import RewardManager from './RewardManager';
import MobileIntegration from './MobileIntegration';

interface UserProfile {
  name: string;
  email: string;
  points: number;
  level: string;
  nextLevelPoints: number;
  currentLevelProgress: number;
}

const RewardsDashboard = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeSection, setActiveSection] = useState<'dashboard' | 'points' | 'rewards' | 'mobile'>('dashboard');

  const levelColors = {
    'Bronz': 'bg-orange-500',
    'Gümüş': 'bg-gray-400',
    'Altın': 'bg-yellow-500',
    'Platin': 'bg-purple-500'
  };

  const rewards = [
    {
      id: 1,
      title: 'Ücretsiz Latte',
      points: 500,
      image: '/images/products/CaffeLatte.jpeg',
      description: 'Sevdiğiniz latte\'nin tadını çıkarın'
    },
    {
      id: 2,
      title: '%20 İndirim',
      points: 1000,
      image: '/images/products/caramel-macchiato.jpg',
      description: 'Tüm ürünlerde %20 indirim kazanın'
    },
    {
      id: 3,
      title: 'Ücretsiz Tatlı',
      points: 800,
      image: '/images/products/brownie.jpg',
      description: 'Lezzetli brownie veya çikolatalı kurabi'
    }
  ];

  const recentActivity = [
    { id: 1, type: 'Kazanılan Puan', amount: '+50', description: 'Caffè Latte alımı', date: '29.10.2024 14:30' },
    { id: 2, type: 'Kullanılan Puan', amount: '-500', description: 'Ücretsiz Latte', date: '28.10.2024 10:15' },
    { id: 3, type: 'Kazanılan Puan', amount: '+75', description: 'Brownie alımı', date: '27.10.2024 16:45' },
    { id: 4, type: 'Bonus Puan', amount: '+100', description: 'Seviye yükseltme bonusu', date: '25.10.2024 09:00' }
  ];

  // Mock kullanıcı verisi - gerçek uygulamada bu context/API'den gelecek
  const mockUserProfile: UserProfile = {
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@example.com',
    points: 2450,
    level: 'Gümüş',
    nextLevelPoints: 5000,
    currentLevelProgress: 49
  };

  const handleLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleRegister = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setUserProfile(mockUserProfile);
  };

  const handleLogout = () => {
    setUserProfile(null);
  };

  // Eğer kullanıcı giriş yapmamışsa, login/register formunu göster
  if (!userProfile) {
    return (
      <>
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <div className="w-20 h-20 bg-nocca-light-green rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                ☕
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">NOCCA REWARDS</h3>
              <p className="text-gray-600 mb-6">
                Özel teklifler, ücretsiz ürünler ve daha fazlası sizi bekliyor!
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleLogin}
                className="w-full bg-nocca-light-green text-white py-3 px-6 rounded-lg font-semibold hover:bg-nocca-green transition-colors"
              >
                Giriş Yap
              </button>
              
              <button
                onClick={handleRegister}
                className="w-full bg-white border border-nocca-light-green text-nocca-light-green py-3 px-6 rounded-lg font-semibold hover:bg-nocca-light-green hover:text-white transition-colors"
              >
                Üye Ol
              </button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">VEYA</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <span className="text-red-500 mr-2">G</span>
                  Google ile Giriş
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <span className="text-black mr-2">🍎</span>
                  Apple ile Giriş
                </button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-6">
              Üye olarak{' '}
              <a href="#" className="text-nocca-light-green hover:text-nocca-green">
                Kullanım Koşulları
              </a>
              {' '}ve{' '}
              <a href="#" className="text-nocca-light-green hover:text-nocca-green">
                Gizlilik Politikası
              </a>
              {' '}nı kabul etmiş olursunuz.
            </p>
          </div>
        </div>

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
        />
      </>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        {/* Kullanıcı Bilgileri */}
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 bg-nocca-light-green rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
            {userProfile.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{userProfile.name}</h3>
            <p className="text-gray-600">{userProfile.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-auto text-sm text-nocca-light-green hover:text-nocca-green transition-colors"
          >
            Çıkış Yap
          </button>
        </div>

        {/* Puan ve Seviye Bilgisi */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-r from-nocca-light-green to-nocca-green rounded-lg p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm opacity-90">Mevcut Puan</p>
                <p className="text-3xl font-bold">{userProfile.points.toLocaleString('tr-TR')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Seviye</p>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${levelColors[userProfile.level as keyof typeof levelColors]}`}>
                  {userProfile.level}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Sıradaki Seviye</span>
                <span>{userProfile.nextLevelPoints.toLocaleString('tr-TR')} puan</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${userProfile.currentLevelProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Hızlı İşlemler</h4>
            <div className="space-y-3">
              <button className="w-full bg-white border border-gray-200 rounded-lg p-3 text-left hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🎁</span>
                  <div>
                    <p className="font-medium">Ödülleri Keşfet</p>
                    <p className="text-sm text-gray-600">Yeni ödüller görüntüle</p>
                  </div>
                </div>
              </button>
              <button className="w-full bg-white border border-gray-200 rounded-lg p-3 text-left hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📊</span>
                  <div>
                    <p className="font-medium">Puan Geçmişi</p>
                    <p className="text-sm text-gray-600">Detaylı puan hareketleri</p>
                  </div>
                </div>
              </button>
              <button className="w-full bg-white border border-gray-200 rounded-lg p-3 text-left hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">👤</span>
                  <div>
                    <p className="font-medium">Profil Ayarları</p>
                    <p className="text-sm text-gray-600">Hesap bilgilerini güncelle</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Ödüller */}
        <div className="mb-8">
          <h4 className="text-xl font-semibold mb-4">Mevcut Ödüller</h4>
          <div className="grid md:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <div key={reward.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="relative w-full h-32 mb-3">
                  <Image
                    src={reward.image}
                    alt={reward.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <h5 className="font-semibold mb-1">{reward.title}</h5>
                <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-nocca-green font-semibold">{reward.points} puan</span>
                  <button className="bg-nocca-light-green text-white px-3 py-1 rounded-md text-sm hover:bg-nocca-green transition-colors">
                    Kullan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Son Aktiviteler */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Son Aktiviteler</h4>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Tarih</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">İşlem</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Açıklama</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Puan</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((activity) => (
                    <tr key={activity.id} className="border-t border-gray-200">
                      <td className="p-3 text-sm">{activity.date}</td>
                      <td className="p-3 text-sm font-medium">{activity.type}</td>
                      <td className="p-3 text-sm text-gray-600">{activity.description}</td>
                      <td className={`p-3 text-sm text-right font-semibold ${
                        activity.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {activity.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex space-x-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveSection('dashboard')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeSection === 'dashboard'
              ? 'text-nocca-light-green border-nocca-light-green'
              : 'text-gray-600 border-transparent hover:text-nocca-light-green'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveSection('points')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeSection === 'points'
              ? 'text-nocca-light-green border-nocca-light-green'
              : 'text-gray-600 border-transparent hover:text-nocca-light-green'
          }`}
        >
          Puan Sistemi
        </button>
        <button
          onClick={() => setActiveSection('rewards')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeSection === 'rewards'
              ? 'text-nocca-light-green border-nocca-light-green'
              : 'text-gray-600 border-transparent hover:text-nocca-light-green'
          }`}
        >
          Ödüller
        </button>
      </div>

      {/* Dashboard Section */}
      {activeSection === 'dashboard' && (
        <div className="space-y-8">
          {/* Kullanıcı Bilgileri */}
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-nocca-light-green rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
              {userProfile.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{userProfile.name}</h3>
              <p className="text-gray-600">{userProfile.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto text-sm text-nocca-light-green hover:text-nocca-green transition-colors"
            >
              Çıkış Yap
            </button>
          </div>

          {/* Puan ve Seviye Bilgisi */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-r from-nocca-light-green to-nocca-green rounded-lg p-6 text-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm opacity-90">Mevcut Puan</p>
                  <p className="text-3xl font-bold">{userProfile.points.toLocaleString('tr-TR')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Seviye</p>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${levelColors[userProfile.level as keyof typeof levelColors]}`}>
                    {userProfile.level}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Sıradaki Seviye</span>
                  <span>{userProfile.nextLevelPoints.toLocaleString('tr-TR')} puan</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-300"
                    style={{ width: `${userProfile.currentLevelProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4">Hızlı İşlemler</h4>
              <div className="space-y-3">
                <button className="w-full bg-white border border-gray-200 rounded-lg p-3 text-left hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🎁</span>
                    <div>
                      <p className="font-medium">Ödülleri Keşfet</p>
                      <p className="text-sm text-gray-600">Yeni ödüller görüntüle</p>
                    </div>
                  </div>
                </button>
                <button className="w-full bg-white border border-gray-200 rounded-lg p-3 text-left hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📊</span>
                    <div>
                      <p className="font-medium">Puan Geçmişi</p>
                      <p className="text-sm text-gray-600">Detaylı puan hareketleri</p>
                    </div>
                  </div>
                </button>
                <button className="w-full bg-white border border-gray-200 rounded-lg p-3 text-left hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">👤</span>
                    <div>
                      <p className="font-medium">Profil Ayarları</p>
                      <p className="text-sm text-gray-600">Hesap bilgilerini güncelle</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Ödüller */}
          <div className="mb-8">
            <h4 className="text-xl font-semibold mb-4">Mevcut Ödüller</h4>
            <div className="grid md:grid-cols-3 gap-4">
              {rewards.map((reward) => (
                <div key={reward.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="relative w-full h-32 mb-3">
                    <Image
                      src={reward.image}
                      alt={reward.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <h5 className="font-semibold mb-1">{reward.title}</h5>
                  <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-nocca-green font-semibold">{reward.points} puan</span>
                    <button className="bg-nocca-light-green text-white px-3 py-1 rounded-md text-sm hover:bg-nocca-green transition-colors">
                      Kullan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Son Aktiviteler */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Son Aktiviteler</h4>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Tarih</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">İşlem</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Açıklama</th>
                      <th className="text-right p-3 text-sm font-semibold text-gray-700">Puan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((activity) => (
                      <tr key={activity.id} className="border-t border-gray-200">
                        <td className="p-3 text-sm">{activity.date}</td>
                        <td className="p-3 text-sm font-medium">{activity.type}</td>
                        <td className="p-3 text-sm text-gray-600">{activity.description}</td>
                        <td className={`p-3 text-sm text-right font-semibold ${
                          activity.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {activity.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Points System Section */}
      {activeSection === 'points' && <PointsSystem />}

      {/* Rewards Management Section */}
      {activeSection === 'rewards' && <RewardManager />}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </>
  );
};

export default RewardsDashboard;