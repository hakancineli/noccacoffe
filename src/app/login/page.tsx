'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaTimes, FaGoogle, FaApple, FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import { RegisterCredentials, LoginCredentials } from '@/lib/auth';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload: LoginCredentials | RegisterCredentials = isLogin
        ? { email, password }
        : { email, password, firstName, lastName, phone };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Bir hata oluştu');
        setLoading(false);
        return;
      }

      // Başarılı olursa token'i localStorage'a kaydet
      localStorage.setItem('authToken', data.token);
      
      // Ana sayfaya yönlendir
      router.push('/');
    } catch (err) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    console.log(`Social login with ${provider}`);
    // Sosyal medya login logic (ileride implement edilecek)
    setError('Sosyal medya girişi yakında eklenecek');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e8f5ea] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo Section */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center">
            <div className="w-16 h-16 bg-[#704d39] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              ☕
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'HOŞ GELDİNİZ' : 'HOŞ GELDİNİZ'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin 
              ? 'NOCCA REWARDS hesabınıza giriş yapın' 
              : 'NOCCA REWARDS ailesine katılın ve özel teklifler kazanın'
            }
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Ad
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#704d39] focus:border-[#704d39] sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Soyad
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#704d39] focus:border-[#704d39] sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#704d39] focus:border-[#704d39] sm:text-sm"
                  />
                </div>
              </>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-posta adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-3 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#704d39] focus:border-[#704d39] sm:text-sm"
                  placeholder="ornek@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-3 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#704d39] focus:border-[#704d39] sm:text-sm"
                  required
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-[#704d39] focus:ring-[#704d39] border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                    Beni hatırla
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-[#704d39] hover:text-[#5a3d2a]">
                    Şifrenizi mi unuttunuz?
                  </a>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#704d39] hover:bg-[#5a3d2a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#704d39] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    İşleniyor...
                  </span>
                ) : (
                  isLogin ? 'GİRİŞ YAP' : 'ÜYE OL'
                )}
              </button>
            </div>
          </form>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">VEYA</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                onClick={() => handleSocialLogin('google')}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-200"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-6.66-5.4-12-12.05-12-12.05 5.4 0 12 5.4 12 12.05zm-10.96 5.4c-1.1 0-2.05-.85-2.85-.85-1.1 0-2.05.85-2.85.85-2.05.85 2.05.85 1.1 0 2.05-.85 2.85.85 2.05.85 1.1zm0 1.05c0 2.2.8 2.2 2.2 0 4.4-2.2 2.2-2.2zm-1.05 2.2c0 1.05-.45 1.95-.95 1.95-.45 0-1.05-.45-1.95.95-1.95.45 0-1.05.45-1.95.95 1.95z"/>
                </svg>
                <span className="text-gray-700">Google</span>
              </button>

              <button
                onClick={() => handleSocialLogin('apple')}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-200"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#000000" d="M18.71 19.5c-.83 0-1.5-.67-1.5-1.5v-1c0-.83.67-1.5 1.5-1.5h-1c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5h1c.83 0 1.5-.67 1.5-1.5zm-2.56 0c-.83 0-1.5-.67-1.5-1.5v-1c0-.83.67-1.5 1.5-1.5h-1c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5h1c.83 0 1.5-.67 1.5-1.5zm1.5 1.5c0 .83.67 1.5 1.5v1c0 .83.67 1.5 1.5h1c.83 0 1.5-.67 1.5-1.5zm0 1.5c0 .83.67 1.5 1.5v1c0 .83-.67 1.5 1.5h1c.83 0 1.5-.67 1.5-1.5zm1.5 1.5c0 .83.67 1.5 1.5v1c0 .83-.67 1.5 1.5h1c.83 0 1.5-.67 1.5-1.5z"/>
                </svg>
                <span className="text-gray-700">Apple</span>
              </button>
            </div>
          </div>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-[#704d39] hover:text-[#5a3d2a] transition-colors duration-200"
            >
              {isLogin 
                ? 'Hesabınız yok mu? Üye olun' 
                : 'Zaten hesabınız var mı? Giriş yapın'
              }
            </button>
          </div>

          {!isLogin && (
            <div className="mt-4 text-xs text-gray-500 text-center">
              Üye olarak{' '}
              <a href="#" className="text-[#704d39] hover:text-[#5a3d2a]">
                Kullanım Koşulları
              </a>
              {' '}ve{' '}
              <a href="#" className="text-[#704d39] hover:text-[#5a3d2a]">
                Gizlilik Politikası
              </a>
              {' '}nı kabul etmiş olursunuz.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;