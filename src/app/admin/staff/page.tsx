'use client';

import { useState, useEffect } from 'react';
import { FaUserPlus, FaUserTie, FaPhone, FaEnvelope, FaMoneyBillWave } from 'react-icons/fa';

interface Staff {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    salary: number;
    isActive: boolean;
    startDate: string;
}

export default function StaffPage() {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'BARISTA',
        salary: '',
        startDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/staff');
            if (res.ok) {
                const data = await res.json();
                setStaffList(data);
            }
        } catch (error) {
            console.error('Staff fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/admin/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                await fetchStaff();
                setIsModalOpen(false);
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    role: 'BARISTA',
                    salary: '',
                    startDate: new Date().toISOString().split('T')[0]
                });
            } else {
                const err = await res.json();
                alert(err.error || 'Hata oluştu');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <FaUserTie className="mr-3 text-nocca-green" />
                    Personel Yönetimi
                </h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-nocca-green text-white px-4 py-2 rounded-lg hover:bg-nocca-light-green transition flex items-center shadow-md"
                >
                    <FaUserPlus className="mr-2" />
                    Yeni Personel Ekle
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staffList.map((staff) => (
                    <div key={staff.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-blue-500 hover:shadow-lg transition">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{staff.name}</h3>
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold mt-1">
                                    {staff.role}
                                </span>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${staff.isActive ? 'bg-green-500' : 'bg-gray-400'}`} title={staff.isActive ? 'Aktif' : 'Pasif'}></div>
                        </div>

                        <div className="space-y-2 text-gray-600">
                            <div className="flex items-center">
                                <FaEnvelope className="mr-2 text-gray-400" />
                                <span>{staff.email}</span>
                            </div>
                            <div className="flex items-center">
                                <FaPhone className="mr-2 text-gray-400" />
                                <span>{staff.phone || '-'}</span>
                            </div>
                            <div className="flex items-center text-green-700 font-medium">
                                <FaMoneyBillWave className="mr-2" />
                                <span>₺{staff.salary?.toLocaleString()} / Ay</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t text-xs text-gray-500 flex justify-between">
                            <span>Başlama: {new Date(staff.startDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}

                {staffList.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
                        <p className="text-gray-500">Henüz kayıtlı personel bulunmamaktadır.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-2xl font-bold mb-4">Yeni Personel Ekle</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Ad Soyad</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded px-3 py-2"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">E-Posta</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full border rounded px-3 py-2"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Telefon</label>
                                <input
                                    type="text"
                                    className="w-full border rounded px-3 py-2"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Rol</label>
                                    <select
                                        className="w-full border rounded px-3 py-2"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="BARISTA">Barista</option>
                                        <option value="MANAGER">Müdür</option>
                                        <option value="WAITER">Garson</option>
                                        <option value="KITCHEN">Mutfak</option>
                                        <option value="CLEANER">Temizlik</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Maaş (₺)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded px-3 py-2"
                                        value={formData.salary}
                                        onChange={e => setFormData({ ...formData, salary: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-nocca-green text-white rounded hover:bg-nocca-light-green transition"
                                >
                                    {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
