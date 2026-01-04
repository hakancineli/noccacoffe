'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertCircle, Coffee, Loader2, RefreshCw } from 'lucide-react';

interface AIResponse {
    summary: string;
    recommendations: string[];
    mood: 'positive' | 'neutral' | 'warning';
}

export default function AIConsultant() {
    const [data, setData] = useState<AIResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/ai-consultant');
            const result = await res.json();
            if (result.error) throw new Error(result.error);
            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysis();
    }, []);

    const moodConfig = {
        positive: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <TrendingUp className="w-5 h-5 text-emerald-500" /> },
        neutral: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: <Coffee className="w-5 h-5 text-blue-500" /> },
        warning: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: <AlertCircle className="w-5 h-5 text-orange-500" /> }
    };

    const currentMood = data?.mood ? moodConfig[data.mood] : moodConfig.neutral;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-8">
            <div className="p-6 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-black rounded-lg">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-none">Nocca AI Danışman</h3>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">Aylık Performans Analizi</p>
                    </div>
                </div>
                <button
                    onClick={fetchAnalysis}
                    disabled={loading}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-900"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="p-6">
                {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 text-black animate-spin" />
                        <p className="text-sm font-medium text-gray-500 animate-pulse">Veriler analiz ediliyor, taze bir kahve kokusu geliyor...</p>
                    </div>
                ) : error ? (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                        <AlertCircle className="w-5 h-5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                ) : data ? (
                    <div className="space-y-6">
                        {/* Summary */}
                        <div className={`p-4 rounded-xl border ${currentMood.bg} ${currentMood.border} flex gap-4`}>
                            <div className="mt-0.5">{currentMood.icon}</div>
                            <p className="text-sm font-medium leading-relaxed text-gray-700">
                                {data.summary}
                            </p>
                        </div>

                        {/* Recommendations */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Danışman Tavsiyeleri</h4>
                            <div className="grid grid-cols-1 gap-3">
                                {data.recommendations.map((rec, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400 flex-shrink-0">
                                            {idx + 1}
                                        </div>
                                        <p className="text-sm text-gray-600 font-medium">{rec}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Powered by Gemini 1.5 Flash</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <button
                            onClick={fetchAnalysis}
                            className="px-6 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all"
                        >
                            Analizi Başlat
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
