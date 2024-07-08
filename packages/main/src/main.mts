import * as process from 'node:process';
import { app, BrowserWindow, Menu, nativeTheme } from 'electron';
import { isDevelopment, isTest, titleBarIcon, createHtmlFilePath, createInitialState, packageJson } from './utils.mjs';
import { ipc, removeIpc } from './ipc.mjs';
import ipcRemoteHandle from './ipcHandle/ipcRemoteHandle.mjs';
import pocket48LiveRemoteHandle from './ipcHandle/pocket48LiveRemoteHandle.mjs';
import { nodeNimHandleLogin, nodeNimCleanup } from './ipcHandle/nodeNimHandleLogin.mjs';
import { nodeMediaServerClose } from './nodeMediaServer/nodeMediaServer.mjs';
import webRequest from './webRequest/webRequest.mjs';
import { storeInit, getStore } from './store.mjs';
import logProtocol from './logProtocol/logProtocol.mjs';
import { commandLineOptions } from './commend.mjs';
import type { ThemeValue } from './ipcListener/themeChange.mjs';

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'; // 关闭警告

/* BrowserWindow窗口对象 */
let processWindow: BrowserWindow | null = null;

/* 初始化 */
function createWindow(): void {
  // 初始化设置当前的主题
  storeInit();

  const themeSource: ThemeValue | undefined = getStore().get('theme');

  if (themeSource) {
    nativeTheme.themeSource = themeSource;
  }

  logProtocol();

  processWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      contextIsolation: false
    },
    title: `48tools - ${ packageJson.version }`,
    icon: titleBarIcon,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#000000' : undefined
  });

  if (isDevelopment && !isTest) {
    processWindow.webContents.openDevTools();
  }

  processWindow.loadFile(createHtmlFilePath('index'),
    {
      query: {
        initialState: createInitialState({
          theme: themeSource ?? 'system',
          commandLineOptions,
          isTest
        })
      }
    }
  );

  // 去掉顶层菜单
  Menu.setApplicationMenu(null);

  ipc(processWindow);

  try {
    ipcRemoteHandle(processWindow);
    pocket48LiveRemoteHandle(processWindow);
    nodeNimHandleLogin();
  } catch {}

  processWindow.on('closed', async function(): Promise<void> {
    await nodeMediaServerClose();
    removeIpc();
    nodeNimCleanup();
    processWindow = null;
  });

  webRequest();
}

// https://github.com/microsoft/vscode/issues/116715#issuecomment-917783861
app.commandLine.appendSwitch('enable-features', 'SharedArrayBuffer');

app.whenReady().then(createWindow);

app.on('window-all-closed', function(): void {
  nodeNimCleanup();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function(): void {
  if (processWindow === null) {
    createWindow();
  }
});