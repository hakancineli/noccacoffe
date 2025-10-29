'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PointsTransaction {
  id: string;
  type: 'EARNED' | 'REDEEMED' | 'BONUS';
  amount: number;
  description: string;
  date: string;
  relatedProduct?: string;
}

interface LoyaltyLevel {
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  benefits: string[];
  icon: string;
}

const PointsSystem = () => {
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [currentTier, setCurrentTier] = useState<'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'>('BRONZE');
  const [pointsToNextLevel, setPointsToNextLevel] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch user points and transactions from API
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Fetch user points
      const pointsResponse = await fetch('/api/points');
      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json();
        setCurrentPoints(pointsData.points);
        setCurrentTier(pointsData.tier);

        // Calculate points to next level
        const tierThresholds = {
          BRONZE: { min: 0, max: 999, next: 1000 },
          SILVER: { min: 1000, max: 4999, next: 5000 },
          GOLD: { min: 5000, max: 9999, next: 10000 },
          PLATINUM: { min: 10000, max: Infinity, next: 10000 }
        };

        const currentTierData = tierThresholds[pointsData.tier as keyof typeof tierThresholds];
        const pointsToNext = currentTierData ? currentTierData.next - pointsData.points : 0;
        setPointsToNextLevel(Math.max(0, pointsToNext));
      }

      // Fetch user transactions
      const meResponse = await fetch('/api/auth/me');
      if (meResponse.ok) {
        const meData = await meResponse.json();
        const formattedTransactions = meData.user.pointTransactions.map((transaction: any) => ({
          id: transaction.id,
          type: transaction.transactionType,
          amount: transaction.points,
          description: transaction.description || '',
          date: new Date(transaction.createdAt).toLocaleString('tr-TR'),
          relatedProduct: transaction.referenceId
        }));
        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loyaltyLevels: LoyaltyLevel[] = [
    {
      name: 'BRONZE',
      minPoints: 0,
      maxPoints: 999,
      color: 'bg-orange-500',
      benefits: ['%5 indirim', 'Doğum günü hediyesi', 'Özel kampanyalar'],
      icon: '🥉'
    },
    {
      name: 'SILVER',
      minPoints: 1000,
      maxPoints: 4999,
      color: 'bg-gray-400',
      benefits: ['%10 indirim', 'Ücretsiz yükseltme', 'Öncelikli destek'],
      icon: '🥈'
    },
    {
      name: 'GOLD',
      minPoints: 5000,
      maxPoints: 9999,
      color: 'bg-yellow-500',
      benefits: ['%15 indirim', 'Çift puan günleri', 'VIP etkinlikler'],
      icon: '🥇'
    },
    {
      name: 'PLATINUM',
      minPoints: 10000,
      maxPoints: Infinity,
      color: 'bg-purple-500',
      benefits: ['%20 indirim', 'Ücretsiz teslimat', 'Kişisel danışman'],
      icon: '🏆'
    }
  ];

  // Update current level based on tier
  useEffect(() => {
    const level = loyaltyLevels.find(l => l.name === currentTier);
    if (level) {
      const nextLevelIndex = loyaltyLevels.findIndex(l => l.name === currentTier) + 1;
      if (nextLevelIndex < loyaltyLevels.length) {
        const nextLevel = loyaltyLevels[nextLevelIndex];
        setPointsToNextLevel(Math.max(0, nextLevel.minPoints - currentPoints));
      } else {
        setPointsToNextLevel(0); // Platin seviyesinde
      }
    }
  }, [currentTier]);

  const calculatePointsForPurchase = (amount: number) => {
    return Math.floor(amount * 0.1); // Her 1 TL için 1 puan
  };

  const simulatePurchase = async (productName: string, price: number) => {
    const pointsEarned = calculatePointsForPurchase(price);
    
    try {
      const response = await fetch('/api/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          points: pointsEarned,
          transactionType: 'EARNED',
          description: `${productName} alımı`,
          referenceId: productName
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentPoints(data.points);
        // Refresh transactions
        fetchUserData();
      } else {
        const errorData = await response.json();
        alert(`Hata: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Purchase simulation error:', error);
      alert('İşlem sırasında bir hata oluştu');
    }
  };

  const simulateRewardRedemption = async (rewardName: string, pointsCost: number) => {
    try {
      // First, get available rewards to find the correct reward ID
      const rewardsResponse = await fetch('/api/rewards');
      if (rewardsResponse.ok) {
        const rewardsData = await rewardsResponse.json();
        const reward = rewardsData.rewards.find((r: any) => r.name === rewardName);
        
        if (!reward) {
          alert('Ödül bulunamadı');
          return;
        }

        const response = await fetch('/api/rewards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rewardId: reward.id
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentPoints(data.remainingPoints);
          // Refresh transactions
          fetchUserData();
          alert(`${rewardName} başarıyla kullanıldı!`);
        } else {
          const errorData = await response.json();
          alert(`Hata: ${errorData.error}`);
        }
      }
    } catch (error) {
      console.error('Reward redemption error:', error);
      alert('Ödül kullanılırken bir hata oluştu');
    }
  };

  return (
    <div className="space-y-8">
      {/* Puan Özeti */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Puan Sistemi</h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-nocca-green mb-2">
              {currentPoints.toLocaleString('tr-TR')}
            </div>
            <p className="text-gray-600">Mevcut Puan</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {currentTier}
            </div>
            <p className="text-gray-600">Seviye</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500 mb-2">
              {pointsToNextLevel.toLocaleString('tr-TR')}
            </div>
            <p className="text-gray-600">Sıradaki Seviye İçin</p>
          </div>
        </div>
      </div>

      {/* Sadakat Seviyeleri */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Sadakat Seviyeleri</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loyaltyLevels.map((level, index) => (
            <div 
              key={level.name}
              className={`p-4 rounded-lg border-2 transition-all ${
                currentTier === level.name
                  ? `${level.color} text-white border-white shadow-lg transform scale-105` 
                  : 'bg-gray-50 border-gray-200 hover:border-nocca-light-green'
              }`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{level.icon}</div>
                <h4 className="font-bold mb-2">{level.name}</h4>
                <p className="text-sm mb-3 opacity-90">
                  {level.minPoints.toLocaleString('tr-TR')} - {level.maxPoints === Infinity ? '∞' : level.maxPoints.toLocaleString('tr-TR')} puan
                </p>
                
                <div className="text-xs space-y-1">
                  <p className="font-semibold">Avantajlar:</p>
                  {level.benefits.map((benefit, benefitIndex) => (
                    <p key={benefitIndex} className="flex items-center">
                      <span className="mr-1">✓</span>
                      {benefit}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Puan Hareketleri */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Puan Hareketleri</h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-nocca-light-green text-white rounded-md hover:bg-nocca-green transition-colors">
              Tümü
            </button>
            <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
              Kazanılan
            </button>
            <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
              Harcanılan
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Tarih</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">İşlem</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Açıklama</th>
                <th className="text-right p-3 text-sm font-semibold text-gray-700">Puan</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="p-3 text-sm">{transaction.date}</td>
                  <td className="p-3 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'EARNED' ? 'bg-green-100 text-green-800' :
                      transaction.type === 'REDEEMED' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {transaction.type === 'EARNED' ? 'Kazanılan' :
                       transaction.type === 'REDEEMED' ? 'Harcanılan' : 'Bonus'}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    {transaction.description}
                    {transaction.relatedProduct && (
                      <span className="block text-xs text-gray-500 mt-1">
                        Ürün: {transaction.relatedProduct}
                      </span>
                    )}
                  </td>
                  <td className={`p-3 text-sm text-right font-semibold ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simülasyon Butonları */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Puan Simülasyonu</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-4">Alışveriş Simülasyonu</h4>
            <div className="space-y-3">
              <button
                onClick={() => simulatePurchase('Caffè Latte', 45.90)}
                className="w-full bg-gray-100 hover:bg-gray-200 p-3 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center">
                  <Image
                    src="/images/products/CaffeLatte.jpeg"
                    alt="Caffè Latte"
                    width={40}
                    height={40}
                    className="object-cover rounded mr-3"
                  />
                  <div>
                    <p className="font-medium">Caffè Latte - ₺45.90</p>
                    <p className="text-sm text-gray-600">+5 puan kazan</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => simulatePurchase('Caramel Macchiato', 54.90)}
                className="w-full bg-gray-100 hover:bg-gray-200 p-3 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center">
                  <Image
                    src="/images/products/caramel-macchiato.jpg"
                    alt="Caramel Macchiato"
                    width={40}
                    height={40}
                    className="object-cover rounded mr-3"
                  />
                  <div>
                    <p className="font-medium">Caramel Macchiato - ₺54.90</p>
                    <p className="text-sm text-gray-600">+5 puan kazan</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Ödül Simülasyonu</h4>
            <div className="space-y-3">
              <button
                onClick={() => simulateRewardRedemption('Ücretsiz Latte', 500)}
                className="w-full bg-nocca-light-green hover:bg-nocca-green text-white p-3 rounded-lg text-left transition-colors"
                disabled={currentPoints < 500}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Ücretsiz Latte</p>
                    <p className="text-sm opacity-90">500 puan</p>
                  </div>
                  {currentPoints >= 500 ? (
                    <span className="text-white">✓</span>
                  ) : (
                    <span className="text-yellow-200">✗</span>
                  )}
                </div>
              </button>
              
              <button
                onClick={() => simulateRewardRedemption('%20 İndirim Kuponu', 1000)}
                className="w-full bg-nocca-light-green hover:bg-nocca-green text-white p-3 rounded-lg text-left transition-colors"
                disabled={currentPoints < 1000}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">%20 İndirim Kuponu</p>
                    <p className="text-sm opacity-90">1000 puan</p>
                  </div>
                  {currentPoints >= 1000 ? (
                    <span className="text-white">✓</span>
                  ) : (
                    <span className="text-yellow-200">✗</span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsSystem;