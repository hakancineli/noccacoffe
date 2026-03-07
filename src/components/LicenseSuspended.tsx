'use client';

import React from 'react';

export default function LicenseSuspended() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 fixed inset-0 z-[99999] font-sans selection:bg-red-500/30">

            {/* Background Animated Gradient / Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="bg-[#111111] border border-red-900/50 rounded-2xl p-8 md:p-12 w-full max-w-2xl shadow-2xl shadow-red-900/20 relative overflow-hidden text-center backdrop-blur-sm">

                {/* Top Warning Strip */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-800 via-red-500 to-red-800"></div>

                {/* Lock Icon */}
                <div className="w-24 h-24 bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-800/30 ring-4 ring-red-900/10">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-red-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-6 uppercase">
                    Sistem Lisansı Askıya Alındı
                </h1>

                <div className="bg-red-950/30 p-4 rounded-xl border border-red-900/20 mb-8 inline-block">
                    <p className="text-red-400 font-medium tracking-widest text-sm uppercase">Hata Kodu: LIC-ERR-402 | Yetki İptali</p>
                </div>

                <div className="space-y-4 text-gray-300 text-base md:text-lg leading-relaxed text-left max-w-lg mx-auto bg-black/40 p-6 rounded-xl border border-white/5">
                    <p>
                        <strong className="text-white">Nocca Coffee Yönetim Sistemi</strong>'ne olan erişiminiz, hizmet sözleşmesi ve lisans hakları ihlali sebebiyle tek taraflı olarak devredışı bırakılmıştır.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-gray-400 marker:text-red-500">
                        <li>Tüm POS ve Sipariş işlemleri durdurulmuştur.</li>
                        <li>Stok ve Kasa hesaplamaları erişime kapatılmıştır.</li>
                        <li>Geçmişe dönük veri tabanı erişimi koruma altındadır.</li>
                    </ul>
                </div>

                <div className="mt-10 pt-8 border-t border-white/10">
                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Çözüm İçin İletişim</p>
                    <p className="text-white font-medium">Sistem Yöneticisi & Mimar: <span className="text-red-400">Hakan Çineli</span></p>
                </div>

            </div>
        </div>
    );
}
