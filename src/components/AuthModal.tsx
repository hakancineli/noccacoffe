'use client';

import { useState } from 'react';
import { FaTimes, FaGoogle, FaApple } from 'react-icons/fa';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
}

const AuthModal = ({ isOpen, onClose, mode }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Burada authentication logic olacak
    console.log('Form submitted:', { email, password, name, phone, rememberMe, isLogin });
    // Başarılı olursa onClose() çağrılacak
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    console.log(`Social login with ${provider}`);
    // Sosyal medya login logic
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Kapat"
        >
          <FaTimes className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Giriş Yap' : 'Üye Ol'}
          </h2>
          <p className="text-gray-600">
            {isLogin 
              ? 'NOCCA REWARDS hesabınıza giriş yapın' 
              : 'NOCCA REWARDS ailesine katılın'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                />
              </div>
            </>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-posta
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Şifre
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
              required
            />
          </div>

          {isLogin && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-nocca-light-green focus:ring-nocca-light-green border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Beni hatırla
              </label>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-nocca-light-green text-white py-3 px-4 rounded-md hover:bg-nocca-green transition-colors font-semibold"
          >
            {isLogin ? 'Giriş Yap' : 'Üye Ol'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">VEYA</span>
          </div>
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          <button
            onClick={() => handleSocialLogin('google')}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <FaGoogle className="h-5 w-5 mr-2 text-red-500" />
            Google ile {isLogin ? 'Giriş Yap' : 'Üye Ol'}
          </button>
          
          <button
            onClick={() => handleSocialLogin('apple')}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <FaApple className="h-5 w-5 mr-2" />
            Apple ile {isLogin ? 'Giriş Yap' : 'Üye Ol'}
          </button>
        </div>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-nocca-light-green hover:text-nocca-green font-medium text-sm transition-colors"
          >
            {isLogin 
              ? 'Hesabınız yok mu? Üye olun' 
              : 'Zaten hesabınız var mı? Giriş yapın'
            }
          </button>
        </div>

        {/* Terms */}
        {!isLogin && (
          <p className="text-xs text-gray-500 text-center mt-4">
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
        )}
      </div>
    </div>
  );
};

export default AuthModal;