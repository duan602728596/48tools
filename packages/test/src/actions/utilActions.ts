import type { JSHandle } from '@playwright/test';
import type Electron from 'electron';
import type { IpcMainInvokeEvent, SaveDialogOptions, SaveDialogReturnValue } from 'electron';
import { parse } from 'cookie';
import * as config from '../utils/config.js';
import { testConfig } from '../testConfig.js';
import type ElectronApp from '../utils/ElectronApp.js';

interface CookieItem {
  key: string;
  value: string;
}

/* 设置ffmpeg的地址 */
export function setFFmpegPath(app: ElectronApp): Promise<JSHandle> {
  return app.win.evaluateHandle((ffmpegPath: string): void =>
    localStorage.setItem('FFMPEG_PATH', ffmpegPath), config.ffmpegPath);
}

/* 设置B站的Cookie */
export function setBilibiliCookie(app: ElectronApp): Promise<JSHandle> | void {
  if (testConfig.bilibili.cookie) {
    return app.win.evaluateHandle((cookie: string): void =>
      localStorage.setItem('BILIBILI_COOKIE', JSON.stringify({
        time: '2023-12-17 08:55:31',
        cookie
      })), testConfig.bilibili.cookie);
  }
}

/* 设置抖音的cookie */
export function setDouyinCookie(app: ElectronApp): Promise<JSHandle> | void {
  if (testConfig.douyin.cookie) {
    const cookies: Record<string, string> = parse(testConfig.douyin.cookie);
    const cookieMap: Map<string, string> = new Map();

    Object.keys(cookies).forEach((key: string): unknown => cookieMap.set(key, cookies[key]));

    const cookieArray: Array<CookieItem> = [];

    cookieMap.forEach((v: string, k: string): unknown => cookieArray.push({ key: k, value: v }));

    return app.win.evaluateHandle((cookie: string): void =>
      localStorage.setItem('DOUYIN_COOKIE', cookie), JSON.stringify(cookieArray));
  }
}

/* mock show-save-dialog事件 */
export async function mockShowSaveDialog(app: ElectronApp, savePath: string): Promise<void> {
  await app.electronApp.evaluate(({ ipcMain }: typeof Electron, _savePath: string): void => {
    ipcMain.removeHandler('show-save-dialog');
    ipcMain.handle(
      'show-save-dialog',
      function(event: IpcMainInvokeEvent, options: SaveDialogOptions): Promise<SaveDialogReturnValue> {
        return Promise.resolve({
          canceled: false,
          filePath: _savePath
        });
      });
  }, savePath);
}