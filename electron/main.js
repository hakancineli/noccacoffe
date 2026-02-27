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

    mainWindow.loadURL(startUrl).catch(err => {
        console.error('Initial load failed:', err);
    });

    // Hata ayıklama için Ctrl+Shift+I aktif kalsın
    globalShortcut.register('CommandOrControl+Shift+I', () => {
        if (mainWindow) mainWindow.webContents.openDevTools();
    });

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
