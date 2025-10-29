'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaMapMarkerAlt, FaEdit, FaCamera, FaBell, FaShieldAlt, FaCreditCard } from 'react-icons/fa';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  joinDate: string;
  level: string;
  points: number;
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    promotionalEmails: boolean;
    locationSharing: boolean;
  };
  addresses: {
    id: string;
    type: 'home' | 'work' | 'other';
    title: string;
    address: string;
    city: string;
    postalCode: string;
    isDefault: boolean;
  }[];
  paymentMethods: {
    id: string;
    type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay';
    lastFour: string;
    brand: string;
    expiryDate: string;
    isDefault: boolean;
  }[];
  favoriteProducts: {
    id: string;
    name: string;
    category: string;
    price: number;
    image: string;
  }[];
}

const UserProfileComponent = () => {
  const [userProfile] = useState<UserProfile>({
    id: '1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@example.com',
    phone: '+90 546 737 85 10',
    birthDate: '15.05.1990',
    joinDate: '01.01.2023',
    level: 'Gümüş',
    points: 2450,
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      promotionalEmails: true,
      locationSharing: true
    },
    addresses: [
      {
        id: '1',
        type: 'home',
        title: 'Ev',
        address: 'Yıldırım Beyazıt Cad. 84/A',
        city: 'Bahçelievler',
        postalCode: '34100',
        isDefault: true
      },
      {
        id: '2',
        type: 'work',
        title: 'İş',
        address: 'Levent Mah. Şirinevler Mh. No: 123',
        city: 'İstanbul',
        postalCode: '34100',
        isDefault: false
      }
    ],
    paymentMethods: [
      {
        id: '1',
        type: 'credit_card',
        lastFour: '1234',
        brand: 'Visa',
        expiryDate: '12/25',
        isDefault: true
      },
      {
        id: '2',
        type: 'paypal',
        lastFour: 'paypal',
        brand: 'PayPal',
        expiryDate: '',
        isDefault: false
      }
    ],
    favoriteProducts: [
      {
        id: '1',
        name: 'Caffè Latte',
        category: 'Sıcak İçecekler',
        price: 45.90,
        image: '/images/products/CaffeLatte.jpeg'
      },
      {
        id: '2',
        name: 'Caramel Macchiato',
        category: 'Sıcak İçecekler',
        price: 54.90,
        image: '/images/products/caramel-macchiato.jpg'
      },
      {
        id: '3',
        name: 'Brownie',
        category: 'Tatlılar',
        price: 42.90,
        image: '/images/products/brownie.jpg'
      }
    ]
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'addresses' | 'payment' | 'favorites'>('profile');
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Profil kaydetme logic
  };

  const handlePreferenceChange = (key: keyof UserProfile['preferences'], value: boolean) => {
    // Preference güncelleme logic
  };

  const handleAddAddress = () => {
    // Yeni adres ekleme logic
  };

  const handleEditAddress = (id: string) => {
    // Adres düzenleme logic
  };

  const handleDeleteAddress = (id: string) => {
    // Adres silme logic
  };

  const handleAddPaymentMethod = () => {
    // Yeni ödeme yöntemi ekleme logic
  };

  const handleEditPaymentMethod = (id: string) => {
    // Ödeme yöntemi düzenleme logic
  };

  const handleDeletePaymentMethod = (id: string) => {
    // Ödeme yöntemi silme logic
  };

  const handleAddFavorite = () => {
    // Favori ürün ekleme logic
  };

  const handleRemoveFavorite = (id: string) => {
    // Favori ürün kaldırma logic
  };

  const levelColors = {
    'Bronz': 'bg-orange-500',
    'Gümüş': 'bg-gray-400',
    'Altın': 'bg-yellow-500',
    'Platin': 'bg-purple-500'
  };

  const getLevelProgress = () => {
    const levelPoints = {
      'Bronz': 0,
      'Gümüş': 1000,
      'Altın': 5000,
      'Platin': 10000
    };
    
    const currentLevelPoints = levelPoints[userProfile.level as keyof typeof levelPoints];
    const nextLevelPoints = Object.values(levelPoints).find(points => points > currentLevelPoints) || Infinity;
    
    if (nextLevelPoints === Infinity) return 100;
    
    return ((userProfile.points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Kullanıcı Profili</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            isEditing 
              ? 'bg-gray-300 text-gray-700' 
              : 'bg-nocca-light-green text-white hover:bg-nocca-green'
          }`}
        >
          {isEditing ? 'İptal' : 'Düzenle'}
        </button>
      </div>

      {/* Profil Bilgileri */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 space-y-6">
          {/* Kullanıcı Bilgileri */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Kişisel Bilgiler</h3>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <Image
                  src="/images/logo/noccacoffee.jpeg"
                  alt="Profil"
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
                <button 
                  className="absolute bottom-0 right-0 bg-nocca-light-green text-white p-2 rounded-full hover:bg-nocca-green transition-colors"
                  aria-label="Profil fotoğrafını değiştir"
                >
                  <FaCamera className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex-1">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => {/* Profil güncelleme logic */}}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                    disabled={!isEditing}
                    placeholder="Adınızı ve soyadınızı girin"
                    aria-label="Ad Soyad"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                  <div className="flex items-center">
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => {/* E-posta güncelleme logic */}}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                      disabled={!isEditing}
                      placeholder="E-posta adresinizi girin"
                      aria-label="E-posta"
                    />
                    <FaEnvelope className="h-5 w-5 text-gray-400 ml-2" />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <div className="flex items-center">
                    <input
                      type="tel"
                      value={userProfile.phone}
                      onChange={(e) => {/* Telefon güncelleme logic */}}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                      disabled={!isEditing}
                      placeholder="Telefon numaranızı girin"
                      aria-label="Telefon"
                    />
                    <FaPhone className="h-5 w-5 text-gray-400 ml-2" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Doğum Tarihi</label>
                    <input
                      type="date"
                      value={userProfile.birthDate}
                      onChange={(e) => {/* Doğum tarihi güncelleme logic */}}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                      disabled={!isEditing}
                      aria-label="Doğum Tarihi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Üyelik Tarihi</label>
                    <input
                      type="date"
                      value={userProfile.joinDate}
                      onChange={(e) => {/* Üyelik tarihi güncelleme logic */}}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                      disabled={!isEditing}
                      aria-label="Üyelik Tarihi"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Seviye ve Puan Bilgileri */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">NOCCA REWARDS</h3>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-nocca-green">{userProfile.points.toLocaleString('tr-TR')}</p>
                  <p className="text-sm text-gray-600">Mevcut Puan</p>
                </div>
                <div className="text-right">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${levelColors[userProfile.level as keyof typeof levelColors]}`}>
                    {userProfile.level}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Seviye {userProfile.level}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Sıradaki Seviye</span>
                  <span>5000 puan</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-nocca-light-green h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getLevelProgress()}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{(5000 - userProfile.points).toLocaleString('tr-TR')}</span> puan sonraki seviyeye
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Seviye Avantajları */}
        <div className="md:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Seviye Avantajları</h3>
            
            <div className="space-y-3">
              {userProfile.level === 'Bronz' && (
                <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-2xl mr-3">🥉</span>
                  <div>
                    <p className="font-semibold">Bronz Seviyesi</p>
                    <p className="text-sm text-gray-600">0-999 puan arası</p>
                  </div>
                </div>
              )}
              
              {userProfile.level === 'Gümüş' && (
                <div className="flex items-center p-3 bg-gray-400 rounded-lg">
                  <span className="text-2xl mr-3">🥈</span>
                  <div>
                    <p className="font-semibold">Gümüş Seviyesi</p>
                    <p className="text-sm text-gray-600">1000-4999 puan arası</p>
                  </div>
                </div>
              )}
              
              {userProfile.level === 'Altın' && (
                <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-2xl mr-3">🥇</span>
                  <div>
                    <p className="font-semibold">Altın Seviyesi</p>
                    <p className="text-sm text-gray-600">5000-9999 puan arası</p>
                  </div>
                </div>
              )}
              
              {userProfile.level === 'Platin' && (
                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-2xl mr-3">🏆</span>
                  <div>
                    <p className="font-semibold">Platin Seviyesi</p>
                    <p className="text-sm text-gray-600">10000+ puan arası</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'profile'
              ? 'text-nocca-light-green border-nocca-light-green'
              : 'text-gray-600 border-transparent hover:text-nocca-light-green'
          }`}
        >
          <FaUser className="inline mr-2" />
          Profil
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'preferences'
              ? 'text-nocca-light-green border-nocca-light-green'
              : 'text-gray-600 border-transparent hover:text-nocca-light-green'
          }`}
        >
          <FaBell className="inline mr-2" />
          Tercihler
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'addresses'
              ? 'text-nocca-light-green border-nocca-light-green'
              : 'text-gray-600 border-transparent hover:text-nocca-light-green'
          }`}
        >
          <FaMapMarkerAlt className="inline mr-2" />
          Adresler
        </button>
        <button
          onClick={() => setActiveTab('payment')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'payment'
              ? 'text-nocca-light-green border-nocca-light-green'
              : 'text-gray-600 border-transparent hover:text-nocca-light-green'
          }`}
        >
          <FaCreditCard className="inline mr-2" />
          Ödeme Yöntemleri
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'favorites'
              ? 'text-nocca-light-green border-nocca-light-green'
              : 'text-gray-600 border-transparent hover:text-nocca-light-green'
          }`}
        >
          <span className="inline mr-2">❤️</span>
          Favoriler
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tercihler</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">E-posta Bildirimleri</p>
                <p className="text-sm text-gray-600">Promosyonlar ve kampanya hakkında bilgi alın</p>
              </div>
              <button
                onClick={() => handlePreferenceChange('emailNotifications', !userProfile.preferences.emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  userProfile.preferences.emailNotifications ? 'bg-nocca-light-green' : 'bg-gray-200'
                } transition-colors`}
              >
                <span className="sr-only">E-posta bildirimleri</span>
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
                    userProfile.preferences.emailNotifications ? 'translate-x-1' : 'translate-x-0'
                  }`}
                ></span>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Bildirimleri</p>
                <p className="text-sm text-gray-600">Özel teklifler hakkında SMS ile bilgi alın</p>
              </div>
              <button
                onClick={() => handlePreferenceChange('smsNotifications', !userProfile.preferences.smsNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  userProfile.preferences.smsNotifications ? 'bg-nocca-light-green' : 'bg-gray-200'
                } transition-colors`}
              >
                <span className="sr-only">SMS bildirimleri</span>
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
                    userProfile.preferences.smsNotifications ? 'translate-x-1' : 'translate-x-0'
                  }`}
                ></span>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Promosyon E-postaları</p>
                <p className="text-sm text-gray-600">Ortakam ve özel teklifler</p>
              </div>
              <button
                onClick={() => handlePreferenceChange('promotionalEmails', !userProfile.preferences.promotionalEmails)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  userProfile.preferences.promotionalEmails ? 'bg-nocca-light-green' : 'bg-gray-200'
                } transition-colors`}
              >
                <span className="sr-only">Promosyon e-postaları</span>
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
                    userProfile.preferences.promotionalEmails ? 'translate-x-1' : 'translate-x-0'
                  }`}
                ></span>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Konum Paylaşımı</p>
                <p className="text-sm text-gray-600">Yakındaki mağazaları göster</p>
              </div>
              <button
                onClick={() => handlePreferenceChange('locationSharing', !userProfile.preferences.locationSharing)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  userProfile.preferences.locationSharing ? 'bg-nocca-light-green' : 'bg-gray-200'
                } transition-colors`}
              >
                <span className="sr-only">Konum paylaşımı</span>
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
                    userProfile.preferences.locationSharing ? 'translate-x-1' : 'translate-x-0'
                  }`}
                ></span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Adreslerim</h3>
            <button
              onClick={handleAddAddress}
              className="bg-nocca-light-green text-white px-4 py-2 rounded-md hover:bg-nocca-green transition-colors font-medium"
            >
              + Yeni Adres Ekle
            </button>
          </div>
          
          <div className="space-y-4">
            {userProfile.addresses.map((address) => (
              <div key={address.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{address.title}</p>
                    {address.isDefault && (
                      <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Varsayılan</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditAddress(address.id)}
                      className="text-nocca-light-green hover:text-nocca-green p-1"
                      aria-label="Adresi düzenle"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      Sil
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-1">{address.address}</p>
                <p className="text-sm text-gray-500">{address.city} {address.postalCode}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Ödeme Yöntemleri</h3>
            <button
              onClick={handleAddPaymentMethod}
              className="bg-nocca-light-green text-white px-4 py-2 rounded-md hover:bg-nocca-green transition-colors font-medium"
            >
              + Yeni Ödeme Yöntemi Ekle
            </button>
          </div>
          
          <div className="space-y-4">
            {userProfile.paymentMethods.map((method) => (
              <div key={method.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="flex items-center">
                      {method.type === 'credit_card' && <FaCreditCard className="h-5 w-5 text-gray-600 mr-2" />}
                      {method.type === 'debit_card' && <FaCreditCard className="h-5 w-5 text-blue-600 mr-2" />}
                      {method.type === 'paypal' && <span className="text-blue-600 mr-2">💰</span>}
                      {method.type === 'apple_pay' && <span className="text-gray-800 mr-2">🍎</span>}
                    </div>
                    <div>
                      <p className="font-medium">{method.brand}</p>
                      <p className="text-sm text-gray-600">•••• {method.lastFour}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!method.isDefault && (
                      <button
                        onClick={() => {/* Varsayılan yapma logic */}}
                        className="text-nocca-light-green hover:text-nocca-green p-1"
                      >
                        Varsayılan Yap
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePaymentMethod(method.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      Sil
                    </button>
                  </div>
                </div>
                
                {method.expiryDate && (
                  <p className="text-sm text-gray-500 mt-2">Son Kullanım: {method.expiryDate}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Favori Ürünlerim</h3>
            <button
              onClick={handleAddFavorite}
              className="bg-nocca-light-green text-white px-4 py-2 rounded-md hover:bg-nocca-green transition-colors font-medium"
            >
              Favorilere Ekle
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userProfile.favoriteProducts.map((product) => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="relative w-16 h-16">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{product.name}</h4>
                    <p className="text-sm text-gray-600 mb-1">{product.category}</p>
                    <p className="text-lg font-bold text-nocca-green">₺{product.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveFavorite(product.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    Kaldır
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kaydet Butonu */}
      {isEditing && (
        <div className="mt-6">
          <button
            onClick={handleSaveProfile}
            className="w-full bg-nocca-light-green text-white py-3 px-4 rounded-md hover:bg-nocca-green transition-colors font-medium"
          >
            Değişiklikleri Kaydet
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileComponent;