import * as path from 'node:path';
import { BrowserWindow, ipcMain, type IpcMainEvent } from 'electron';
import { isDevelopment, wwwPath, initialState as ils } from '../utils';
import { themeEvent, type ThemeValue } from './themeChange';
import store from '../store';

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

  if (!id) return;

  if (playerWindowMaps.has(id)) {
    playerWindowMaps.get(id)!.show();

    return;
  }

  let win: BrowserWindow | null = new BrowserWindow({
    width: 650,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      contextIsolation: false
    },
    title,
    show: false
  });

  win.on('ready-to-show', function(): void {
    win!.show();
  });

  function handleThemeEvent(value: ThemeValue): void {
    if (win) {
      win.webContents.send('themeSource', value);
    }
  }

  // initialState
  searchParams.set('initialState', ils({
    theme: store.get('theme') ?? 'system'
  }));

  if (win) {
    win.loadFile(
      isDevelopment
        ? path.join(wwwPath, '48tools/dist/player.html')
        : path.join(wwwPath, 'dist/player.html'),
      {
        search: searchParams.toString()
      }
    );

    win.on('closed', function(): void {
      themeEvent.off('themeSource', handleThemeEvent);
      playerWindowMaps.delete(id);
      win = null;
    });

    themeEvent.on('themeSource', handleThemeEvent);
  }

  playerWindowMaps.set(id, win);
}

function openPlayerHtml(): void {
  ipcMain.on(type, function(event: IpcMainEvent, title: string, query: string): void {
    open(title, query);
  });
}

export default openPlayerHtml;