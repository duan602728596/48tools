import { ipcMain, BrowserWindow, IpcMainEvent } from 'electron';
import openPlayerHtml from './openPlayerHtml';


/* ipc通信 */
function ipc(win: BrowserWindow): void {
  // 打开开发者工具
  ipcMain.on('developer-tools', function(event: IpcMainEvent, ...args: any[]): void {
    win.webContents.openDevTools();
  });

  // 获取其他路由的文件的绝对路径
  ipcMain.on('player.html', function(event: IpcMainEvent, ...args: any[]): void {
    openPlayerHtml(args[0], args[1]);
  });
}

export default ipc;