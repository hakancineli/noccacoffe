'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import Link from 'next/link';

interface Fixture {
    id: string;
    name: string;
    category: string | null;
    quantity: number;
    purchasePrice: number | null;
    purchaseDate: string | null;
    status: string;
    notes: string | null;
    createdAt: string;
}

export default function FixturesPage() {
    const [fixtures, setFixtures] = useState<Fixture[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingFixture, setEditingFixture] = useState<Fixture | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        quantity: 1,
        purchasePrice: '',
        purchaseDate: '',
        status: 'Kullanımda',
        notes: ''
    });

    useEffect(() => {
        fetchFixtures();
    }, []);

    const fetchFixtures = async () => {
        try {
            const res = await fetch('/api/admin/fixtures');
            if (res.ok) {
                const data = await res.json();
                setFixtures(data);
            }
        } catch (error) {
            console.error('Failed to fetch fixtures:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingFixture ? 'PUT' : 'POST';
            const body = editingFixture
                ? { ...formData, id: editingFixture.id }
                : formData;

            const res = await fetch('/api/admin/fixtures', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                fetchFixtures();
                setShowModal(false);
                resetForm();
            }
        } catch (error) {
            console.error('Failed to save fixture:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu demirbaşı silmek istediğinizden emin misiniz?')) return;
        try {
            const res = await fetch(`/api/admin/fixtures?id=${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchFixtures();
            }
        } catch (error) {
            console.error('Failed to delete fixture:', error);
        }
    };

    const openEditModal = (fixture: Fixture) => {
        setEditingFixture(fixture);
        setFormData({
            name: fixture.name,
            category: fixture.category || '',
            quantity: fixture.quantity,
            purchasePrice: fixture.purchasePrice?.toString() || '',
            purchaseDate: fixture.purchaseDate ? fixture.purchaseDate.split('T')[0] : '',
            status: fixture.status,
            notes: fixture.notes || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: '',
            quantity: 1,
            purchasePrice: '',
            purchaseDate: '',
            status: 'Kullanımda',
            notes: ''
        });
        setEditingFixture(null);
    };

    const filteredFixtures = fixtures.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.category?.toLowerCase().includes(search.toLowerCase())
    );

    const totalValue = fixtures.reduce((sum, f) => sum + (f.purchasePrice || 0) * f.quantity, 0);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header / Nav */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="text-xl font-bold text-green-700">Admin Panel</Link>
                            <span className="text-gray-300">|</span>
                            <h2 className="text-lg font-semibold text-gray-700">Demirbaş Yönetimi</h2>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-outfit">Demirbaşlar</h1>
                        <p className="text-gray-600 mt-1">Kafe varlıklarını ve ekipmanlarını takip edin</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2 shadow-sm"
                    >
                        <FaPlus /> Yeni Demirbaş
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium">Toplam Varlık Sayısı</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{fixtures.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium">Toplam Yatırım Değeri</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">₺{totalValue.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium">Arızalı Ekipman</p>
                        <p className="text-3xl font-bold text-red-600 mt-2">
                            {fixtures.filter(f => f.status === 'Arızalı').length}
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Demirbaş veya kategori ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Demirbaş</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Adet</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Alış Bilgisi</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400 font-outfit">Yükleniyor...</td>
                                </tr>
                            ) : filteredFixtures.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400 font-outfit">Kayıt bulunamadı.</td>
                                </tr>
                            ) : (
                                filteredFixtures.map((fixture) => (
                                    <tr key={fixture.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-gray-900 font-outfit">{fixture.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{fixture.category || '-'}</td>
                                        <td className="px-6 py-4 text-center">{fixture.quantity}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {fixture.purchasePrice ? `₺${fixture.purchasePrice.toLocaleString()}` : '-'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {fixture.purchaseDate ? new Date(fixture.purchaseDate).toLocaleDateString() : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${fixture.status === 'Kullanımda' ? 'bg-green-100 text-green-700' :
                                                    fixture.status === 'Arızalı' ? 'bg-red-100 text-red-700' :
                                                        fixture.status === 'Hurda' ? 'bg-gray-100 text-gray-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {fixture.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(fixture)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Düzenle"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(fixture.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Sil"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 font-outfit">
                                {editingFixture ? 'Demirbaşı Düzenle' : 'Yeni Demirbaş Ekle'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Demirbaş Adı *</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="Örn: Espresso Makinesi"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Kategori</label>
                                        <input
                                            type="text"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                            placeholder="Örn: Mutfak Ekipmanı"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Adet</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Alış Fiyatı (₺)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.purchasePrice}
                                            onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Alış Tarihi</label>
                                        <input
                                            type="date"
                                            value={formData.purchaseDate}
                                            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Durum</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                    >
                                        <option value="Kullanımda">Kullanımda</option>
                                        <option value="Arızalı">Arızalı</option>
                                        <option value="Depoda">Depoda</option>
                                        <option value="Hurda">Hurda</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Notlar</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none h-24"
                                        placeholder="Ek bilgi..."
                                    />
                                </div>
                            </div>
                            <div className="mt-8 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition"
                                >
                                    {editingFixture ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
