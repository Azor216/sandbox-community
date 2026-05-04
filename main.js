const { app, BrowserWindow } = require('electron');
const path = require('path');

// Start the community server
const SERVER_PORT = 3456;
let server;
try {
    const serverApp = require('./server.js');
} catch(e) {
    // Server starts itself on require, if express is installed
    console.log('Server module note:', e.message);
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1024,
        height: 700,
        title: 'The Sandbox',
        backgroundColor: '#1a1a2e',
        autoHideMenuBar: true,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    const htmlPath = path.join(__dirname, 'index.html');
    console.log('Loading:', htmlPath);
    
    win.loadFile(htmlPath);
    
    win.webContents.on('did-finish-load', () => {
        console.log('Page loaded successfully');
        win.show();
    });

    win.webContents.on('did-fail-load', (e, code, desc) => {
        console.error('Page load failed:', code, desc);
    });
}

app.whenReady().then(createWindow);

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
