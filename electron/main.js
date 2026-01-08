
const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

let mainWindow;

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        title: "NOCCA Coffee POS",
        icon: path.join(__dirname, '../public/images/logo/noccacoffee.jpeg'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        // POS için tam ekran veya çerçevesiz isterseniz burayı özelleştirebiliriz
        autoHideMenuBar: true, // Menü çubuğunu gizle (Alt tuşuyla açılır)
    });

    // Programın açılacağı adres
    const startUrl = isDev
        ? 'http://localhost:3000/admin/pos'
        : 'https://www.noccacoffee.com.tr/admin/pos';

    mainWindow.loadURL(startUrl).catch(err => {
        console.error('Failed to load URL:', err);
        mainWindow.loadHTML(`
      <div style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; background: #f3f4f6;">
        <h1 style="color: #1f2937;">Bağlantı Hatası</h1>
        <p style="color: #6b7280;">Uygulama yüklenemedi. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #006241; color: white; border: none; border-radius: 5px; cursor: pointer;">Tekrar Dene</button>
      </div>
    `);
    });

    // Kapatıldığında belleği boşalt
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
