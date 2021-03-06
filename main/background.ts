import events from 'components/PhotoSwipe/events';
import { app, ipcMain, BrowserWindow, dialog } from 'electron';
import serve from 'electron-serve';
import downloadManager, { RESPONSE_FORMAT } from 'services/downloadManager';
import { createWindow } from './helpers';

const isProd: boolean = process.env.NODE_ENV === 'production';

if (isProd) {
    serve({ directory: 'app' });
} else {
    app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
    await app.whenReady();

    const mainWindow = createWindow('main', {
        width: 1000,
        height: 600,
    });

    if (isProd) {
        await mainWindow.loadURL('app://index.html');
    } else {
        const port = process.argv[2];
        await mainWindow.loadURL(`http://localhost:${port}/`);
        // mainWindow.webContents.openDevTools();
    }
})();

app.on('window-all-closed', () => {
    app.quit();
});

ipcMain.on('start-export', async (event, { url }) => {
    event.sender.send('export-started', Date.now());
});

ipcMain.on('select-dir', async (event, arg) => {
    let dialogWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            enableRemoteModule: false,
            contextIsolation: true,
            sandbox: true,
        },
    });
    console.log('S');
    const result = await dialog.showOpenDialog(dialogWindow, {
        properties: ['openDirectory'],
    });
    const dir = result.filePaths;
    dialogWindow.close();
    event.sender.send('directory-selected', { dir });
});

// ipcMain.on('export-files', async (events, { dir, files }) => {
//     for (let file of files) {
//         downloadManager.downloadFile(file, RESPONSE_FORMAT.STREAM);
//     }
// });
