'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  status: string;
  transactionId?: string;
  bankResponse?: any;
  createdAt: string;
  order?: {
    id: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    finalAmount: number;
  };
}

export default function PaymentsManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState({
    status: 'all',
    method: 'all',
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
    fetchPayments();
  }, [filter.status, filter.method, filter.search, pagination.page]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filter.status !== 'all' && { status: filter.status }),
        ...(filter.method !== 'all' && { method: filter.method }),
        ...(filter.search && { search: filter.search }),
      });

      const response = await fetch(`/api/admin/payments?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments);
        setPagination(prev => ({ ...prev, ...data.pagination }));
      }
    } catch (error) {
      console.error('Payments fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const processRefund = async (paymentId: string, refundAmount: string, refundReason: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refundAmount,
          refundReason,
        }),
      });

      if (response.ok) {
        fetchPayments();
        setIsModalOpen(false);
        setSelectedPayment(null);
      }
    } catch (error) {
      console.error('Refund processing error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-purple-100 text-purple-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      PENDING: 'Beklemede',
      PROCESSING: 'İşleniyor',
      COMPLETED: 'Tamamlandı',
      FAILED: 'Başarısız',
      REFUNDED: 'İade Edildi',
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getMethodIcon = (method: string) => {
    const icons = {
      CASH: '💵',
      CREDIT_CARD: '💳',
      DEBIT_CARD: '💳',
      MOBILE_PAYMENT: '📱',
      BANK_TRANSFER: '🏦',
    };
    return icons[method as keyof typeof icons] || '💳';
  };

  const getMethodText = (method: string) => {
    const texts = {
      CASH: 'Nakit',
      CREDIT_CARD: 'Kredi Kartı',
      DEBIT_CARD: 'Banka Kartı',
      MOBILE_PAYMENT: 'Mobil Ödeme',
      BANK_TRANSFER: 'Havale',
    };
    return texts[method as keyof typeof texts] || method;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Ödeme Yönetimi</h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                Admin Panel
              </Link>
              <Link href="/admin/orders" className="text-gray-600 hover:text-gray-900">
                Siparişler
              </Link>
              <Link href="/admin/products" className="text-gray-600 hover:text-gray-900">
                Ürünler
              </Link>
              <Link href="/admin/customers" className="text-gray-600 hover:text-gray-900">
                Müşteriler
              </Link>
              <Link href="/admin/barista" className="text-gray-600 hover:text-gray-900">
                Barista
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
                id="search-input"
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                placeholder="İşlem ID, sipariş no..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="sm:w-48">
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Durum
              </label>
              <select
                id="status-filter"
                value={filter.status}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Tümü</option>
                <option value="PENDING">Beklemede</option>
                <option value="PROCESSING">İşleniyor</option>
                <option value="COMPLETED">Tamamlandı</option>
                <option value="FAILED">Başarısız</option>
                <option value="REFUNDED">İade Edildi</option>
              </select>
            </div>
            <div className="sm:w-48">
              <label htmlFor="method-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Ödeme Yöntemi
              </label>
              <select
                id="method-filter"
                value={filter.method}
                onChange={(e) => setFilter(prev => ({ ...prev, method: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Tümü</option>
                <option value="CASH">Nakit</option>
                <option value="CREDIT_CARD">Kredi Kartı</option>
                <option value="DEBIT_CARD">Banka Kartı</option>
                <option value="MOBILE_PAYMENT">Mobil Ödeme</option>
                <option value="BANK_TRANSFER">Havale</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 sm:py-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlem ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sipariş No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Müşteri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Yöntem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
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
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                      </td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        Henüz ödeme bulunmuyor
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.transactionId || payment.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.order?.orderNumber || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.order?.customerName || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₺{payment.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <span>{getMethodIcon(payment.method)}</span>
                            <span className="ml-2">{getMethodText(payment.method)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                            {getStatusText(payment.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payment.createdAt).toLocaleString('tr-TR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedPayment(payment);
                                setIsModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Detay
                            </button>
                            {payment.status === 'COMPLETED' && (
                              <button
                                onClick={() => {
                                  if (confirm('Bu ödeme için iade işlemi yapmak istediğinizden emin misiniz?')) {
                                    processRefund(payment.id, '0', 'Müşteri talebi');
                                  }
                                }}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                İade
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
        </div>
      </main>

      {/* Payment Detail Modal */}
      {isModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Ödeme Detayı - {selectedPayment.transactionId || selectedPayment.id.slice(0, 8)}
                </h3>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedPayment(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Ödeme Bilgileri</h4>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">İşlem ID:</span>
                      <span className="font-medium">{selectedPayment.transactionId || selectedPayment.id.slice(0, 8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sipariş No:</span>
                      <span className="font-medium">{selectedPayment.order?.orderNumber || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Müşteri:</span>
                      <span className="font-medium">{selectedPayment.order?.customerName || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tutar:</span>
                      <span className="font-medium">₺{selectedPayment.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ödeme Yöntemi:</span>
                      <span className="font-medium">
                        {getMethodIcon(selectedPayment.method)} {getMethodText(selectedPayment.method)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durum:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPayment.status)}`}>
                        {getStatusText(selectedPayment.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tarih:</span>
                      <span className="font-medium">{new Date(selectedPayment.createdAt).toLocaleString('tr-TR')}</span>
                    </div>
                  </div>
                </div>

                {selectedPayment.bankResponse && (
                  <div>
                    <h4 className="font-medium text-gray-900">Banka Yanıtı</h4>
                    <div className="mt-2 p-3 bg-gray-100 rounded-md">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        {JSON.stringify(selectedPayment.bankResponse, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedPayment.status === 'COMPLETED' && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-4">İade İşlemi</h4>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget as HTMLFormElement);
                        processRefund(
                          selectedPayment.id,
                          formData.get('refundAmount') as string,
                          formData.get('refundReason') as string
                        );
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700">İade Tutarı</label>
                        <input
                          type="number"
                          id="refund-amount"
                          name="refundAmount"
                          max={selectedPayment.amount}
                          step="0.01"
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          placeholder="İade edilecek tutar"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">İade Sebebi</label>
                        <textarea
                          id="refund-reason"
                          name="refundReason"
                          rows={3}
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          placeholder="İade nedenini açıklayın..."
                        />
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setIsModalOpen(false);
                            setSelectedPayment(null);
                          }}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                        >
                          İptal
                        </button>
                        <button
                          type="submit"
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          İade Yap
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}