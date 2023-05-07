import * as process from 'node:process';
import * as path from 'node:path';
import { app, BrowserWindow, Menu, nativeTheme } from 'electron';
import { isDevelopment, isTest, wwwPath, initialState as ils, packageJson } from './utils';
import { ipc, removeIpc } from './ipc';
import ipcRemoteHandle from './ipcHandle/ipcRemoteHandle';
import { nodeMediaServerClose } from './nodeMediaServer/nodeMediaServer';
import { toutiaoRequestInit } from './webRequest/toutiaoRequest';
import weiboResourceRequestInit from './webRequest/weiboResourceRequest';
import store from './store';
import logProtocol from './logProtocol/logProtocol';
import { commandLineOptions } from './commend';
import type { ThemeValue } from './ipcListener/themeChange';

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'; // 关闭警告

/* BrowserWindow窗口对象 */
let win: BrowserWindow | null = null;

/* 初始化 */
function createWindow(): void {
  // 初始化设置当前的主题
  const themeSource: ThemeValue | undefined = store.get('theme');

  if (themeSource) {
    nativeTheme.themeSource = themeSource;
  }

  logProtocol();

  win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      contextIsolation: false
    },
    title: `48tools - ${ packageJson.version }`,
    icon: isDevelopment ? undefined : path.join(wwwPath, 'titleBarIcon.png'),
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#000000' : undefined
  });

  if (isDevelopment && !isTest) {
    win.webContents.openDevTools();
  }

  win.loadFile(
    isDevelopment
      ? path.join(wwwPath, '48tools/dist/index.html')
      : path.join(wwwPath, 'dist/index.html'),
    {
      query: {
        initialState: ils({
          theme: themeSource ?? 'system',
          commandLineOptions
        })
      }
    }
  );

  // 去掉顶层菜单
  Menu.setApplicationMenu(null);

  ipc(win);

  try {
    ipcRemoteHandle(win);
  } catch {}

  win.on('closed', async function(): Promise<void> {
    await nodeMediaServerClose();
    removeIpc();
    win = null;
  });

  toutiaoRequestInit();
  weiboResourceRequestInit();
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