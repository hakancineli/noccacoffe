'use client';

import { useState } from 'react';
import {
    Box,
    Mail,
    Lock,
    ArrowRight,
    User,
    Phone,
    ShieldCheck,
    ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function LoginPage() {
    const [loginType, setLoginType] = useState<'merchant' | 'customer'>('merchant');

    return (
        <main className="min-h-screen bg-[#0a0a0c] text-white flex flex-col md:flex-row overflow-hidden font-inter">
            {/* Left Side: Branding & Info */}
            <div className="hidden md:flex flex-col justify-between p-16 w-1/2 relative bg-gradient-to-br from-[#0a0a0c] to-[#0d0d0f] border-r border-white/5">
                <div className="absolute top-0 right-0 p-20 opacity-10 blur-3xl pointer-events-none">
                    <div className="w-[500px] h-[500px] bg-teal-500 rounded-full" />
                </div>

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 group transition-all">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                            <Box className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase font-outfit">
                            Market<span className="text-teal-400">Master</span>
                        </span>
                    </Link>
                </div>

                <div className="relative z-10 space-y-6 max-w-md">
                    <h1 className="text-5xl font-black uppercase tracking-tighter font-outfit leading-none">
                        Geleceğin <br /> <span className="text-teal-400">Yönetim Gücü</span>
                    </h1>
                    <p className="text-gray-500 font-medium leading-relaxed">
                        Yapı marketinizin tüm kontrolünü elinize alın. Binlerce ürün, yüzlerce şube ve karmaşık finansal süreçler artık parmaklarınızın ucunda.
                    </p>
                    <div className="flex items-center gap-4 pt-4">
                        <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 border-2 border-[#0a0a0c]" />
                            <div className="w-10 h-10 rounded-full bg-teal-500 border-2 border-[#0a0a0c]" />
                            <div className="w-10 h-10 rounded-full bg-emerald-500 border-2 border-[#0a0a0c]" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                            500+ Aktif Şube Güvenle Kullanıyor
                        </p>
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-700">
                        © 2025 MarketMaster SaaS Platformu
                    </p>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex-1 flex flex-col justify-center p-8 md:p-20 relative">
                <Link href="/" className="md:hidden absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
                    <ChevronLeft size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Geri Dön</span>
                </Link>

                <div className="max-w-md w-full mx-auto space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black uppercase tracking-tight font-outfit">Tekrar Hoş Geldiniz</h2>
                        <p className="text-gray-500 font-medium italic">Lütfen sisteme giriş yapmak için bilgilerinizi girin.</p>
                    </div>

                    {/* Login Type Switcher */}
                    <div className="flex p-1 bg-white/5 border border-white/5 rounded-2xl relative">
                        <motion.div
                            layoutId="switcher"
                            className="absolute inset-y-1 w-[calc(50%-4px)] bg-teal-500 rounded-xl"
                            animate={{ x: loginType === 'merchant' ? 0 : '100%' }}
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                        <button
                            onClick={() => setLoginType('merchant')}
                            className={`flex-1 relative z-10 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${loginType === 'merchant' ? 'text-white' : 'text-gray-500'}`}
                        >
                            Yönetici Girişi
                        </button>
                        <button
                            onClick={() => setLoginType('customer')}
                            className={`flex-1 relative z-10 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${loginType === 'customer' ? 'text-white' : 'text-gray-500'}`}
                        >
                            Müşteri Portalı
                        </button>
                    </div>

                    <form className="space-y-6">
                        <AnimatePresence mode="wait">
                            {loginType === 'merchant' ? (
                                <motion.div
                                    key="merchant"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">E-POSTA ADRESİ</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-400 transition-colors" size={20} />
                                            <input
                                                type="email"
                                                placeholder="admin@marketmaster.com"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-teal-500/50 transition-all font-bold text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">ŞİFRE</label>
                                            <a href="#" className="text-[10px] font-black uppercase tracking-widest text-teal-500 hover:text-teal-400">Sıfırla</a>
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-400 transition-colors" size={20} />
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-teal-500/50 transition-all font-bold text-sm"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="customer"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">TELEFON NUMARASI</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-400 transition-colors" size={20} />
                                            <input
                                                type="tel"
                                                placeholder="5XX XXX XX XX"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-teal-500/50 transition-all font-bold text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">CİRİ KODU / ŞİFRE</label>
                                        <div className="relative group">
                                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-400 transition-colors" size={20} />
                                            <input
                                                type="password"
                                                placeholder="KİMLİK DOĞRULAMA"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-teal-500/50 transition-all font-bold text-sm"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="button"
                            className="w-full bg-teal-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-teal-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
                        >
                            {loginType === 'merchant' ? 'Sisteme Bağlan' : 'Borç/Alacak Sorgula'} <ArrowRight size={20} />
                        </button>
                    </form>

                    <div className="pt-8 border-t border-white/5 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-700">
                            Henüz MarketMaster abonesi değil misiniz? <br />
                            <a href="#" className="text-teal-500 hover:text-teal-400 hover:underline">Şimdi Başlayın</a>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
