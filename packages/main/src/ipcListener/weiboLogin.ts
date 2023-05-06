import { BrowserWindow, ipcMain, nativeTheme, type Session, type Cookie, type IpcMainEvent } from 'electron';
import { pcUserAgent } from '../utils';

export const type: string = 'weibo-login';

const weiboUrl: string = 'https://weibo.com/';
let weiboLoginWin: BrowserWindow | null = null;

/* 微博登陆 */
function login(win: BrowserWindow): void {
  if (weiboLoginWin !== null) {
    return;
  }

  weiboLoginWin = new BrowserWindow({
    width: 1250,
    webPreferences: {
      contextIsolation: false
    },
    title: '微博账号登录',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#000000' : undefined
  });
  weiboLoginWin.loadURL(weiboUrl, {
    userAgent: pcUserAgent,
    httpReferrer: 'https://weibo.com/'
  });

  // 关闭前获取登陆后的cookie
  weiboLoginWin.on('close', async function(): Promise<void> {
    if (weiboLoginWin) {
      const ses: Session = weiboLoginWin.webContents.session;
      const winSes: Session = win.webContents.session;
      const cookies: Array<Cookie> = await ses.cookies.get({ url: weiboUrl });

      win.webContents.send('weibo-login-cookie', cookies);
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

function weiboLogin(win: BrowserWindow): void {
  ipcMain.on(type, function(event: IpcMainEvent): void {
    login(win);
  });
}

export default weiboLogin;