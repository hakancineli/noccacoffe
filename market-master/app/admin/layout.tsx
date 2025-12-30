import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#0a0a0c] text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-20 border-b border-white/5 bg-[#0d0d0f]/50 backdrop-blur-xl flex items-center justify-between px-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Hoş Geldin, Hakan</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-black uppercase tracking-widest text-teal-400">Merkez Şube</span>
                            <span className="text-[10px] text-gray-500 font-bold">Admin Paneli</span>
                        </div>
                        <div className="w-10 h-10 bg-white/5 rounded-full border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                            <span className="font-black text-xs">HC</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-10 scrollbar-thin scrollbar-thumb-white/10">
                    {children}
                </main>
            </div>
        </div>
    );
}
