'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AuditLog {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    oldData: any;
    newData: any;
    userId: string | null;
    userEmail: string | null;
    createdAt: string;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const [filters, setFilters] = useState({
        action: 'all',
        entity: 'all',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchLogs();
    }, [pagination.page, filters]);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(filters.action !== 'all' && { action: filters.action }),
                ...(filters.entity !== 'all' && { entity: filters.entity }),
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate }),
            });

            const response = await fetch(`/api/admin/audit-logs?${queryParams}`);
            if (response.ok) {
                const data = await response.json();
                setLogs(data.logs);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Logs fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatAction = (action: string) => {
        switch (action) {
            case 'DELETE_ORDER': return '🔴 Sipariş Silindi';
            case 'UPDATE_ORDER_STATUS': return '📝 Sipariş Durumu Değişti';
            case 'CREATE_PRODUCT': return '✨ Yeni Ürün Eklendi';
            case 'UPDATE_PRODUCT': return '🔄 Ürün Güncellendi';
            case 'DELETE_PRODUCT': return '🗑️ Ürün Silindi';
            case 'CREATE_INGREDIENT': return '📦 Hammadde Eklendi';
            case 'UPDATE_INGREDIENT': return '📊 Hammadde Güncellendi';
            case 'DELETE_INGREDIENT': return '🗑️ Hammadde Silindi';
            case 'CREATE_WASTE_LOG': return '🗑️ Zayi Kaydı Oluşturuldu';
            default: return action;
        }
    };

    const formatEntityName = (log: AuditLog) => {
        if (log.entity === 'WasteLog') {
            const data = log.newData || {};
            const name = data.productName || data.ingredientName || 'Zayi';
            const qty = data.quantity ? ` (${data.quantity} ${data.unit || ''})` : '';
            return `${name}${qty}`;
        }
        if (log.entity === 'Order') {
            return `Sipariş #${log.oldData?.orderNumber || log.newData?.orderNumber || log.entityId.slice(-6)}`;
        }
        if (log.entity === 'Product') {
            return `Ürün: ${log.oldData?.name || log.newData?.name || log.entityId}`;
        }
        if (log.entity === 'Ingredient') {
            return `Hammadde: ${log.oldData?.name || log.newData?.name || log.entityId}`;
        }
        return `${log.entity} (${log.entityId.slice(-6)})`;
    };

    const translateStatus = (status: string) => {
        const translations: Record<string, string> = {
            'PENDING': 'Bekliyor',
            'PREPARING': 'Hazırlanıyor',
            'READY': 'Hazır',
            'COMPLETED': 'Tamamlandı',
            'CANCELLED': 'İptal Edildi',
            'PROCESSING': 'İşleniyor',
            'FAILED': 'Başarısız',
            'REFUNDED': 'İade Edildi',
        };
        return translations[status] || status;
    };

    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const formatDetails = (log: AuditLog) => {
        const { action, oldData, newData } = log;

        if (action === 'CREATE_WASTE_LOG') {
            return (
                <div className="text-sm">
                    <span className="font-medium">Neden:</span> {newData?.reason || '-'}<br />
                    <span className="font-medium text-red-600">Miktar:</span> {newData?.quantity} {newData?.unit}
                    {newData?.cost ? <span className="ml-2 text-gray-500">(Maliyet: ₺{newData.cost.toFixed(2)})</span> : ''}
                </div>
            );
        }

        if (action === 'UPDATE_ORDER_STATUS') {
            return (
                <div className="text-sm">
                    <span className="text-gray-400 line-through">{translateStatus(oldData?.status)}</span>
                    <span className="mx-2">→</span>
                    <span className="font-medium text-green-600">{translateStatus(newData?.status)}</span>
                </div>
            );
        }

        if (action === 'DELETE_ORDER') {
            return <span className="text-sm text-red-600 font-medium italic">Sipariş silindi ({oldData?.orderNumber})</span>;
        }

        if (action === 'UPDATE_PRODUCT') {
            const changes = [];
            if (oldData?.price !== newData?.price) changes.push(`Fiyat: ₺${oldData?.price} → ₺${newData?.price}`);
            if (oldData?.stock !== newData?.stock) changes.push(`Stok: ${oldData?.stock} → ${newData?.stock}`);
            if (oldData?.isActive !== newData?.isActive) changes.push(`Durum: ${oldData?.isActive ? 'Aktif' : 'Pasif'} → ${newData?.isActive ? 'Aktif' : 'Pasif'}`);

            return (
                <div className="text-xs space-y-1">
                    {changes.map((c, i) => <div key={i}>{c}</div>)}
                    {changes.length === 0 && <span className="text-gray-400 italic">Genel bilgiler güncellendi</span>}
                </div>
            );
        }

        if (action === 'UPDATE_INGREDIENT') {
            const changes = [];
            if (oldData?.stock !== newData?.stock) changes.push(`Stok: ${oldData?.stock} → ${newData?.stock} ${newData?.unit || ''}`);
            if (oldData?.costPerUnit !== newData?.costPerUnit) changes.push(`Birim Maliyet: ₺${oldData?.costPerUnit} → ₺${newData?.costPerUnit}`);

            return (
                <div className="text-xs space-y-1">
                    {changes.map((c, i) => <div key={i}>{c}</div>)}
                    {changes.length === 0 && <span className="text-gray-400 italic">Bilgiler güncellendi</span>}
                </div>
            );
        }

        // Generic summary
        return (
            <div className="text-[10px] text-gray-400 max-w-xs truncate">
                {JSON.stringify(newData || oldData || {})}
            </div>
        );
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link href="/admin" className="mr-4 text-gray-400 hover:text-gray-600">
                                ←
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">İşlem Geçmişi (Audit Logs)</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Filters */}
                <div className="bg-white shadow rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">İşlem Tipi</label>
                            <select
                                value={filters.action}
                                onChange={(e) => handleFilterChange('action', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            >
                                <option value="all">Tümü</option>
                                <option value="DELETE_ORDER">Sipariş Silme</option>
                                <option value="UPDATE_ORDER_STATUS">Sipariş Durumu</option>
                                <option value="CREATE_PRODUCT">Ürün Ekleme</option>
                                <option value="UPDATE_PRODUCT">Ürün Güncelleme</option>
                                <option value="DELETE_PRODUCT">Ürün Silme</option>
                                <option value="CREATE_INGREDIENT">Hammadde Ekleme</option>
                                <option value="UPDATE_INGREDIENT">Hammadde Güncelleme</option>
                                <option value="DELETE_INGREDIENT">Hammadde Silme</option>
                                <option value="CREATE_WASTE_LOG">Zayi Kaydı</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Varlık Türü</label>
                            <select
                                value={filters.entity}
                                onChange={(e) => handleFilterChange('entity', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            >
                                <option value="all">Tümü</option>
                                <option value="Order">Sipariş</option>
                                <option value="Product">Ürün</option>
                                <option value="Ingredient">Hammadde</option>
                                <option value="WasteLog">Zayi</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Varlık</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detaylar</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksiyon</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center">
                                            <div className="animate-spin inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">Henüz bir işlem kaydı bulunmuyor.</td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(log.createdAt).toLocaleString('tr-TR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatAction(log.action)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatEntityName(log)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.userEmail || 'Sistem'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {formatDetails(log)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => setSelectedLog(log)}
                                                    className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded"
                                                >
                                                    İncele
                                                </button>
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
                                    onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                                    disabled={pagination.page === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Önceki
                                </button>
                                <button
                                    onClick={() => setPagination(p => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
                                    disabled={pagination.page === pagination.pages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Sonraki
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Toplam <span className="font-medium">{pagination.total}</span> kayıttan <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> - <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> arası gösteriliyor
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        {[...Array(pagination.pages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setPagination(p => ({ ...p, page: i + 1 }))}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pagination.page === i + 1
                                                    ? 'z-10 bg-green-50 border-green-500 text-green-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Log Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-xl font-bold">İşlem Detayları</h2>
                                <p className="text-gray-400 text-sm mt-1">
                                    {new Date(selectedLog.createdAt).toLocaleString('tr-TR')} • {selectedLog.userEmail || 'Sistem'}
                                </p>
                            </div>
                            <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-white transition p-2 hover:bg-white/10 rounded-full">✕</button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Eylem</p>
                                    <p className="font-medium">{formatAction(selectedLog.action)}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">ID</p>
                                    <p className="font-mono text-xs">{selectedLog.entityId}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {selectedLog.oldData && (
                                    <div>
                                        <p className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                            Eski Veri
                                        </p>
                                        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                                            <pre className="text-green-400 text-xs font-mono leading-relaxed">
                                                {JSON.stringify(selectedLog.oldData, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {selectedLog.newData && (
                                    <div>
                                        <p className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                            Yeni Veri
                                        </p>
                                        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                                            <pre className="text-blue-400 text-xs font-mono leading-relaxed">
                                                {JSON.stringify(selectedLog.newData, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t flex justify-end shrink-0">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition active:scale-95"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
