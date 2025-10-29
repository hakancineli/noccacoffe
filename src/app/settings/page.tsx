'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaBell, FaShieldAlt, FaPalette, FaGlobe, FaQuestionCircle, FaEnvelope, FaLock } from 'react-icons/fa';

interface Settings {
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    promotionalEmails: boolean;
    orderUpdates: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    dataSharing: boolean;
    locationSharing: boolean;
    analyticsTracking: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    language: 'tr' | 'en';
    fontSize: 'small' | 'medium' | 'large';
  };
  security: {
    twoFactorAuth: boolean;
    loginAlerts: boolean;
    sessionTimeout: number;
  };
}

const SettingsPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'privacy' | 'appearance' | 'security'>('notifications');
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      promotionalEmails: true,
      orderUpdates: true
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      locationSharing: true,
      analyticsTracking: true
    },
    appearance: {
      theme: 'light',
      language: 'tr',
      fontSize: 'medium'
    },
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
      sessionTimeout: 30
    }
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
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

  const handleSettingChange = (category: keyof Settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setSaveStatus('saving');
    
    // Simüle edilen API çağrısı
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 1000);
  };

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

  const tabs = [
    { id: 'notifications', label: 'Bildirimler', icon: FaBell },
    { id: 'privacy', label: 'Gizlilik', icon: FaShieldAlt },
    { id: 'appearance', label: 'Görünüm', icon: FaPalette },
    { id: 'security', label: 'Güvenlik', icon: FaLock }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ayarlar</h1>
          <p className="mt-2 text-gray-600">Hesap ayarlarınızı yönetin ve kişiselleştirin</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-nocca-light-green text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* Bildirimler */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Bildirim Ayarları</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">E-posta Bildirimleri</p>
                        <p className="text-sm text-gray-600">Önemli güncellemeler hakkında e-posta alın</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('notifications', 'emailNotifications', !settings.notifications.emailNotifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.notifications.emailNotifications ? 'bg-nocca-light-green' : 'bg-gray-200'
                        }`}
                      >
                        <span className="sr-only">E-posta bildirimleri</span>
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
                            settings.notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        ></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Push Bildirimleri</p>
                        <p className="text-sm text-gray-600">Mobil uygulama bildirimleri</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('notifications', 'pushNotifications', !settings.notifications.pushNotifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.notifications.pushNotifications ? 'bg-nocca-light-green' : 'bg-gray-200'
                        }`}
                      >
                        <span className="sr-only">Push bildirimleri</span>
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
                            settings.notifications.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        ></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">SMS Bildirimleri</p>
                        <p className="text-sm text-gray-600">Önemli güncellemeler hakkında SMS alın</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('notifications', 'smsNotifications', !settings.notifications.smsNotifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.notifications.smsNotifications ? 'bg-nocca-light-green' : 'bg-gray-200'
                        }`}
                      >
                        <span className="sr-only">SMS bildirimleri</span>
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
                            settings.notifications.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        ></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Promosyon E-postaları</p>
                        <p className="text-sm text-gray-600">Kampanya ve teklifler hakkında bilgi alın</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('notifications', 'promotionalEmails', !settings.notifications.promotionalEmails)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.notifications.promotionalEmails ? 'bg-nocca-light-green' : 'bg-gray-200'
                        }`}
                      >
                        <span className="sr-only">Promosyon e-postaları</span>
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
                            settings.notifications.promotionalEmails ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        ></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Sipariş Güncellemeleri</p>
                        <p className="text-sm text-gray-600">Sipariş durumunuz hakkında bilgi alın</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('notifications', 'orderUpdates', !settings.notifications.orderUpdates)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.notifications.orderUpdates ? 'bg-nocca-light-green' : 'bg-gray-200'
                        }`}
                      >
                        <span className="sr-only">Sipariş güncellemeleri</span>
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
                            settings.notifications.orderUpdates ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        ></span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Gizlilik */}
              {activeTab === 'privacy' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Gizlilik Ayarları</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <p className="font-medium text-gray-900 mb-3">Profil Görünürlüğü</p>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="profileVisibility"
                            value="public"
                            checked={settings.privacy.profileVisibility === 'public'}
                            onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                            className="mr-2"
                          />
                          <span>Herkese Açık</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="profileVisibility"
                            value="private"
                            checked={settings.privacy.profileVisibility === 'private'}
                            onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                            className="mr-2"
                          />
                          <span>Özel</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Veri Paylaşımı</p>
                        <p className="text-sm text-gray-600">Verilerinizin analiz için paylaşılmasına izin verin</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('privacy', 'dataSharing', !settings.privacy.dataSharing)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.privacy.dataSharing ? 'bg-nocca-light-green' : 'bg-gray-200'
                        }`}
                      >
                        <span className="sr-only">Veri paylaşımı</span>
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
                            settings.privacy.dataSharing ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        ></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Konum Paylaşımı</p>
                        <p className="text-sm text-gray-600">Yakındaki mağazaları göstermek için konumunuzu kullanın</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('privacy', 'locationSharing', !settings.privacy.locationSharing)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.privacy.locationSharing ? 'bg-nocca-light-green' : 'bg-gray-200'
                        }`}
                      >
                        <span className="sr-only">Konum paylaşımı</span>
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
                            settings.privacy.locationSharing ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        ></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Analiz Takibi</p>
                        <p className="text-sm text-gray-600">Kullanım verilerinizin toplanmasına izin verin</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('privacy', 'analyticsTracking', !settings.privacy.analyticsTracking)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.privacy.analyticsTracking ? 'bg-nocca-light-green' : 'bg-gray-200'
                        }`}
                      >
                        <span className="sr-only">Analiz takibi</span>
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
                            settings.privacy.analyticsTracking ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        ></span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Görünüm */}
              {activeTab === 'appearance' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Görünüm Ayarları</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <p className="font-medium text-gray-900 mb-3">Tema</p>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="theme"
                            value="light"
                            checked={settings.appearance.theme === 'light'}
                            onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                            className="mr-2"
                          />
                          <span>Açık</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="theme"
                            value="dark"
                            checked={settings.appearance.theme === 'dark'}
                            onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                            className="mr-2"
                          />
                          <span>Koyu</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="theme"
                            value="auto"
                            checked={settings.appearance.theme === 'auto'}
                            onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                            className="mr-2"
                          />
                          <span>Otomatik</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-gray-900 mb-3">Dil</p>
                      <select
                        value={settings.appearance.language}
                        onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green"
                        aria-label="Dil seçimi"
                      >
                        <option value="tr">Türkçe</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div>
                      <p className="font-medium text-gray-900 mb-3">Yazı Boyutu</p>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="fontSize"
                            value="small"
                            checked={settings.appearance.fontSize === 'small'}
                            onChange={(e) => handleSettingChange('appearance', 'fontSize', e.target.value)}
                            className="mr-2"
                          />
                          <span>Küçük</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="fontSize"
                            value="medium"
                            checked={settings.appearance.fontSize === 'medium'}
                            onChange={(e) => handleSettingChange('appearance', 'fontSize', e.target.value)}
                            className="mr-2"
                          />
                          <span>Orta</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="fontSize"
                            value="large"
                            checked={settings.appearance.fontSize === 'large'}
                            onChange={(e) => handleSettingChange('appearance', 'fontSize', e.target.value)}
                            className="mr-2"
                          />
                          <span>Büyük</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Güvenlik */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Güvenlik Ayarları</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">İki Faktörlü Kimlik Doğrulama</p>
                        <p className="text-sm text-gray-600">Hesabınız için ek güvenlik katmanı ekleyin</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('security', 'twoFactorAuth', !settings.security.twoFactorAuth)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.security.twoFactorAuth ? 'bg-nocca-light-green' : 'bg-gray-200'
                        }`}
                      >
                        <span className="sr-only">İki faktörlü kimlik doğrulama</span>
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
                            settings.security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        ></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Giriş Uyarıları</p>
                        <p className="text-sm text-gray-600">Yeni cihazlardan giriş yapıldığında bildirim alın</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('security', 'loginAlerts', !settings.security.loginAlerts)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.security.loginAlerts ? 'bg-nocca-light-green' : 'bg-gray-200'
                        }`}
                      >
                        <span className="sr-only">Giriş uyarıları</span>
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
                            settings.security.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        ></span>
                      </button>
                    </div>

                    <div>
                      <p className="font-medium text-gray-900 mb-3">Oturum Zaman Aşımı (dakika)</p>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green"
                        aria-label="Oturum zaman aşımı süresi"
                        placeholder="Oturum zaman aşımı süresi (dakika)"
                      />
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="font-medium text-gray-900 mb-4">Hesap İşlemleri</h3>
                      <div className="space-y-3">
                        <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <FaLock className="h-5 w-5 text-gray-600" />
                              <span>Şifre Değiştir</span>
                            </div>
                            <span className="text-gray-400">→</span>
                          </div>
                        </button>
                        
                        <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <FaShieldAlt className="h-5 w-5 text-gray-600" />
                              <span>Güvenlik Geçmişi</span>
                            </div>
                            <span className="text-gray-400">→</span>
                          </div>
                        </button>
                        
                        <button className="w-full text-left px-4 py-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-red-600">Hesabı Sil</span>
                            </div>
                            <span className="text-red-400">→</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Kaydet Butonu */}
              <div className="p-6 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    {saveStatus === 'saved' && (
                      <p className="text-sm text-green-600">Ayarlar başarıyla kaydedildi!</p>
                    )}
                    {saveStatus === 'error' && (
                      <p className="text-sm text-red-600">Ayarlar kaydedilemedi. Lütfen tekrar deneyin.</p>
                    )}
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    disabled={saveStatus === 'saving'}
                    className={`px-6 py-2 rounded-md font-medium transition-colors ${
                      saveStatus === 'saving'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-nocca-light-green text-white hover:bg-nocca-green'
                    }`}
                  >
                    {saveStatus === 'saving' ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;