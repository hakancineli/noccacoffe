'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function PosSettingsPage() {
    const [settings, setSettings] = useState({
        integrationMode: 'NONE', // NONE, LOCAL_BRIDGE, CLOUD_API, MANUAL
        bridgeUrl: 'http://localhost:8080',
        deviceIp: '',
        apiKey: '',
        terminalId: ''
    });

    useEffect(() => {
        // Load settings from localStorage specific to this device/browser
        const savedSettings = localStorage.getItem('pos_settings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('pos_settings', JSON.stringify(settings));
        toast.success('Ayarlar bu cihaz için kaydedildi');
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
                            <h1 className="text-2xl font-bold text-gray-900">Yazıcı ve POS Ayarları</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Ödeme Kaydedici Cihaz (ÖKÇ) Entegrasyonu</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Bu ayarlar sadece şu anda kullandığınız tarayıcı/cihaz için geçerlidir.
                        Beko 330TR gibi cihazlarla haberleşmek için kullanılır.
                    </p>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Entegrasyon Modu</label>
                            <select
                                value={settings.integrationMode}
                                onChange={(e) => setSettings({ ...settings, integrationMode: e.target.value })}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                            >
                                <option value="NONE">Pasif (Sadece Ekran)</option>
                                <option value="LOCAL_BRIDGE">Yerel Köprü (USB/Serial - Bridge App)</option>
                                <option value="CLOUD_API">Bulut API (Token Flex - Deneysel)</option>
                            </select>
                        </div>

                        {settings.integrationMode === 'LOCAL_BRIDGE' && (
                            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                                <h3 className="text-sm font-medium text-blue-800 mb-2">Yerel Köprü Ayarları</h3>
                                <p className="text-xs text-blue-600 mb-4">
                                    Bilgisayarınızda çalışan "Nocca Bridge" uygulamasının adresi.
                                    Genellikle <code>http://localhost:8080</code>
                                </p>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bridge URL</label>
                                    <input
                                        type="text"
                                        value={settings.bridgeUrl}
                                        onChange={(e) => setSettings({ ...settings, bridgeUrl: e.target.value })}
                                        className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        placeholder="http://localhost:8080"
                                    />
                                </div>
                                <div className="mt-4">
                                    <button
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                        onClick={() => toast.error('Bridge uygulaması ile bağlantı kurulamadı (Henüz Yüklü Değil)')}
                                    >
                                        Bağlantıyı Test Et
                                    </button>
                                </div>
                            </div>
                        )}

                        {settings.integrationMode === 'CLOUD_API' && (
                            <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
                                <h3 className="text-sm font-medium text-purple-800 mb-2">Bulut API Ayarları</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Token API Key</label>
                                        <input
                                            type="password"
                                            value={settings.apiKey}
                                            onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                                            className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Terminal ID (Seri No)</label>
                                        <input
                                            type="text"
                                            value={settings.terminalId}
                                            onChange={(e) => setSettings({ ...settings, terminalId: e.target.value })}
                                            className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-5 flex justify-end">
                            <button
                                type="button"
                                onClick={handleSave}
                                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Ayarları Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
