'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaPrint } from 'react-icons/fa';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  status: string;
  totalAmount: number;
  finalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  notes?: string;
  createdAt: string;
  orderItems: OrderItem[];
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  size?: string;
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState({
    status: 'all',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, [filter.status, filter.search, pagination.page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filter.status !== 'all' && { status: filter.status }),
        ...(filter.search && { search: filter.search }),
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setPagination(prev => ({ ...prev, ...data.pagination }));
      }
    } catch (error) {
      console.error('Orders fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status } : null);
        }
      }
    } catch (error) {
      console.error('Order update error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PREPARING: 'bg-blue-100 text-blue-800',
      READY: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      PENDING: 'Beklemede',
      PREPARING: 'Hazırlanıyor',
      READY: 'Hazır',
      COMPLETED: 'Tamamlandı',
      CANCELLED: 'İptal Edildi',
    };
    return texts[status as keyof typeof texts] || status;
  };

  // Audio Alarm Logic
  const [audio] = useState(typeof window !== 'undefined' ? new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3') : null);
  const [hasPending, setHasPending] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Poll for new orders every 5 seconds (simulated live sync)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, [filter, pagination]);

  // Check for pending orders and trigger alarm
  useEffect(() => {
    const pendingCount = orders.filter(o => o.status === 'PENDING').length;
    if (pendingCount > 0) {
      setHasPending(true);
      if (!isMuted) {
        playAlarm();
      }
    } else {
      setHasPending(false);
      stopAlarm(); // Fix: Stop alarm when no pending orders
    }
  }, [orders, isMuted]);

  const playAlarm = () => {
    if (audio) {
      audio.loop = true;
      audio.play().catch(e => console.log('Audio autoplay blocked:', e));
    }
  };

  const stopAlarm = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };



  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (hasPending) playAlarm();
    } else {
      setIsMuted(true);
      stopAlarm();
    }
  };

  const printReceipt = (order: Order) => {
    const receiptContent = `
            <html>
            <head>
                <title>Fiş Yazdır</title>
                <style>
                    body { font-family: 'Courier New', monospace; width: 300px; margin: 0; padding: 10px; font-size: 12px; }
                    .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed black; padding-bottom: 10px; }
                    .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
                    .total { border-top: 1px dashed black; margin-top: 10px; padding-top: 10px; display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; }
                    .footer { text-align: center; margin-top: 20px; font-size: 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>NOCCA COFFEE</h2>
                    <p>Tarih: ${new Date().toLocaleString('tr-TR')}</p>
                    <p>Sipariş No: #${order.orderNumber?.split('-').pop() ?? ''}</p>
                    <p>Müşteri: ${order.customerName ?? ''}</p>
                </div>
                <div>
                   ${order.orderItems?.map((item) => `
                        <div class="item">
                            <span>${item.quantity}x ${item.productName}${item.size ? ` (${item.size})` : ''}</span>
                            <span>${(item.totalPrice ?? 0).toFixed(2)}₺</span>
                        </div>
                    `).join('')}
                </div>
                <div class="total">
                    <span>TOPLAM</span>
                    <span>${(order.finalAmount ?? 0).toFixed(2)}₺</span>
                </div>
                <div class="footer">
                    <p>Afiyet Olsun!</p>
                    <p>Bizi tercih ettiğiniz için teşekkürler.</p>
                </div>
            </body>
            </html>
        `;

    const printWindow = window.open('', '', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Audio Control / Status */}
      {hasPending && (
        <div className="bg-red-600 text-white px-4 py-3 shadow-lg animate-pulse sticky top-0 z-50 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🔔</span>
            <span className="font-bold text-lg">DİKKAT: Bekleyen Siparişler Var!</span>
          </div>
          <button
            onClick={toggleMute}
            className="bg-white text-red-600 px-4 py-1 rounded font-bold hover:bg-gray-100"
          >
            {isMuted ? 'Sesi Aç' : 'Sesi Durdur'}
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Sipariş Yönetimi</h1>
            </div>
            <nav className="flex space-x-4 items-center">
              <button
                onClick={toggleMute}
                className="mr-4 p-2 text-gray-500 hover:text-gray-900 focus:outline-none"
                title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
              <span className="text-xs text-gray-500 mr-2">
                {hasPending ? '⚠️ Bekleyen Sipariş' : '✅ Her şey yolunda'}
              </span>
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                Admin Panel
              </Link>
              <Link href="/admin/profile" className="text-gray-600 hover:text-gray-900">
                Profil
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ara
              </label>
              <input
                type="text"
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Müşteri adı, sipariş no..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durum
              </label>
              <select
                value={filter.status}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Tümü</option>
                <option value="PENDING">Beklemede</option>
                <option value="PREPARING">Hazırlanıyor</option>
                <option value="READY">Hazır</option>
                <option value="COMPLETED">Tamamlandı</option>
                <option value="CANCELLED">İptal Edildi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className={`bg-white shadow rounded-lg overflow-hidden border-2 ${hasPending ? 'border-red-500' : 'border-transparent'}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sipariş No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Henüz sipariş bulunmuyor
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className={`hover:bg-gray-50 ${order.status === 'PENDING' ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{order.customerName}</div>
                          {order.customerEmail && (
                            <div className="text-gray-500">{order.customerEmail}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)} 
                          ${order.status === 'PENDING' ? 'animate-pulse ring-2 ring-red-400' : ''}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₺{order.finalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsModalOpen(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            Detay
                          </button>
                          {order.status === 'PENDING' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded border border-blue-200"
                            >
                              Hazırla
                            </button>
                          )}
                          {order.status === 'PREPARING' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'READY')}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              Hazır
                            </button>
                          )}
                          {order.status === 'READY' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Tamamla
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Önceki
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Sonraki
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Sayfa <span className="font-medium">{pagination.page}</span> /{' '}
                    <span className="font-medium">{pagination.pages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Önceki
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Sonraki
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Sipariş Detayı - {selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Müşteri Bilgileri</h4>
                  <p className="text-sm text-gray-600">{selectedOrder.customerName}</p>
                  {selectedOrder.customerEmail && (
                    <p className="text-sm text-gray-600">{selectedOrder.customerEmail}</p>
                  )}
                  {selectedOrder.customerPhone && (
                    <p className="text-sm text-gray-600">{selectedOrder.customerPhone}</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Sipariş Ürünleri</h4>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div>
                          <span className="font-medium">{item.productName}</span>
                          {item.size && <span className="text-gray-500 text-xs ml-2">({item.size})</span>}
                          <span className="text-gray-500"> x {item.quantity}</span>
                        </div>
                        <span className="font-medium">₺{item.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="font-medium">Toplam:</span>
                    <span className="font-medium">₺{selectedOrder.finalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900">Notlar</h4>
                    <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                  </div>
                )}

                <div className="flex justify-end pt-4 mt-4 border-t gap-2">
                  <button
                    onClick={() => printReceipt(selectedOrder)}
                    className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                  >
                    <FaPrint className="mr-2" />
                    Yazdır
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}