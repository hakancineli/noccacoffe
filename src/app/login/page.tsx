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
  const [success, setSuccess] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    console.log('Login form submitted', { email, isLogin });

    if (!isLogin && !acceptedTerms) {
      setError('Lütfen sözleşmeleri onaylayınız.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload: LoginCredentials | RegisterCredentials = isLogin
        ? { email, password }
        : { email, password, firstName, lastName, phone };

      console.log('Sending request to:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (jsonError) {
        console.error('JSON Parse Error:', jsonError);
        throw new Error('Sunucudan geçersiz yanıt alındı');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      // Başarılı
      console.log('Login successful');
      localStorage.setItem('authToken', data.token);

      // Redirect Logic
      let targetUrl = '/'; // Default for CUSTOMER

      const role = data.role || data.user.role; // Handle potential structure differences

      if (['MANAGER', 'ADMIN'].includes(role)) {
        targetUrl = '/admin/orders';
      } else if (['BARISTA', 'WAITER'].includes(role)) {
        targetUrl = '/admin/pos';
      } else if (role === 'KITCHEN' || data.user.email === 'kitchen@noccacoffee.com') {
        targetUrl = '/kitchen';
      }

      setSuccess(`Giriş başarılı! Yönlendiriliyorsunuz: ${targetUrl}`);

      setTimeout(() => {
        // Force forceful redirect using browser API instead of Next.js router
        window.location.assign(targetUrl);
      }, 1000);

    } catch (err: any) {
      console.error('Login Process Error:', err);
      setError(err.message || 'Bağlantı hatası. Lütfen tekrar deneyin.');
      setLoading(false); // Only stop loading on error, keep loading on success for redirect
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
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
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
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm font-medium">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm font-medium">
                {success}
              </div>
            )}


            {/* Terms Checkbox for Register */}
            {!isLogin && (
              <div className="flex items-start my-4">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="focus:ring-nocca-green h-4 w-4 text-nocca-green border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-600">
                    <a href="/terms" target="_blank" className="font-medium text-[#704d39] hover:underline">Üyelik Sözleşmesi</a>,{' '}
                    <a href="/privacy" target="_blank" className="font-medium text-[#704d39] hover:underline">Gizlilik Politikası</a> ve{' '}
                    <a href="/kvkk" target="_blank" className="font-medium text-[#704d39] hover:underline">KVKK Metni</a>'ni okudum ve onaylıyorum.
                  </label>
                </div>
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={handleSubmit}
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
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-200"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-gray-700">Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('apple')}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-200"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 0-1.5-.67-1.5-1.5v-1c0-.83.67-1.5 1.5-1.5h1c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5h-1zm-2.56 0c-.83 0-1.5-.67-1.5-1.5v-1c0-.83.67-1.5 1.5-1.5h1c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5h-1z" />
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


        </div>
      </div>
    </div>
  );
};

export default LoginPage;