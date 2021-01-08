import { ipcMain, BrowserWindow, IpcMainEvent } from 'electron';
import openPlayerHtml from './openPlayerHtml';
import ipcTheme from './ipcTheme';

/* ipc通信 */
function ipc(win: BrowserWindow): void {
  // 打开开发者工具
  ipcMain.on('developer-tools', function(event: IpcMainEvent): void {
    win.webContents.openDevTools();
  });

  // 获取其他路由的文件的绝对路径
  ipcMain.on('player.html', function(event: IpcMainEvent, title: string, query: string): void {
    openPlayerHtml(title, query);
  });

  // 切换主题
  ipcTheme();
}

export default ipc;