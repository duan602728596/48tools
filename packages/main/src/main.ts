import * as process from 'process';
import * as path from 'path';
import { app, BrowserWindow, Menu } from 'electron';
import { initialize } from '@electron/remote/main';
import { isDevelopment } from './utils';
import { ipc, removeIpc } from './ipc';
import { nodeMediaServerClose } from './nodeMediaServer/nodeMediaServer';

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'; // 关闭警告
initialize();

/* BrowserWindow窗口对象 */
let win: BrowserWindow | null = null;

/* 初始化 */
function createWindow(): void {
  win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      enableRemoteModule: true,
      contextIsolation: false
    },
    icon: isDevelopment ? undefined : path.join(__dirname, '../../titleBarIcon.png')
  });

  if (isDevelopment) {
    win.webContents.openDevTools();
  }

  win.loadFile(
    isDevelopment
      ? path.join(__dirname, '../../48tools/dist/index.html')
      : path.join(__dirname, '../../dist/index.html')
  );

  // 去掉顶层菜单
  Menu.setApplicationMenu(null);

  ipc(win);

  win.on('closed', async function(): Promise<void> {
    await nodeMediaServerClose();
    removeIpc();
    win = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function(): void {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function(): void {
  if (win === null) {
    createWindow();
  }
});