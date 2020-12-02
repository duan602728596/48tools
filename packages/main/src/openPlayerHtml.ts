import * as path from 'path';
import * as process from 'process';
import { BrowserWindow } from 'electron';

const isDevelopment: boolean = process.env.NODE_ENV === 'development';

/**
 * 打开播放器页面
 * @param { string } title: 窗口标题
 * @param { string } query: 字符串查询参数
 */
function openPlayerHtml(title: string, query: string): void {
  let win: BrowserWindow | null = new BrowserWindow({
    width: 300,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      enableRemoteModule: true
    },
    title
  });

  if (win) {
    if (isDevelopment) {
      win.webContents.openDevTools();
    }

    win.loadFile(
      isDevelopment
        ? path.join(__dirname, '../../48tools/dist/player.html')
        : path.join(__dirname, '../../dist/player.html'),
      { search: query }
    );

    win.on('closed', function(): void {
      win = null;
    });
  }
}

export default openPlayerHtml;