import * as path from 'path';
import * as querystring from 'querystring';
import { BrowserWindow } from 'electron';
import { isDevelopment } from '../utils';
import { themeEvent, ThemeValue } from './ipcTheme';

/* 记录id和窗口的关系 */
export const playerWindowMaps: Map<string, BrowserWindow> = new Map();

/**
 * 打开播放器页面
 * @param { string } title: 窗口标题
 * @param { string } query: 字符串查询参数
 */
export function openPlayerHtml(title: string, query: string): void {
  const { id }: { id?: string } = querystring.parse(query);
  let win: BrowserWindow | null = new BrowserWindow({
    width: 300,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      // @ts-ignore
      enableRemoteModule: true,
      contextIsolation: false
    },
    title
  });

  function handleThemeEvent(value: ThemeValue): void {
    if (win) {
      win.webContents.send('themeSource', value);
    }
  }

  if (win) {
    win.loadFile(
      isDevelopment
        ? path.join(__dirname, '../../../48tools/dist/player.html')
        : path.join(__dirname, '../../../dist/player.html'),
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