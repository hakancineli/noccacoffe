'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaShoppingBag, FaCalendarAlt, FaEye, FaFilter } from 'react-icons/fa';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'preparing' | 'ready' | 'completed' | 'cancelled';
  total: number;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  paymentMethod: string;
  storeLocation: string;
}

const OrdersPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<'all' | 'preparing' | 'ready' | 'completed' | 'cancelled'>('all');
  const router = useRouter();

  useEffect(() => {
    // Check login status and fetch orders
    const fetchOrders = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      setIsLoggedIn(true);

      try {
        const response = await fetch('/api/orders/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Map backend status to frontend expectations if needed, or ensure frontend handles caps
          setOrders(data);
        } else {
          console.error('Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders(); // Initial fetch

    // Poll every 5 seconds
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Siparişinizi iptal etmek istediğinize emin misiniz?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert('Siparişiniz iptal edildi.');
        // Update local state
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
        setSelectedOrder(null);
      } else {
        const d = await res.json();
        alert(d.error || 'İptal edilemedi. Sipariş hazırlanıyor olabilir.');
      }
    } catch (err) {
      console.error(err);
      alert('İptal işlemi sırasında bir hata oluştu');
    }
  };

  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase();
    switch (s) {
      case 'PENDING':
      case 'PREPARING':
        return 'bg-yellow-100 text-yellow-800';
      case 'READY':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const s = status?.toUpperCase();
    switch (s) {
      case 'PENDING': return 'Bekleniyor';
      case 'PREPARING': return 'Hazırlanıyor';
      case 'READY': return 'Hazır';
      case 'COMPLETED': return 'Tamamlandı';
      case 'CANCELLED': return 'İptal Edildi';
      default: return 'Bilinmiyor';
    }
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Siparişlerim</h1>
          <p className="mt-2 text-gray-600">Geçmiş siparişlerinizi görüntüleyin ve takip edin</p>
        </div>

        {/* Filtreler */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-4">
            <FaFilter className="text-gray-600" />
            <div className="flex space-x-2">
              {[
                { value: 'all', label: 'Tümü' },
                { value: 'preparing', label: 'Hazırlanıyor' },
                { value: 'ready', label: 'Hazır' },
                { value: 'completed', label: 'Tamamlandı' },
                { value: 'cancelled', label: 'İptal Edildi' }
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFilter(item.value as any)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${filter === item.value
                    ? 'bg-nocca-light-green text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sipariş Listesi */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FaShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sipariş bulunamadı</h3>
            <p className="text-gray-600">Henüz siparişiniz bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <FaCalendarAlt className="h-4 w-4 mr-1" />
                        {order.date}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <p className="text-lg font-bold text-gray-900 mt-2">₺{order.total.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">
                        {order.items.length} ürün • {order.paymentMethod}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.storeLocation}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="ml-4 px-4 py-2 bg-nocca-light-green text-white rounded-md hover:bg-nocca-green transition-colors font-medium"
                    >
                      <FaEye className="inline mr-2" />
                      Detaylar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sipariş Detay Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedOrder.orderNumber}</h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrder.date}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-6">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>

                <div className="space-y-4 mb-6">
                  <h4 className="font-semibold text-gray-900">Sipariş Ürünleri</h4>
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="relative w-16 h-16">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{item.name}</h5>
                        <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-900">₺{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Ara Toplam</span>
                    <span className="font-medium">₺{selectedOrder.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">KDV</span>
                    <span className="font-medium">₺0.00</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Toplam</span>
                    <span>₺{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Ödeme Yöntemi</p>
                      <p className="font-medium">{selectedOrder.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Mağaza</p>
                      <p className="font-medium">{selectedOrder.storeLocation}</p>
                    </div>
                  </div>
                </div>

                {selectedOrder.status.toLowerCase() === 'pending' && (
                  <div className="mt-6 pt-4 border-t">
                    <button
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                      className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-bold hover:bg-red-100 transition-colors"
                    >
                      Siparişi İptal Et
                    </button>
                    <p className="text-xs text-red-400 text-center mt-2">Siparişi iptal etmek için tıklayın.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;