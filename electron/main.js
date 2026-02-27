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
            nodeIntegration: true,
            contextIsolation: false,
        },
        autoHideMenuBar: true,
        backgroundColor: '#ffffff',
    });

    const startUrl = isDev
        ? 'http://localhost:3000/admin/pos'
        : 'https://www.noccacoffee.com.tr/admin/pos';

    mainWindow.loadURL(startUrl);

    // Hata ayıklama (Ctrl+Shift+I)
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
