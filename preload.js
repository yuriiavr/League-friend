const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    minimizeWindow: () => ipcRenderer.send('minimize-window'),
    maximizeRestoreWindow: () => ipcRenderer.send('maximize-restore-window'),
    closeWindow: () => ipcRenderer.send('close-window'),
    onSetMaximized: (callback) => ipcRenderer.on('set-maximized', callback),
    onSetUnmaximized: (callback) => ipcRenderer.on('set-unmaximized', callback),
    getBackendUrl: (callback) => ipcRenderer.on('backend-url', (event, url) => callback(url))
});
