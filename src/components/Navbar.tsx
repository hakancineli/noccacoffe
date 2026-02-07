'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaBars, FaTimes, FaShoppingBag, FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import { useCart } from '@/contexts/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; firstName?: string; lastName?: string; role?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { totalItems, setIsCartOpen } = useCart();

  // Dropdown dışına tıklandığında kapatma
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setUser(null);
          setIsAdmin(false);
          return;
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser({
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role
          });
          const staffRoles = ['MANAGER', 'BARISTA', 'WAITER', 'KITCHEN'];
          setIsAdmin(data.email === 'admin@noccacoffee.com' || staffRoles.includes(data.role));
        } else {
          // Token invalid or expired
          localStorage.removeItem('authToken');
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        setUser(null);
        setIsAdmin(false);
      }
    };

    fetchUserProfile();

    // Add event listener for storage changes to sync across tabs or login/logout events
    const handleStorageChange = () => {
      fetchUserProfile();
    };

    window.addEventListener('storage', handleStorageChange);
    // Custom event for same-tab updates if needed (optional but good practice)
    window.addEventListener('auth-change', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // API call to clear cookie
      await fetch('/api/auth/logout', { method: 'POST' });

      // Clear local storage
      localStorage.removeItem('authToken');

      // Reset state
      setIsAdmin(false);
      setIsProfileOpen(false);
      setUser(null);

      // Dispatch event to update other components if needed
      window.dispatchEvent(new Event('auth-change'));

      // Redirect
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed', error);
      // Fallback
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
  };

  const menuItems = [
    { name: 'MENÜ', href: '/menu' },
    { name: 'KAHVE', href: '/coffee' },
    { name: 'NOCCA REWARDS', href: '/rewards' },
    { name: 'FRANCHISING', href: '/franchising' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center" aria-label="Ana Sayfa">
              <div className="relative w-14 h-14">
                <Image
                  src="/images/logo/noccacoffee.jpeg"
                  alt="NOCCA COFFEE Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="ml-3 text-2xl font-bold text-[#704d39] hidden sm:block">NOCCA COFFEE</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center justify-center flex-1 px-8">
            <div className="flex space-x-2">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-nocca-green px-4 py-2 text-base font-medium transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Store Location - Responsive */}
            <a
              href="https://www.google.com/maps/search/?api=1&query=Fevzi+çakmak+mahallesi,Yıldırım+Beyazıt+Caddesi,+no:+84+Bahçelievler,+Istanbul,+Turkey"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-700 hover:text-nocca-green transition-colors duration-200"
              aria-label="Mağaza Bul"
              title="Mağaza Bul"
            >
              <FaMapMarkerAlt className="h-5 w-5 sm:h-6 sm:w-6" />
            </a>

            {/* Profile - Responsive */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 text-gray-700 hover:text-nocca-green transition-colors duration-200"
                aria-label="Hesabım"
                title="Hesabım"
              >
                <FaUser className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              {/* Profil Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 md:right-0 md:left-auto left-1/2 md:left-auto transform md:transform-none -translate-x-1/2 md:-translate-x-0">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12">
                        <Image
                          src="/images/logo/noccacoffee.jpeg"
                          alt="Profil"
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{user?.email || 'Giriş Yapılmadı'}</p>
                        <p className="text-sm text-gray-600">Gümüş Seviye</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsProfileOpen(false);
                        console.log('Navigating to profile');
                        router.push('/profile');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Profilim
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsProfileOpen(false);
                        console.log('Navigating to rewards');
                        router.push('/rewards');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      NOCCA REWARDS
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsProfileOpen(false);
                        console.log('Navigating to orders');
                        router.push('/orders');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Siparişlerim
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsProfileOpen(false);
                        console.log('Navigating to settings');
                        router.push('/settings');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Ayarlar
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsProfileOpen(false);
                            console.log('Navigating to admin');
                            router.push('/admin');
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100 rounded-md transition-colors font-medium"
                        >
                          🛠️ Admin Paneli
                        </button>
                        <hr className="my-2" />
                      </>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Shopping Cart - Responsive */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-gray-700 hover:text-nocca-green relative transition-colors duration-200"
              aria-label="Sepetim"
              title="Sepetim"
            >
              <FaShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-nocca-green text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-nocca-green hover:bg-gray-100 focus:outline-none transition-colors duration-200"
              aria-label={isOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
              title={isOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
            >
              {isOpen ? (
                <FaTimes className="block h-7 w-7" />
              ) : (
                <FaBars className="block h-7 w-7" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1 px-4">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-nocca-green rounded-md transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
