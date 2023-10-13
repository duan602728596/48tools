import {
  ipcMain,
  BrowserWindow,
  nativeTheme,
  type Session,
  type IpcMainEvent,
  type Cookie
} from 'electron';
import { pcUserAgent } from '../utils.mjs';
import { KuaishouCookieChannel } from '../channelEnum.js';

const kuaishouUrl: string = 'https://www.kuaishou.com';
let kuaishouWin: BrowserWindow | null = null;

/* 打开快手网站并获取cookie */
function kuaishouWebsite(win: BrowserWindow, videoId: string): void {
  if (kuaishouWin !== null) return;

  kuaishouWin = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      contextIsolation: false
    },
    title: '快手',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#000000' : undefined
  });
  kuaishouWin.loadURL(kuaishouUrl, {
    userAgent: pcUserAgent
  });

  // 关闭前获取登陆后的cookie
  kuaishouWin.on('close', async function(): Promise<void> {
    if (kuaishouWin) {
      const ses: Session = kuaishouWin.webContents.session;
      const winSes: Session = win.webContents.session;
      const cookies: Array<Cookie> = await ses.cookies.get({ url: kuaishouUrl });

      win.webContents.send(KuaishouCookieChannel.KuaiShouCookieResponse, cookies, videoId);
      await Promise.all([
        ses.clearStorageData({ storages: ['cookies'] }),
        winSes.clearStorageData({ storages: ['cookies'] })
      ]);
    }
  });

  kuaishouWin.on('closed', function(): void {
    kuaishouWin = null;
  });
}

export function kuaishouCaptchaCookie(win: BrowserWindow): void {
  ipcMain.on(KuaishouCookieChannel.KuaishouCookie, function(event: IpcMainEvent, videoId: string): void {
    kuaishouWebsite(win, videoId);
  });
}