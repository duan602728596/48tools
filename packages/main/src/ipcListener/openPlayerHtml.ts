import * as path from 'node:path';
import { BrowserWindow, ipcMain, type IpcMainEvent } from 'electron';
import * as remoteMain from '@electron/remote/main';
import { isDevelopment, wwwPath } from '../utils';
import { themeEvent, type ThemeValue } from './themeChange';

export const type: string = 'player.html';

/* 记录id和窗口的关系 */
export const playerWindowMaps: Map<string, BrowserWindow> = new Map();

/**
 * 打开播放器页面
 * @param { string } title: 窗口标题
 * @param { string } query: 字符串查询参数
 */
function open(title: string, query: string): void {
  const searchParams: URLSearchParams = new URLSearchParams(query);
  const id: string | null = searchParams.get('id');
  let win: BrowserWindow | null = new BrowserWindow({
    width: 300,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      contextIsolation: false
    },
    title
  });

  remoteMain.enable(win.webContents);

  function handleThemeEvent(value: ThemeValue): void {
    if (win) {
      win.webContents.send('themeSource', value);
    }
  }

  if (win) {
    win.loadFile(
      isDevelopment
        ? path.join(wwwPath, '48tools/dist/player.html')
        : path.join(wwwPath, 'dist/player.html'),
      { search: query }
    );

    win.on('closed', function(): void {
      themeEvent.off('themeSource', handleThemeEvent);
      id && playerWindowMaps.delete(id);
      win = null;
    });

    themeEvent.on('themeSource', handleThemeEvent);
  }

  id && playerWindowMaps.set(id, win);
}

function openPlayerHtml(): void {
  ipcMain.on(type, function(event: IpcMainEvent, title: string, query: string): void {
    open(title, query);
  });
}

export default openPlayerHtml;