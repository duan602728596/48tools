import { ipcMain, type BrowserWindow, type IpcMainEvent } from 'electron';
import { WinIpcChannel } from '../channelEnum';

/* 打开开发者工具 */
function openDevTools(win: BrowserWindow): void {
  ipcMain.on(WinIpcChannel.DeveloperTools, function(event: IpcMainEvent): void {
    win.webContents.openDevTools();
  });
}

export default openDevTools;