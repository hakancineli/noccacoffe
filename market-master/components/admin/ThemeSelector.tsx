'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Palette, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const THEMES = [
    { id: 'garanti', name: 'Garanti Pro', icon: <Check size={16} />, class: 'bg-[#00ae42] border-emerald-600' },
    { id: 'dark', name: 'Dark Neon', icon: <Moon size={16} />, class: 'bg-[#000000] border-teal-500' },
    { id: 'light', name: 'Light Soft', icon: <Sun size={16} />, class: 'bg-slate-50 border-indigo-500' },
    { id: 'slate', name: 'Slate Pro', icon: <Palette size={16} />, class: 'bg-[#0f172a] border-sky-400' },
];

export default function ThemeSelector() {
    const [currentTheme, setCurrentTheme] = useState('garanti');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'garanti';
        setCurrentTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const changeTheme = (id: string) => {
        setCurrentTheme(id);
        document.documentElement.setAttribute('data-theme', id);
        localStorage.setItem('theme', id);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
            >
                <div className="flex items-center gap-3">
                    <Palette size={18} className="text-muted group-hover:text-accent transition-colors" />
                    <span className="text-xs font-bold uppercase tracking-widest text-muted group-hover:text-foreground">Tema Seçimi</span>
                </div>
                <div className={`w-4 h-4 rounded-full border border-white/10 ${THEMES.find(t => t.id === currentTheme)?.class}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full left-0 w-full mb-2 z-50 p-2 bg-secondary border border-border-color rounded-2xl shadow-2xl backdrop-blur-xl"
                        >
                            <div className="grid grid-cols-1 gap-1">
                                {THEMES.map((theme) => (
                                    <button
                                        key={theme.id}
                                        onClick={() => changeTheme(theme.id)}
                                        className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all ${currentTheme === theme.id
                                            ? 'bg-accent/10 text-accent'
                                            : 'hover:bg-white/5 text-muted hover:text-foreground'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {theme.icon}
                                            <span className="text-xs font-black uppercase tracking-widest">{theme.name}</span>
                                        </div>
                                        {currentTheme === theme.id && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
