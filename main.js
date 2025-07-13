const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 700, // Додайте мінімальну ширину
        minHeight: 550, // Додайте мінімальну висоту
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true // Залишаємо для безпеки
        }
    });

    mainWindow.loadFile('index.html');
    // Відкрити DevTools для налагодження (можна закоментувати для релізу)
    mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// --- IPC Main обробники Riot API більше не потрібні тут ---
// Вони були перенесені до вашого backend-server/server.js
// ipcMain.handle('get-summoner-data', ...);