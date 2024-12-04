import { BrowserWindow, ipcMain, nativeTheme, type Session, type Cookie, type IpcMainEvent } from 'electron';
import { processWindow } from '../ProcessWindow.mjs';
import { pcUserAgent } from '../utils.mjs';
import { WeiboLoginChannel } from '../channelEnum.js';

const WEIBO_URL: string = 'https://weibo.com/';
let weiboLoginWin: BrowserWindow | null = null;

/* 微博登陆 */
function login(): void {
  if (weiboLoginWin !== null) return;

  weiboLoginWin = new BrowserWindow({
    width: 1_250,
    webPreferences: {
      contextIsolation: false
    },
    title: '微博账号登录',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#000000' : undefined
  });
  weiboLoginWin.loadURL(WEIBO_URL, {
    userAgent: pcUserAgent,
    httpReferrer: WEIBO_URL
  });

  // 关闭前获取登陆后的cookie
  weiboLoginWin.on('close', async function(): Promise<void> {
    if (processWindow && weiboLoginWin) {
      const ses: Session = weiboLoginWin.webContents.session;
      const winSes: Session = processWindow.webContents.session;
      const cookies: Array<Cookie> = await ses.cookies.get({ url: undefined });

      processWindow.webContents.send(WeiboLoginChannel.WeiboLoginCookie, cookies);
      await Promise.all([
        ses.clearStorageData({ storages: ['cookies'] }),
        winSes.clearStorageData({ storages: ['cookies'] })
      ]);
    }
  });

  weiboLoginWin.on('closed', function(): void {
    weiboLoginWin = null;
  });
}

function weiboLogin(): void {
  ipcMain.on(WeiboLoginChannel.WeiboLogin, function(event: IpcMainEvent): void {
    login();
  });
}

export default weiboLogin;