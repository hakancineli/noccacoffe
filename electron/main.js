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

    const htmlContent = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; text-align: center; padding: 20px; margin: 0; }
                    .container { max-width: 400px; }
                    h1 { color: #1e293b; margin-bottom: 10px; }
                    p { color: #64748b; margin-bottom: 20px; }
                    button { padding: 12px 24px; background: #006241; color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); transition: transform 0.1s; }
                    button:active { transform: scale(0.95); }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Bağlantı Sorunu</h1>
                    <p>NOCCA Coffee POS sunucusuna bağlanılamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyiniz.</p>
                    <button onclick="window.location.href='https://www.noccacoffee.com.tr/admin/pos'">Sistemi Yeniden Başlat</button>
                </div>
            </body>
        </html>
    `;

    mainWindow.loadURL(startUrl).catch(err => {
        console.error('Failed to load URL:', err);
        mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent));
    });

    // Hata ayıklama için gizli kısayol (Ctrl+Shift+I)
    globalShortcut.register('CommandOrControl+Shift+I', () => {
        if (mainWindow) mainWindow.webContents.openDevTools();
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
