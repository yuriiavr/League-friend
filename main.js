const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { autoUpdater } = require('electron-updater');
const path = require("path");
require('dotenv').config();

const BACKEND_URL = process.env.BACKEND_BASE_URL;

autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';

autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Доступне оновлення',
        message: 'Доступна нова версія додатку. Завантаження розпочнеться у фоновому режимі.',
        buttons: ['ОК']
    });
});

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Перезапустити', 'Пізніше'],
        title: 'Оновлення завантажено',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'Нова версія додатку завантажена. Перезапустіть додаток, щоб застосувати оновлення.'
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall();
    });
});

autoUpdater.on('error', (message) => {
    console.error('Сталася помилка при оновленні.');
    console.error(message);
});


let mainWindow;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    minWidth: 700,
    minHeight: 550,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile("index.html");

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('backend-url', BACKEND_URL);
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  ipcMain.on("minimize-window", () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  ipcMain.on("maximize-restore-window", () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.restore();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on("close-window", () => {
    if (mainWindow) {
      mainWindow.close();
    }
  });

  mainWindow.on("closed", () => {
    ipcMain.removeAllListeners("minimize-window");
    ipcMain.removeAllListeners("maximize-restore-window");
    ipcMain.removeAllListeners("close-window");
  });

  autoUpdater.checkForUpdatesAndNotify();
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});