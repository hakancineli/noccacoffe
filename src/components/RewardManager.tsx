'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: 'PRODUCT' | 'DISCOUNT' | 'VOUCHER' | 'EXPERIENCE';
  image?: string;
  validUntil?: string;
  isAvailable: boolean;
  usageLimit?: number;
  usageCount?: number;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  type: 'POINTS_MULTIPLIER' | 'BONUS_POINTS' | 'FREE_PRODUCT' | 'DISCOUNT';
  value: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  targetAudience: 'ALL' | 'LEVEL_BASED' | 'NEW_CUSTOMERS';
  image?: string;
}

const RewardManager = () => {
  const [activeTab, setActiveTab] = useState<'rewards' | 'campaigns' | 'create'>('rewards');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch rewards from API
  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await fetch('/api/rewards');
      if (response.ok) {
        const data = await response.json();
        setRewards(data.rewards);
      }
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const [newReward, setNewReward] = useState<Partial<Reward>>({
    title: '',
    description: '',
    pointsCost: 0,
    category: 'PRODUCT',
    isAvailable: true,
    usageLimit: 1
  });

  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    title: '',
    description: '',
    type: 'POINTS_MULTIPLIER',
    value: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
    targetAudience: 'ALL'
  });

  const handleCreateReward = async () => {
    if (newReward.title && newReward.description && newReward.pointsCost && newReward.pointsCost > 0) {
      try {
        const response = await fetch('/api/rewards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newReward.title,
            description: newReward.description,
            type: (newReward.category || 'PRODUCT').toUpperCase(),
            pointsCost: newReward.pointsCost,
            imageUrl: newReward.image,
            isActive: true
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Refresh rewards list
          fetchRewards();
          setNewReward({
            title: '',
            description: '',
            pointsCost: 0,
            category: 'PRODUCT',
            isAvailable: true,
            usageLimit: 1
          });
          alert('Ödül başarıyla oluşturuldu!');
        } else {
          const errorData = await response.json();
          alert(`Hata: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Create reward error:', error);
        alert('Ödül oluşturulurken bir hata oluştu');
      }
    }
  };

  const handleCreateCampaign = async () => {
    if (newCampaign.title && newCampaign.description && newCampaign.value) {
      try {
        const response = await fetch('/api/rewards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newCampaign.title,
            description: newCampaign.description,
            type: (newCampaign.type || 'POINTS_MULTIPLIER').toUpperCase(),
            targetAudience: (newCampaign.targetAudience || 'ALL').toUpperCase(),
            startDate: newCampaign.startDate,
            endDate: newCampaign.endDate,
            isActive: true
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Refresh rewards list to get campaigns
          fetchRewards();
          setNewCampaign({
            title: '',
            description: '',
            type: 'POINTS_MULTIPLIER',
            value: 1,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isActive: true,
            targetAudience: 'ALL'
          });
          alert('Kampanya başarıyla oluşturuldu!');
        } else {
          const errorData = await response.json();
          alert(`Hata: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Create campaign error:', error);
        alert('Kampanya oluşturulurken bir hata oluştu');
      }
    }
  };

  const toggleRewardAvailability = async (id: string) => {
    try {
      const response = await fetch('/api/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rewardId: id
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh rewards list
        fetchRewards();
      } else {
        const errorData = await response.json();
        alert(`Hata: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Toggle reward availability error:', error);
      alert('Ödül durumu güncellenirken bir hata oluştu');
    }
  };

  const toggleCampaignStatus = async (id: string) => {
    try {
      const response = await fetch('/api/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rewardId: id
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh rewards list to get campaigns
        fetchRewards();
      } else {
        const errorData = await response.json();
        alert(`Hata: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Toggle campaign status error:', error);
      alert('Kampanya durumu güncellenirken bir hata oluştu');
    }
  };

  const deleteReward = async (id: string) => {
    try {
      const response = await fetch('/api/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rewardId: id,
          action: 'delete'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh rewards list
        fetchRewards();
      } else {
        const errorData = await response.json();
        alert(`Hata: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Delete reward error:', error);
      alert('Ödül silinirken bir hata oluştu');
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      const response = await fetch('/api/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rewardId: id,
          action: 'delete'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh rewards list to get campaigns
        fetchRewards();
      } else {
        const errorData = await response.json();
        alert(`Hata: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Delete campaign error:', error);
      alert('Kampanya silinirken bir hata oluştu');
    }
  };

  const getCategoryIcon = (category: Reward['category']) => {
    switch (category) {
      case 'PRODUCT': return '🎁';
      case 'DISCOUNT': return '🎫';
      case 'VOUCHER': return '🎟';
      case 'EXPERIENCE': return '⭐';
      default: return '🎁';
    }
  };

  const getCampaignTypeIcon = (type: Campaign['type']) => {
    switch (type) {
      case 'POINTS_MULTIPLIER': return '✖️';
      case 'BONUS_POINTS': return '🎁';
      case 'FREE_PRODUCT': return '🆓';
      case 'DISCOUNT': return '💰';
      default: return '📢';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'rewards'
              ? 'text-nocca-light-green border-nocca-light-green'
              : 'text-gray-600 border-transparent hover:text-nocca-light-green'
            }`}
        >
          Ödüller
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'campaigns'
              ? 'text-nocca-light-green border-nocca-light-green'
              : 'text-gray-600 border-transparent hover:text-nocca-light-green'
            }`}
        >
          Kampanyalar
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'create'
              ? 'text-nocca-light-green border-nocca-light-green'
              : 'text-gray-600 border-transparent hover:text-nocca-light-green'
            }`}
        >
          Oluştur
        </button>
      </div>

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Mevcut Ödüller</h3>
            <span className="text-sm text-gray-600">{rewards.length} ödül</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <div key={reward.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{getCategoryIcon(reward.category)}</span>
                    <h4 className="font-semibold text-gray-800">{reward.title}</h4>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleRewardAvailability(reward.id)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${reward.isAvailable
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                    >
                      {reward.isAvailable ? 'Aktif' : 'Pasif'}
                    </button>
                    <button
                      onClick={() => deleteReward(reward.id)}
                      className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                    >
                      Sil
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-3">{reward.description}</p>

                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-nocca-green">{reward.pointsCost} puan</p>
                    {reward.validUntil && (
                      <p className="text-xs text-gray-500">Geçerli: {reward.validUntil}</p>
                    )}
                    {reward.usageLimit && (
                      <p className="text-xs text-gray-500">
                        Kullanım: {reward.usageCount}/{reward.usageLimit}
                      </p>
                    )}
                  </div>
                  {reward.image && (
                    <div className="relative w-16 h-16">
                      <Image
                        src={reward.image}
                        alt={reward.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Kampanyalar</h3>
            <span className="text-sm text-gray-600">{rewards.filter(r => r.category === 'DISCOUNT').length} kampanya</span>
          </div>

          <div className="space-y-4">
            {rewards.filter((reward) => reward.category === 'DISCOUNT').map((campaign) => (
              <div key={campaign.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{getCampaignTypeIcon('POINTS_MULTIPLIER')}</span>
                    <h4 className="font-semibold text-gray-800">{campaign.title}</h4>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleCampaignStatus(campaign.id)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${true
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                    >
                      {'Aktif'}
                    </button>
                    <button
                      onClick={() => deleteCampaign(campaign.id)}
                      className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                    >
                      Sil
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-3">{campaign.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Başlangıç:</p>
                    <p className="font-medium">2025-01-01</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Bitiş:</p>
                    <p className="font-medium">2025-12-31</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Değer:</p>
                    <p className="font-medium">2x</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Hedef:</p>
                    <p className="font-medium">
                      {'Tümü'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Durum:</p>
                    <p className={`font-medium text-green-600`}>
                      {'Aktif'}
                    </p>
                  </div>
                </div>

                {campaign.image && (
                  <div className="mt-3">
                    <div className="relative w-full h-32">
                      <Image
                        src={campaign.image}
                        alt={campaign.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Create Reward */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Yeni Ödül Oluştur</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ödül Başlığı</label>
                  <input
                    type="text"
                    value={newReward.title}
                    onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                    placeholder="Ödül başlığını girin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                  <textarea
                    value={newReward.description}
                    onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                    placeholder="Ödül açıklamasını girin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    value={newReward.category}
                    onChange={(e) => setNewReward({ ...newReward, category: e.target.value as Reward['category'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                    aria-label="Ödül kategorisi seçin"
                  >
                    <option value="PRODUCT">Ürün</option>
                    <option value="DISCOUNT">İndirim</option>
                    <option value="VOUCHER">Kupon</option>
                    <option value="EXPERIENCE">Deneyim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Puan Maliyeti</label>
                  <input
                    type="number"
                    value={newReward.pointsCost}
                    onChange={(e) => setNewReward({ ...newReward, pointsCost: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                    min="0"
                    placeholder="Gerekli puan miktarını"
                    aria-label="Gerekli puan miktarını"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newReward.isAvailable}
                    onChange={(e) => setNewReward({ ...newReward, isAvailable: e.target.checked })}
                    className="h-4 w-4 text-nocca-light-green focus:ring-nocca-light-green border-gray-300 rounded"
                    aria-label="Ödül aktifliği"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Aktif
                  </label>
                </div>

                <button
                  onClick={handleCreateReward}
                  className="w-full bg-nocca-light-green text-white py-2 px-4 rounded-md hover:bg-nocca-green transition-colors font-medium"
                >
                  Ödül Oluştur
                </button>
              </div>
            </div>

            {/* Create Campaign */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Yeni Kampanya Oluştur</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya Başlığı</label>
                  <input
                    type="text"
                    value={newCampaign.title}
                    onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                    placeholder="Kampanya başlığını girin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                  <textarea
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                    placeholder="Kampanya açıklamasını girin"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya Tipi</label>
                    <select
                      aria-label="Ödül kategorisi seçin"
                      value={newCampaign.type}
                      onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value as Campaign['type'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                    >
                      <option value="POINTS_MULTIPLIER">Puan Çarpanı</option>
                      <option value="BONUS_POINTS">Bonus Puan</option>
                      <option value="FREE_PRODUCT">Ücretsiz Ürün</option>
                      <option value="DISCOUNT">İndirim</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Değer</label>
                    <input
                      type="number"
                      value={newCampaign.value}
                      onChange={(e) => setNewCampaign({ ...newCampaign, value: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                      min="1"
                      placeholder="Kampanya değeri"
                      aria-label="Kampanya değeri"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                    <input
                      aria-label="Gerekli puan miktarını"
                      type="date"
                      value={newCampaign.startDate}
                      onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                    <input
                      aria-label="Kampanya değeri"
                      type="date"
                      value={newCampaign.endDate}
                      onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hedef Kitle</label>
                    <select
                      value={newCampaign.targetAudience}
                      onChange={(e) => setNewCampaign({ ...newCampaign, targetAudience: e.target.value as Campaign['targetAudience'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                      aria-label="Hedef kitle seçin"
                    >
                      <option value="ALL">Tümü</option>
                      <option value="LEVEL_BASED">Seviye Bazlı</option>
                      <option value="NEW_CUSTOMERS">Yeni Müşteriler</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newCampaign.isActive}
                      onChange={(e) => setNewCampaign({ ...newCampaign, isActive: e.target.checked })}
                      className="h-4 w-4 text-nocca-light-green focus:ring-nocca-light-green border-gray-300 rounded"
                      aria-label="Kampanya aktifliği"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Aktif
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleCreateCampaign}
                  className="w-full bg-nocca-light-green text-white py-2 px-4 rounded-md hover:bg-nocca-green transition-colors font-medium"
                >
                  Kampanya Oluştur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardManager;