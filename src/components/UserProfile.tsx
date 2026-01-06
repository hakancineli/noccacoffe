'use client';

import { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'addresses' | 'payment' | 'favorites'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();

          // Map API response to UI model
          const points = data.userPoints?.points || 0;
          let level = 'Bronz';
          if (points >= 1000) level = 'Gümüş';
          if (points >= 5000) level = 'Altın';
          if (points >= 10000) level = 'Platin';

          setUserProfile({
            id: data.id,
            name: `${data.firstName || data.name || ''} ${data.lastName || ''}`.trim(),
            email: data.email,
            phone: data.phone || '',
            birthDate: data.birthDate ? new Date(data.birthDate).toLocaleDateString('tr-TR') : '',
            joinDate: new Date(data.createdAt || data.startDate).toLocaleDateString('tr-TR'),
            level: data.userPoints?.tier || level,
            points: points,
            preferences: {
              emailNotifications: true,
              smsNotifications: false,
              promotionalEmails: true,
              locationSharing: true
            },
            addresses: [],
            paymentMethods: [],
            favoriteProducts: []
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <p className="text-red-500">Profil bilgileri yüklenemedi. Lütfen tekrar giriş yapın.</p>
      </div>
    );
  }

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
    setIsAddingPayment(true);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would involve iyzico/PayTR tokenization
    alert('Kart başarıyla eklendi! (Test Modu)');
    setIsAddingPayment(false);

    // Mock update local state
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        paymentMethods: [
          ...userProfile.paymentMethods,
          {
            id: Math.random().toString(),
            type: 'credit_card',
            brand: 'Visa',
            lastFour: '4242',
            expiryDate: '12/26',
            isDefault: userProfile.paymentMethods.length === 0
          }
        ]
      });
    }
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
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Sol Sidebar - Kullanıcı Özeti ve Navigasyon */}
      <aside className="w-full lg:w-80 lg:sticky lg:top-24 space-y-6">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 p-8 text-center overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-nocca-green"></div>

          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-green-50 overflow-hidden mx-auto shadow-inner">
              <Image
                src="/images/logo/noccacoffee.jpeg"
                alt="Profil"
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 bg-nocca-green text-white p-2 rounded-full border-2 border-white hover:scale-110 transition-transform">
                <FaCamera className="h-3 w-3" />
              </button>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900">{userProfile.name}</h3>
          <p className="text-sm text-gray-500 mb-6">{userProfile.email}</p>

          <div className="bg-green-50 rounded-2xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-green-800 uppercase tracking-wider">Seviye</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black text-white ${levelColors[userProfile.level as keyof typeof levelColors]}`}>
                {userProfile.level.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-end">
              <div className="text-left">
                <span className="text-2xl font-black text-nocca-green">{userProfile.points}</span>
                <span className="text-[10px] text-green-600 block font-bold uppercase">Puan</span>
              </div>
              <div className="w-24 bg-green-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-nocca-green h-full transition-all duration-1000"
                  style={{ width: `${getLevelProgress()}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Menü */}
          <nav className="space-y-1 text-left">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-nocca-green text-white shadow-lg shadow-green-100' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FaUser className={`mr-3 ${activeTab === 'profile' ? 'text-white' : 'text-gray-400'}`} />
              <span className="font-semibold text-sm">Profilim</span>
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'preferences' ? 'bg-nocca-green text-white shadow-lg shadow-green-100' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FaBell className={`mr-3 ${activeTab === 'preferences' ? 'text-white' : 'text-gray-400'}`} />
              <span className="font-semibold text-sm">Tercihler</span>
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'addresses' ? 'bg-nocca-green text-white shadow-lg shadow-green-100' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FaMapMarkerAlt className={`mr-3 ${activeTab === 'addresses' ? 'text-white' : 'text-gray-400'}`} />
              <span className="font-semibold text-sm">Adresler</span>
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'payment' ? 'bg-nocca-green text-white shadow-lg shadow-green-100' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FaCreditCard className={`mr-3 ${activeTab === 'payment' ? 'text-white' : 'text-gray-400'}`} />
              <span className="font-semibold text-sm">Ödeme Yöntemleri</span>
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'favorites' ? 'bg-nocca-green text-white shadow-lg shadow-green-100' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span className={`mr-3 ${activeTab === 'favorites' ? '' : 'grayscale opacity-50'}`}>❤️</span>
              <span className="font-semibold text-sm">Favoriler</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Sağ İçerik Alanı */}
      <main className="flex-1 w-full bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden min-h-[600px]">
        <div className="p-8 md:p-10">

          {/* PROFIL TAB */}
          {activeTab === 'profile' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
                <h2 className="text-2xl font-black text-gray-900">Kişisel Bilgiler</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center space-x-2 px-6 py-2.5 rounded-full font-bold transition-all ${isEditing ? 'bg-gray-100 text-gray-500' : 'bg-black text-white hover:bg-gray-800'}`}
                >
                  {isEditing ? <span>İptal</span> : <><FaEdit /> <span>Düzenle</span></>}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Ad Soyad</label>
                    <input
                      type="text"
                      value={userProfile.name}
                      readOnly={!isEditing}
                      onChange={() => { }}
                      className={`w-full px-5 py-4 rounded-2xl border-2 transition-all font-medium ${isEditing ? 'border-nocca-green bg-white shadow-lg shadow-green-50' : 'border-gray-50 bg-gray-50 text-gray-700'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">E-posta</label>
                    <input
                      type="email"
                      value={userProfile.email}
                      readOnly={!isEditing}
                      onChange={() => { }}
                      className={`w-full px-5 py-4 rounded-2xl border-2 transition-all font-medium ${isEditing ? 'border-nocca-green bg-white' : 'border-gray-50 bg-gray-50 text-gray-700'}`}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Telefon</label>
                    <input
                      type="tel"
                      value={userProfile.phone}
                      readOnly={!isEditing}
                      onChange={() => { }}
                      className={`w-full px-5 py-4 rounded-2xl border-2 transition-all font-medium ${isEditing ? 'border-nocca-green bg-white' : 'border-gray-50 bg-gray-50 text-gray-700'}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Doğum Tarihi</label>
                      <input
                        type="text"
                        value={userProfile.birthDate}
                        readOnly
                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 text-gray-700 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Üyelik</label>
                      <input
                        type="text"
                        value={userProfile.joinDate}
                        readOnly
                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 text-gray-700 font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Rewards Summary in Content if on profile */}
              <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-nocca-green to-nocca-light-green text-white shadow-xl shadow-green-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div>
                    <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Kazanılan Puan</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black">{userProfile.points}</span>
                      <span className="text-lg font-bold opacity-80 uppercase tracking-widest">Puan</span>
                    </div>
                  </div>
                  <div className="flex-1 w-full max-w-xs">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2">
                      <span>{userProfile.level}</span>
                      <span>Sonraki Seviye</span>
                    </div>
                    <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden p-0.5">
                      <div className="bg-white h-full rounded-full" style={{ width: `${getLevelProgress()}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TERCIHLER TAB */}
          {activeTab === 'preferences' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-black text-gray-900 mb-8 pb-4 border-b border-gray-50">Hesap Tercihleri</h2>
              <div className="space-y-4">
                {[
                  { id: 'emailNotifications', label: 'E-posta Bildirimleri', desc: 'Promosyonlar ve kampanyalar hakkında bilgi alın.', val: userProfile.preferences.emailNotifications },
                  { id: 'smsNotifications', label: 'SMS Bildirimleri', desc: 'Siparişlerinizle ilgili SMS bilgilendirmesi.', val: userProfile.preferences.smsNotifications },
                  { id: 'promotionalEmails', label: 'Özel Teklifler', desc: 'Size özel hazırlanan fırsatları kaçırmayın.', val: userProfile.preferences.promotionalEmails },
                  { id: 'locationSharing', label: 'Konum Paylaşımı', desc: 'En yakın şubelerimizi keşfetmek için.', val: userProfile.preferences.locationSharing },
                ].map((pref) => (
                  <div key={pref.id} className="flex items-center justify-between p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all group">
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{pref.label}</p>
                      <p className="text-sm text-gray-500">{pref.desc}</p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange(pref.id as any, !pref.val)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${pref.val ? 'bg-nocca-green shadow-lg shadow-green-100' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-6 w-6 rounded-full bg-white transition-all transform ${pref.val ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADRESLER TAB */}
          {activeTab === 'addresses' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-gray-900">Kayıtlı Adresler</h2>
                <button
                  onClick={handleAddAddress}
                  className="bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-all flex items-center space-x-2"
                >
                  <span>+ Yeni Ekle</span>
                </button>
              </div>

              {userProfile.addresses.length === 0 ? (
                <div className="bg-gray-50 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                  <span className="text-5xl block mb-4">📍</span>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Henüz adres kaydetmediniz</h3>
                  <button onClick={handleAddAddress} className="text-nocca-green font-bold underline">İlk adresinizi hemen ekleyin</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userProfile.addresses.map((addr) => (
                    <div key={addr.id} className="p-6 rounded-3xl bg-white border-2 border-gray-50 hover:border-nocca-green transition-all group relative overflow-hidden shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <span className="p-3 bg-green-50 rounded-xl mr-3 group-hover:bg-nocca-green group-hover:text-white transition-colors">
                            <FaMapMarkerAlt />
                          </span>
                          <h4 className="font-black text-gray-800">{addr.title}</h4>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-gray-400 hover:text-nocca-green transition-colors"><FaEdit /></button>
                          <button className="text-gray-400 hover:text-red-500 transition-colors">×</button>
                        </div>
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed mb-4">{addr.address}</p>
                      {addr.isDefault && <span className="text-[10px] font-black uppercase tracking-widest text-nocca-green flex items-center"><span className="w-1.5 h-1.5 bg-nocca-green rounded-full mr-2"></span>Varsayılan Adres</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ÖDEME YÖNTEMLERİ TAB */}
          {activeTab === 'payment' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-gray-900">Ödeme Yöntemleri</h2>
                <button
                  onClick={handleAddPaymentMethod}
                  className="bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-all flex items-center space-x-2 shadow-lg shadow-gray-200"
                >
                  <span>+ Yeni Kart Ekle</span>
                </button>
              </div>

              {userProfile.paymentMethods.length === 0 ? (
                <div className="bg-gray-100/50 rounded-3xl p-16 text-center border-2 border-dashed border-gray-200">
                  <span className="text-5xl block mb-6 outline-none">💳</span>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Kayıtlı kartınız bulunmuyor</h3>
                  <p className="text-gray-500 mb-8 max-w-xs mx-auto text-sm">Hızlı ve güvenli ödeme için kredi veya banka kartınızı hemen ekleyebilirsiniz.</p>
                  <button
                    onClick={handleAddPaymentMethod}
                    className="bg-nocca-green text-white px-8 py-4 rounded-2xl font-black hover:scale-105 transition-transform"
                  >
                    YENİ KART EKLE
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userProfile.paymentMethods.map((method) => (
                    <div key={method.id} className="relative p-8 rounded-[2rem] bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden shadow-2xl group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl"></div>
                      <div className="flex justify-between items-start mb-12">
                        <div className="text-2xl italic font-black">{method.brand}</div>
                        <FaCreditCard className="text-3xl opacity-50" />
                      </div>
                      <div className="text-xl tracking-[0.2em] font-mono mb-8">•••• •••• •••• {method.lastFour}</div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[10px] opacity-50 uppercase font-black tracking-widest mb-1">SKT</p>
                          <p className="font-bold">{method.expiryDate}</p>
                        </div>
                        <div className="flex space-x-3">
                          <button className="text-xs font-black uppercase opacity-60 hover:opacity-100 transition-opacity">SİL</button>
                          {method.isDefault && <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black tracking-widest">VARSAYILAN</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FAVORİLER TAB */}
          {activeTab === 'favorites' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-black text-gray-900 mb-8 pb-4 border-b border-gray-50">❤️ Favori Ürünler</h2>

              {userProfile.favoriteProducts.length === 0 ? (
                <div className="text-center py-20 bg-pink-50/30 rounded-3xl border border-pink-100">
                  <span className="text-6xl block mb-6">☕</span>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Henüz favori lezzetiniz yok</h3>
                  <p className="text-gray-500 mb-8">En sevdiğiniz kahveleri favorilere ekleyerek hızlıca sipariş verebilirsiniz.</p>
                  <button onClick={() => window.location.href = '/menu'} className="bg-black text-white px-8 py-3 rounded-full font-bold">Menüyü Keşfet</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userProfile.favoriteProducts.map((product) => (
                    <div key={product.id} className="flex items-center p-4 bg-white border border-gray-100 rounded-3xl hover:shadow-xl transition-all group">
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-md mr-4">
                        <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-gray-900">{product.name}</h4>
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-tighter">{product.category}</p>
                        <p className="text-nocca-green font-black">₺{product.price.toFixed(2)}</p>
                      </div>
                      <button className="p-3 text-red-500 hover:bg-red-50 rounded-full transition-colors"><span className="text-xl">×</span></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Kaydet Butonu - Edit Modu Alt Kısım */}
        {isEditing && (
          <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleSaveProfile}
              className="bg-nocca-green text-white py-4 px-12 rounded-2xl font-black hover:scale-105 transition-transform shadow-lg shadow-green-100"
            >
              DEĞİŞİKLİKLERİ KAYDET
            </button>
          </div>
        )}
      </main>

      {/* Ödeme Yöntemi Ekleme Modalı */}
      {isAddingPayment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl p-10 max-w-md w-full animate-in zoom-in duration-300 relative">
            <button
              onClick={() => setIsAddingPayment(false)}
              className="absolute top-8 right-8 text-gray-400 hover:text-black hover:rotate-90 transition-all font-black text-2xl"
            >
              ×
            </button>

            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-3xl">💳</div>
              <h3 className="text-2xl font-black text-gray-900">Yeni Kart Ekle</h3>
              <p className="text-gray-500 text-sm">Hızlı ödeme için kart bilgilerinizi girin.</p>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-4">Kart Sahibi</label>
                  <input type="text" required placeholder="AD SOYAD" className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-nocca-green focus:bg-white rounded-2xl transition-all outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-4">Kart Numarası</label>
                  <input type="text" required placeholder="0000 0000 0000 0000" maxLength={19} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-nocca-green focus:bg-white rounded-2xl transition-all outline-none font-mono font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-4">SKT</label>
                    <input type="text" required placeholder="AA/YY" maxLength={5} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-nocca-green focus:bg-white rounded-2xl transition-all outline-none font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-4">CVV</label>
                    <input type="text" required placeholder="123" maxLength={3} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-nocca-green focus:bg-white rounded-2xl transition-all outline-none font-bold" />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full bg-nocca-green text-white py-5 rounded-3xl font-black text-lg hover:shadow-xl hover:shadow-green-100 transition-all hover:-translate-y-1"
                >
                  KARTI GÜVENLEYLE KAYDET
                </button>
                <div className="flex items-center justify-center mt-6 space-x-4 opacity-30 grayscale">
                  <span className="text-xs font-black tracking-widest">VISA</span>
                  <span className="text-xs font-black tracking-widest">MASTERCARD</span>
                  <span className="text-xs font-black tracking-widest">TROY</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileComponent;