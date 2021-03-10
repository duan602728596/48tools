import { BrowserWindow, Session, Cookie } from 'electron';

const weiboUrl: string = 'https://weibo.com/';
let weiboLoginWin: BrowserWindow | null = null;

/* 微博登陆 */
function weiboLogin(): void {
  if (weiboLoginWin !== null) {
    return;
  }

  weiboLoginWin = new BrowserWindow();
  weiboLoginWin.loadURL(weiboUrl);

  // 关闭前获取登陆后的cookie
  weiboLoginWin.on('close', async function(): Promise<void> {
    if (weiboLoginWin) {
      const ses: Session = weiboLoginWin.webContents.session;
      const cookies: Array<Cookie> = await ses.cookies.get({ url: weiboUrl });

      weiboLoginWin.webContents.send('weibo-login-cookie', cookies);
      await Promise.all([
        ses.clearStorageData({ origin: weiboUrl, storages: ['cookies'] }),
        ses.clearStorageData({ origin: 'https://passport.97973.com', storages: ['cookies'] }),
        ses.clearStorageData({ origin: 'https://login.sina.com.cn', storages: ['cookies'] }),
        ses.clearStorageData({ origin: 'https://passport.krcom.cn', storages: ['cookies'] }),
        ses.clearStorageData({ origin: 'https://passport.weibo.cn', storages: ['cookies'] }),
        ses.clearStorageData({ origin: 'https://passport.weibo.com', storages: ['cookies'] }),
        ses.clearStorageData({ origin: 'https://weibo.cn', storages: ['cookies'] })
      ]);
    }
  });

  weiboLoginWin.on('closed', function(): void {
    weiboLoginWin = null;
  });
}

export default weiboLogin;