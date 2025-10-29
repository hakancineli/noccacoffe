'use client';

import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  const footerLinks = [
    {
      title: 'Hakkımızda',
      links: [
        { name: 'Şirketimiz', href: '/about' },
        { name: 'Kariyer', href: '/careers' },
        { name: 'Kurumsal Satış', href: '/corporate' },
        { name: 'Haberler', href: '/news' },
      ],
    },
    {
      title: 'Yardım',
      links: [
        { name: 'Sıkça Sorulan Sorular', href: '/faq' },
        { name: 'İletişim', href: '/contact' },
        { name: 'Mağaza Bul', href: '/store-locator' },
      ],
    },
    {
      title: 'NOCCA REWARDS',
      links: [
        { name: 'Hesabım', href: '/account' },
        { name: 'Kazanılan Yıldızlar', href: '/rewards' },
        { name: 'Kampanyalar', href: '/campaigns' },
      ],
    },
  ];

  return (
    <footer className="bg-starbucks-light-green text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {footerLinks.map((section, index) => (
            <div key={index} className="mb-8 md:mb-0">
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.href} className="text-gray-300 hover:text-white transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Bizi Takip Edin</h3>
            <div className="flex space-x-4">
              <a href="https://facebook.com/starbucksturkiye" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <FaFacebook className="h-6 w-6" />
              </a>
              <a href="https://twitter.com/StarbucksTR" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <FaTwitter className="h-6 w-6" />
              </a>
              <a href="https://instagram.com/starbucksturkiye" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <FaInstagram className="h-6 w-6" />
              </a>
              <a href="https://youtube.com/starbucksturkiye" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <FaYoutube className="h-6 w-6" />
              </a>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Mobil Uygulama</h3>
              <div className="flex space-x-4">
                <a href="#" className="block">
                  <img 
                    src="/images/app-store.png" 
                    alt="App Store" 
                    className="h-10"
                  />
                </a>
                <a href="#" className="block">
                  <img 
                    src="/images/play-store.png" 
                    alt="Google Play" 
                    className="h-10"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} Starbucks Coffee Company. Tüm hakları saklıdır.
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-white">Gizlilik Politikası</Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-white">Kullanım Koşulları</Link>
              <Link href="/cookies" className="text-sm text-gray-400 hover:text-white">Çerez Tercihleri</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
