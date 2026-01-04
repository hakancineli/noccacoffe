import Sidebar from "@mm/components/admin/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-20 border-b border-border-color bg-card/50 backdrop-blur-xl flex items-center justify-between px-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Hoş Geldin, Hakan</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-black uppercase tracking-widest text-accent">Merkez Şube</span>
                            <span className="text-[10px] text-muted font-bold">Admin Paneli</span>
                        </div>
                        <div className="w-10 h-10 bg-secondary rounded-full border border-border-color flex items-center justify-center cursor-pointer hover:bg-accent hover:text-white transition-all shadow-sm">
                            <span className="font-black text-xs">HC</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-10 scrollbar-thin scrollbar-thumb-accent/10">
                    {children}
                </main>
            </div>
        </div>
    );
}
