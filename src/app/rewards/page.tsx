'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function RewardsPage() {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('KAHVE5');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[400px] w-full">
        <Image
          src="/images/rewards-hero.jpg"
          alt="NOCCA REWARDS"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <h1 className="text-5xl font-bold text-white text-center">NOCCA REWARDS</h1>
        </div>
      </div>

      {/* Campaign Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-[#f1f8f5] rounded-lg overflow-hidden shadow-lg">
          <div className="md:flex">
            <div className="md:w-1/2 p-8 md:p-12">
              <h2 className="text-3xl font-bold text-[#1e3932] mb-4">
                Özel Kampanya
              </h2>
              <div className="space-y-4 text-lg text-gray-700 mb-6">
                <p>🎉 <span className="font-semibold">6. Kahve Hediye!</span></p>
                <p>☕ 6 kahve alana 5. kahvede %20 indirim</p>
                <p>🍰 5. kahve ile birlikte alınan tatlılarda %20 indirim</p>
                <p>🎁 6. kahve tamamen ücretsiz!</p>
                <p className="text-sm text-gray-500 mt-2">Kampanya 31 Aralık 2024 tarihine kadar geçerlidir.</p>
              </div>
              <div className="bg-white p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-lg mb-2">Kampanya Kodu:</h3>
                <div className="flex items-center">
                  <code className="bg-gray-100 px-4 py-2 rounded-md text-lg font-mono">
KAHVE5
                  </code>
                  <button 
                    className="ml-4 bg-[#1e3932] text-white px-4 py-2 rounded-md hover:bg-[#2c5a4d] transition-colors"
                    onClick={handleCopyCode}
                  >
                    {isCopied ? 'Kopyalandı!' : 'Kopyala'}
                  </button>
                </div>
              </div>
              <button className="bg-[#1e3932] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#2c5a4d] transition-colors">
                Kampanyayı Gör
              </button>
            </div>
            <div className="md:w-1/2 bg-[#d4e9e2] flex items-center justify-center p-8">
              <div className="relative w-full h-64 md:h-full">
                <Image
                  src="/images/new-year-coffee.jpg"
                  alt="Yeni Yıla Özel Kahve"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-[#1e3932] mb-12">Nasıl Çalışır?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: '1',
                title: 'Üye Ol',
                description: 'NOCCA REWARDS\'a ücretsiz üye olun.'
              },
              {
                number: '2',
                title: 'Puan Topla',
                description: 'Her alışverişinizde puan kazanın.'
              },
              {
                number: '3',
                title: 'Ödülleri Keşfet',
                description: 'Kazandığınız puanlarla ödüllerinizi alın.'
              }
            ].map((step, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-[#1e3932] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
