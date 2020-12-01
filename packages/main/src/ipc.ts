import * as process from 'process';
import * as path from 'path';
import { ipcMain, BrowserWindow, IpcMainEvent } from 'electron';

const isDevelopment: boolean = process.env.NODE_ENV === 'development';

/* ipc通信 */
function ipc(win: BrowserWindow): void {
  ipcMain.on('developer-tools', function(event: IpcMainEvent, ...args: any[]): void {
    win.webContents.openDevTools();
  });

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