import * as process from 'node:process';
import * as path from 'node:path';
import { app, BrowserWindow, Menu } from 'electron';
import * as remoteMain from '@electron/remote/main';
import { isDevelopment, isTest, wwwPath } from './utils';
import { ipc, removeIpc } from './ipc';
import { nodeMediaServerClose } from './nodeMediaServer/nodeMediaServer';
import { toutiaoRequestInit } from './toutiaoRequest/toutiaoRequest';

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'; // 关闭警告
remoteMain.initialize();

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
      contextIsolation: false
    },
    icon: isDevelopment ? undefined : path.join(wwwPath, 'titleBarIcon.png')
  });

  remoteMain.enable(win.webContents);

  if (isDevelopment && !isTest) {
    win.webContents.openDevTools();
  }

  win.loadFile(
    isDevelopment
      ? path.join(wwwPath, '48tools/dist/index.html')
      : path.join(wwwPath, 'dist/index.html')
  );

  // 去掉顶层菜单
  Menu.setApplicationMenu(null);

  ipc(win);

  win.on('closed', async function(): Promise<void> {
    await nodeMediaServerClose();
    removeIpc();
    win = null;
  });

  toutiaoRequestInit();
}

// https://github.com/microsoft/vscode/issues/116715#issuecomment-917783861
app.commandLine.appendSwitch('enable-features', 'SharedArrayBuffer');

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