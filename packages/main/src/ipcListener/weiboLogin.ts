import { BrowserWindow, ipcMain, type Session, type Cookie, type IpcMainEvent } from 'electron';

export const type: string = 'weibo-login';

const weiboUrl: string = 'https://weibo.com/';
let weiboLoginWin: BrowserWindow | null = null;

/* 微博登陆 */
function login(win: BrowserWindow): void {
  if (weiboLoginWin !== null) {
    return;
  }

  weiboLoginWin = new BrowserWindow({
    webPreferences: {
      contextIsolation: false
    }
  });
  weiboLoginWin.loadURL(weiboUrl, {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_2) AppleWebKit/537.36'
      + ' (KHTML, like Gecko) Chrome/89.0.4389.72 Safari/537.36 Edg/89.0.774.45',
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