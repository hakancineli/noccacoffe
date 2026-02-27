const { app, BrowserWindow, screen, Menu, globalShortcut } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

let mainWindow;

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        title: "NOCCA Coffee POS",
        // PNG icon is generally better supported as a source for Electron
        icon: path.join(__dirname, '../public/images/logo/logo.png'),
        webPreferences: {
            nodeIntegration: false, // Security best practice
            contextIsolation: true,  // Security best practice
            preload: path.join(__dirname, 'preload.js') // Optional: add desktop-specific APIs later
        },
        autoHideMenuBar: true,
        backgroundColor: '#ffffff',
    });

    // POS için sağ tık menüsünü engelle
    mainWindow.webContents.on('context-menu', (e) => {
        e.preventDefault();
    });

    // Zoom özelliklerini engelle (POS görünümünün bozulmaması için)
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.setVisualZoomLevelLimits(1, 1);
    });

    const startUrl = isDev
        ? 'http://localhost:3000/admin/pos'
        : 'https://www.noccacoffee.com.tr/admin/pos';

    mainWindow.loadURL(startUrl);

    // Hata ayıklama için (Ctrl+Shift+I) - Eğer yine beyaz ekran/hata olursa bakabilmeniz için kalsın
    globalShortcut.register('CommandOrControl+Shift+I', () => {
        if (mainWindow) mainWindow.webContents.openDevTools();
    });

    // Sayfa yüklenemezse kullanıcıya seçenek sunan daha hafif bir hata yönetimi
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Page failed to load:', errorCode, errorDescription);
        // Sadece internet gerçekten yoksa veya adres hatalıysa uyarı ver
        if (errorCode !== -3) { // -3 is often just a transition/cancel
            mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
                <body style="background:#f8fafc; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; text-align:center;">
                    <h2 style="color:#1e293b;">Yükleme Hatası</h2>
                    <p style="color:#64748b;">Sistem şu an başlatılamadı (Hata: ${errorDescription})</p>
                    <button onclick="window.location.reload()" style="padding:10px 20px; background:#006241; color:white; border:none; border-radius:8px; cursor:pointer;">Tekrar Dene</button>
                </body>
            `));
        }
    });

    // F11 gibi kısayolları POS kontrolü için yönetebiliriz
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Menü çubuğunu tamamen kaldır (Windows/Linux)
Menu.setApplicationMenu(null);

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
