'use client';

import { useState } from 'react';
import { FaQrcode, FaMobileAlt, FaBell, FaGift, FaMapMarkerAlt } from 'react-icons/fa';

const MobileIntegration = () => {
  const [qrCode, setQrCode] = useState('NOCCA-2024-AHMET');
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: '6. Kahve Hediye!',
      message: '6. kahve alana 7. kahve bedava. Kampanya son gün 30.11.2024',
      time: '2 saat önce',
      read: false,
      type: 'promotion'
    },
    {
      id: '2',
      title: '500 Puan Bonus!',
      message: 'Tebrikler! Gümüş seviyesine ulaştınız ve 500 bonus puan kazandınız.',
      time: '1 gün önce',
      read: false,
      type: 'reward'
    },
    {
      id: '3',
      title: 'Yeni Ödül',
      message: 'Ücretsiz latte ödülünüzü kullanmaya hazır.',
      time: '3 gün önce',
      read: true,
      type: 'reward'
    }
  ]);

  const [mobileWallet, setMobileWallet] = useState({
    balance: 2450,
    lastTransaction: {
      date: '28.10.2024 14:30',
      description: 'Caffè Latte',
      points: -500,
      type: 'reward_redemption'
    },
    upcomingRewards: [
      {
        id: '1',
        title: 'Ücretsiz Tatlı',
        points: 800,
        availableDate: '01.11.2024'
      },
      {
        id: '2',
        title: 'Doğum Günü Hediyesi',
        points: 0,
        availableDate: '15.11.2024'
      }
    ]
  });

  const [nearbyStores, setNearbyStores] = useState([
    {
      id: '1',
      name: 'NOCCA Yenibosna',
      address: 'Yıldırım Beyazıt Cad. 84/A',
      distance: '0.5 km',
      phone: '+90 546 737 85 10',
      hours: '08:00 - 22:00',
      rating: 4.8
    },
    {
      id: '2',
      name: 'NOCCA Bahçelievler',
      address: 'Fevzi Çakmak Mah. 123/A',
      distance: '1.2 km',
      phone: '+90 546 737 85 11',
      hours: '07:00 - 23:00',
      rating: 4.6
    },
    {
      id: '3',
      name: 'NOCCA İstoç',
      address: 'İstiklal Cad. 45/B',
      distance: '2.8 km',
      phone: '+90 546 737 85 12',
      hours: '08:00 - 22:00',
      rating: 4.9
    }
  ]);

  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const copyQrCode = () => {
    navigator.clipboard.writeText(qrCode);
    // Toast notification gösterilebilir
  };

  const useReward = (rewardId: string) => {
    // Ödül kullanma logic
    console.log('Ödül kullanılıyor:', rewardId);
  };

  const getStoreDirections = (storeId: string) => {
    // Harita uygulamasına yönlendirme
    window.open(`https://maps.google.com/maps?q=${nearbyStores.find(s => s.id === storeId)?.address}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Mobil Entegrasyon</h2>
      
      {/* QR Kod */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mobil Cüzdan</h3>
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold text-nocca-green">{mobileWallet.balance.toLocaleString('tr-TR')}</p>
              <p className="text-sm text-gray-600">Mevcut Bakiye</p>
            </div>
            <button className="bg-nocca-light-green text-white px-4 py-2 rounded-md hover:bg-nocca-green transition-colors">
              Bakiye Yükle
            </button>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold mb-3">QR Kodunuz</h4>
            <div className="flex items-center space-x-4">
              <div className="flex-1 bg-white border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                    <FaQrcode className="h-16 w-16 text-gray-600" />
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-lg font-bold text-gray-800">{qrCode}</p>
                    <p className="text-sm text-gray-600">Mobil uygulamada göster</p>
                  </div>
                </div>
              </div>
              <button
                onClick={copyQrCode}
                className="bg-nocca-light-green text-white px-4 py-2 rounded-md hover:bg-nocca-green transition-colors"
              >
                Kopyala
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-semibold mb-3">Yaklaşan Ödüller</h4>
            <div className="space-y-3">
              {mobileWallet.upcomingRewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                  <div>
                    <p className="font-medium">{reward.title}</p>
                    <p className="text-sm text-gray-600">{reward.points} puan • {reward.availableDate}</p>
                  </div>
                  <button
                    onClick={() => useReward(reward.id)}
                    className="bg-nocca-light-green text-white px-3 py-1 rounded-md hover:bg-nocca-green transition-colors text-sm"
                  >
                    Kullan
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bildirimler */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Bildirimler</h3>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`bg-white border rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${
                notification.read ? 'border-gray-200 opacity-60' : 'border-nocca-light-green bg-green-50'
              }`}
              onClick={() => markNotificationAsRead(notification.id)}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  notification.type === 'promotion' ? 'bg-blue-100 text-blue-600' :
                  notification.type === 'reward' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {notification.type === 'promotion' && <FaGift className="h-5 w-5" />}
                  {notification.type === 'reward' && <span className="text-lg">🎁</span>}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{notification.title}</p>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-nocca-light-green rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Konum Bazlı Teklifler */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Yakındaki Mağazalar</h3>
        <div className="space-y-4">
          {nearbyStores.map((store) => (
            <div key={store.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <FaMapMarkerAlt className="h-5 w-5 text-nocca-light-green mr-3" />
                    <div>
                      <h4 className="font-semibold text-gray-800">{store.name}</h4>
                      <p className="text-sm text-gray-600">{store.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <FaMobileAlt className="h-4 w-4 mr-1" />
                      {store.distance}
                    </span>
                    <span>•</span>
                    <span>{store.phone}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>⭐ {store.rating}</span>
                    <span>{store.hours}</span>
                  </div>
                </div>
                <button
                  onClick={() => getStoreDirections(store.id)}
                  className="bg-nocca-light-green text-white px-3 py-1 rounded-md hover:bg-nocca-green transition-colors text-sm mt-2"
                >
                  Yol Tarifi
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobil Uygulama İndirme */}
      <div className="text-center">
        <div className="bg-gray-50 rounded-lg p-6 inline-block">
          <h4 className="font-semibold mb-4">Mobil Uygulamayı İndirin</h4>
          <div className="flex space-x-4 justify-center">
            <button className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors">
              <div className="flex items-center">
                <span className="mr-2">📱</span>
                App Store
              </div>
            </button>
            <button className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors">
              <div className="flex items-center">
                <span className="mr-2">🤖</span>
                Google Play
              </div>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Mobil uygulamamızla daha hızlı ve kolay ödüllerinizi yönetin!
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileIntegration;