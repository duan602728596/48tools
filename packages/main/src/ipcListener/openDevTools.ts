import { ipcMain, type BrowserWindow, type IpcMainEvent } from 'electron';

export const type: string = 'developer-tools';

/* 打开开发者工具 */
function openDevTools(win: BrowserWindow): void {
  ipcMain.on(type, function(event: IpcMainEvent): void {
    win.webContents.openDevTools();
  });
}

export default openDevTools;