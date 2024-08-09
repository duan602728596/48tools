import { BrowserWindow, type Session, type Cookie, ipcMain, type IpcMainEvent } from 'electron';
import { processWindow } from '../ProcessWindow.mjs';
import { pcUserAgent } from '../utils.mjs';
import { DouyinCookieChannel } from '../channelEnum.js';

const DOUYIN_URL: string = 'https://www.douyin.com/user/MS4wLjABAAAA6-qJnU8aVPJ4chZQFIyuVHSB3_K3w1rH_L_IuLjaswk';
let douyinWin: BrowserWindow | null = null;

/* 打开抖音网站并操作验证码 */
function douyinCookie(): void {
  if (douyinWin !== null) return;

  douyinWin = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false
    },
    title: '抖音'
  });
  douyinWin.loadURL(DOUYIN_URL, {
    userAgent: pcUserAgent
  });

  // 关闭前获取登陆后的cookie
  douyinWin.on('close', async function(): Promise<void> {
    if (processWindow && douyinWin) {
      const ses: Session = douyinWin.webContents.session;
      const winSes: Session = processWindow.webContents.session;
      const cookies: Array<Cookie> = await ses.cookies.get({});

      processWindow.webContents.send(DouyinCookieChannel.DouyinCookieResponse, cookies);
      await Promise.all([
        ses.clearStorageData({ storages: ['cookies'] }),
        winSes.clearStorageData({ storages: ['cookies'] })
      ]);
    }
  });

  douyinWin.on('closed', function(): void {
    douyinWin = null;
  });
}

export function douyinCaptchaCookie(): void {
  ipcMain.on(DouyinCookieChannel.DouyinCookie, function(event: IpcMainEvent): void {
    douyinCookie();
  });
}