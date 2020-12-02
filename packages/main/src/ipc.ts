import * as process from 'process';
import * as path from 'path';
import { ipcMain, BrowserWindow, IpcMainEvent } from 'electron';

const isDevelopment: boolean = process.env.NODE_ENV === 'development';

/* ipc通信 */
function ipc(win: BrowserWindow): void {
  // 打开开发者工具
  ipcMain.on('developer-tools', function(event: IpcMainEvent, ...args: any[]): void {
    win.webContents.openDevTools();
  });

  // 获取其他路由的文件的绝对路径
  ipcMain.on('player.html', function(event: IpcMainEvent, ...args: any[]): void {
    event.reply(
      'player.html-return',
      isDevelopment
        ? path.join(__dirname, '../../48tools/dist/player.html')
        : path.join(__dirname, '../../dist/player.html')
    );
  });
}

export default ipc;