'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: 'product' | 'discount' | 'voucher' | 'experience';
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
  type: 'points_multiplier' | 'bonus_points' | 'free_product' | 'discount';
  value: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  targetAudience: 'all' | 'level_based' | 'new_customers';
  image?: string;
}

const RewardManager = () => {
  const [activeTab, setActiveTab] = useState<'rewards' | 'campaigns' | 'create'>('rewards');
  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: '1',
      title: 'Ücretsiz Caffè Latte',
      description: 'Sevdiğiniz latte\'nin tadını çıkarın - herhangi bir boyutta',
      pointsCost: 500,
      category: 'product',
      image: '/images/products/CaffeLatte.jpeg',
      isAvailable: true,
      usageLimit: 1,
      usageCount: 0
    },
    {
      id: '2',
      title: 'Ücretsiz Tatlı',
      description: 'Brownie, çikolatalı kurabi veya muffin seçimi',
      pointsCost: 800,
      category: 'product',
      image: '/images/products/brownie.jpg',
      isAvailable: true,
      usageLimit: 1,
      usageCount: 0
    },
    {
      id: '3',
      title: '%20 İndirim Kuponu',
      description: 'Tüm alışverişlerinizde %20 indirim',
      pointsCost: 1000,
      category: 'discount',
      isAvailable: true,
      validUntil: '31.12.2024',
      usageLimit: 1,
      usageCount: 0
    },
    {
      id: '4',
      title: 'Özel Ürün Erken Erişim',
      description: 'Yeni çıkan ürünleri ilk siz deneyin',
      pointsCost: 1500,
      category: 'experience',
      isAvailable: true,
      usageLimit: 1,
      usageCount: 0
    },
    {
      id: '5',
      title: 'Doğum Günü Hediyesi',
      description: 'Doğum gününüzde ücretsiz içecek',
      pointsCost: 0,
      category: 'product',
      isAvailable: false, // Doğum günü bilgisi gerekli
      usageLimit: 1,
      usageCount: 0
    }
  ]);

  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      title: 'Hafta Sonu 2x Puan',
      description: 'Hafta sonleri tüm alışverişlerde 2 kat puan kazanın',
      type: 'points_multiplier',
      value: 2,
      startDate: '25.10.2024',
      endDate: '31.10.2024',
      isActive: true,
      targetAudience: 'all',
      image: '/images/instagram/bir yudum estetik.jpeg'
    },
    {
      id: '2',
      title: 'Seviye Atlama Bonusu',
      description: 'Gümüş seviyesine geçenlere 500 bonus puan',
      type: 'bonus_points',
      value: 500,
      startDate: '01.10.2024',
      endDate: '31.12.2024',
      isActive: true,
      targetAudience: 'level_based',
      image: '/images/instagram/zamansız tatlar.jpg'
    },
    {
      id: '3',
      title: '6 Al 1 Bedava',
      description: '6 kahve alana 7. kahve bedava',
      type: 'free_product',
      value: 1,
      startDate: '01.11.2024',
      endDate: '30.11.2024',
      isActive: false,
      targetAudience: 'all',
      image: '/images/instagram/siparişiniz hazır.jpg'
    },
    {
      id: '4',
      title: 'Yeni Üyelere Özel',
      description: 'Yeni üyelere ilk alışverişlerinde 3x puan',
      type: 'points_multiplier',
      value: 3,
      startDate: '01.10.2024',
      endDate: '31.12.2024',
      isActive: true,
      targetAudience: 'new_customers',
      image: '/images/instagram/mevsim-degisir.jpeg'
    }
  ]);

  const [newReward, setNewReward] = useState<Partial<Reward>>({
    title: '',
    description: '',
    pointsCost: 0,
    category: 'product',
    isAvailable: true,
    usageLimit: 1
  });

  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    title: '',
    description: '',
    type: 'points_multiplier',
    value: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
    targetAudience: 'all'
  });

  const handleCreateReward = () => {
    if (newReward.title && newReward.description && newReward.pointsCost && newReward.pointsCost > 0) {
      const reward: Reward = {
        id: Date.now().toString(),
        title: newReward.title,
        description: newReward.description,
        pointsCost: newReward.pointsCost,
        category: newReward.category as Reward['category'],
        image: newReward.image,
        isAvailable: newReward.isAvailable || true,
        usageLimit: newReward.usageLimit || 1,
        usageCount: 0
      };
      setRewards([...rewards, reward]);
      setNewReward({
        title: '',
        description: '',
        pointsCost: 0,
        category: 'product',
        isAvailable: true,
        usageLimit: 1
      });
    }
  };

  const handleCreateCampaign = () => {
    if (newCampaign.title && newCampaign.description && newCampaign.value) {
      const campaign: Campaign = {
        id: Date.now().toString(),
        title: newCampaign.title,
        description: newCampaign.description,
        type: newCampaign.type as Campaign['type'],
        value: newCampaign.value || 1,
        startDate: newCampaign.startDate || new Date().toISOString().split('T')[0],
        endDate: newCampaign.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: newCampaign.isActive !== undefined ? newCampaign.isActive : true,
        targetAudience: newCampaign.targetAudience as Campaign['targetAudience'],
        image: newCampaign.image
      };
      setCampaigns([...campaigns, campaign]);
      setNewCampaign({
        title: '',
        description: '',
        type: 'points_multiplier',
        value: 1,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: true,
        targetAudience: 'all'
      });
    }
  };

  const toggleRewardAvailability = (id: string) => {
    setRewards(rewards.map(reward => 
      reward.id === id ? { ...reward, isAvailable: !reward.isAvailable } : reward
    ));
  };

  const toggleCampaignStatus = (id: string) => {
    setCampaigns(campaigns.map(campaign => 
      campaign.id === id ? { ...campaign, isActive: !campaign.isActive } : campaign
    ));
  };

  const deleteReward = (id: string) => {
    setRewards(rewards.filter(reward => reward.id !== id));
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter(campaign => campaign.id !== id));
  };

  const getCategoryIcon = (category: Reward['category']) => {
    switch (category) {
      case 'product': return '🎁';
      case 'discount': return '🎫';
      case 'voucher': return '🎟';
      case 'experience': return '⭐';
      default: return '🎁';
    }
  };

  const getCampaignTypeIcon = (type: Campaign['type']) => {
    switch (type) {
      case 'points_multiplier': return '✖️';
      case 'bonus_points': return '🎁';
      case 'free_product': return '🆓';
      case 'discount': return '💰';
      default: return '📢';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'rewards'
              ? 'text-nocca-light-green border-nocca-light-green'
              : 'text-gray-600 border-transparent hover:text-nocca-light-green'
          }`}
        >
          Ödüller
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'campaigns'
              ? 'text-nocca-light-green border-nocca-light-green'
              : 'text-gray-600 border-transparent hover:text-nocca-light-green'
          }`}
        >
          Kampanyalar
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'create'
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
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        reward.isAvailable
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
            <span className="text-sm text-gray-600">{campaigns.length} kampanya</span>
          </div>
          
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{getCampaignTypeIcon(campaign.type)}</span>
                    <h4 className="font-semibold text-gray-800">{campaign.title}</h4>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleCampaignStatus(campaign.id)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        campaign.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {campaign.isActive ? 'Aktif' : 'Pasif'}
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
                    <p className="font-medium">{campaign.startDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Bitiş:</p>
                    <p className="font-medium">{campaign.endDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Hedef Kitle:</p>
                    <p className="font-medium">
                      {campaign.targetAudience === 'all' ? 'Tümü' :
                       campaign.targetAudience === 'level_based' ? 'Seviye Bazlı' : 'Yeni Müşteriler'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Durum:</p>
                    <p className={`font-medium ${campaign.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {campaign.isActive ? 'Aktif' : 'Pasif'}
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
                    onChange={(e) => setNewReward({...newReward, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                    placeholder="Ödül başlığını girin"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                  <textarea
                    value={newReward.description}
                    onChange={(e) => setNewReward({...newReward, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                    placeholder="Ödül açıklamasını girin"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    value={newReward.category}
                    onChange={(e) => setNewReward({...newReward, category: e.target.value as Reward['category']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                    aria-label="Ödül kategorisi"
                    title="Ödül kategorisi seçin"
                  >
                    <option value="product">Ürün</option>
                    <option value="discount">İndirim</option>
                    <option value="voucher">Kupon</option>
                    <option value="experience">Deneyim</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Puan Maliyeti</label>
                  <input
                    type="number"
                    value={newReward.pointsCost}
                    onChange={(e) => setNewReward({...newReward, pointsCost: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                    min="0"
                    placeholder="Gerekli puan miktarı"
                    aria-label="Gerekli puan miktarı"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newReward.isAvailable}
                    onChange={(e) => setNewReward({...newReward, isAvailable: e.target.checked})}
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
                    onChange={(e) => setNewCampaign({...newCampaign, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                    placeholder="Kampanya başlığını girin"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                  <textarea
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                    placeholder="Kampanya açıklamasını girin"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya Tipi</label>
                    <select
                      value={newCampaign.type}
                      onChange={(e) => setNewCampaign({...newCampaign, type: e.target.value as Campaign['type']})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                    >
                      <option value="points_multiplier">Puan Çarpanı</option>
                      <option value="bonus_points">Bonus Puan</option>
                      <option value="free_product">Ücretsiz Ürün</option>
                      <option value="discount">İndirim</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Değer</label>
                    <input
                      type="number"
                      value={newCampaign.value}
                      onChange={(e) => setNewCampaign({...newCampaign, value: parseInt(e.target.value) || 1})}
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
                      type="date"
                      value={newCampaign.startDate}
                      onChange={(e) => setNewCampaign({...newCampaign, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                    <input
                      type="date"
                      value={newCampaign.endDate}
                      onChange={(e) => setNewCampaign({...newCampaign, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hedef Kitle</label>
                  <select
                    value={newCampaign.targetAudience}
                    onChange={(e) => setNewCampaign({...newCampaign, targetAudience: e.target.value as Campaign['targetAudience']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nocca-light-green focus:border-transparent"
                    aria-label="Hedef kitle"
                    title="Hedef kitle seçin"
                  >
                    <option value="all">Tümü</option>
                    <option value="level_based">Seviye Bazlı</option>
                    <option value="new_customers">Yeni Müşteriler</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newCampaign.isActive}
                    onChange={(e) => setNewCampaign({...newCampaign, isActive: e.target.checked})}
                    className="h-4 w-4 text-nocca-light-green focus:ring-nocca-light-green border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Aktif
                  </label>
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