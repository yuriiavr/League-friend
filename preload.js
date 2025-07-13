// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // API для логіну користувача
    loginUser: (userData) => ipcRenderer.invoke('login-user', userData),
    // API для отримання збережених даних користувача (для "запам'ятати мене")
    getStoredUserData: () => ipcRenderer.invoke('get-stored-user-data'),
    // API для виходу (видалення збережених даних)
    logoutUser: () => ipcRenderer.invoke('logout-user'),
    // API для початку пошуку (додавання в чергу)
    startSearch: (userData) => ipcRenderer.invoke('start-search', userData),
    // API для зупинки пошуку (видалення з черги)
    stopSearch: (data) => ipcRenderer.invoke('stop-search', data),
    // API для отримання списку гравців у черзі для певного регіону
    getBuddiesInQueue: (region) => ipcRenderer.invoke('get-buddies-in-queue', region),

    // Можна додати слухачі для Socket.IO, якщо потрібні пуш-повідомлення в реальному часі
    // onQueueUpdate: (callback) => ipcRenderer.on('queue-update', (_event, value) => callback(value))
});