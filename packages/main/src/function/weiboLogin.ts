import { BrowserWindow, Session, Cookie } from 'electron';

const weiboUrl: string = 'https://weibo.com/';
let weiboLoginWin: BrowserWindow | null = null;

/* 微博登陆 */
function weiboLogin(): void {
  weiboLoginWin = new BrowserWindow();
  weiboLoginWin.loadURL(weiboUrl);

  // 关闭前获取登陆后的cookie
  weiboLoginWin.on('close', async function(): Promise<void> {
    if (weiboLoginWin) {
      const ses: Session = weiboLoginWin.webContents.session;
      const cookies: Array<Cookie> = await ses.cookies.get({ url: weiboUrl });

      weiboLoginWin.webContents.send('weibo-login-cookie', cookies);
      await ses.clearStorageData({ origin: weiboUrl });
    }
  });

  weiboLoginWin.on('closed', function(): void {
    weiboLoginWin = null;
  });
}

export default weiboLogin;