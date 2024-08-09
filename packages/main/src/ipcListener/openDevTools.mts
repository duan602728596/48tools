import { ipcMain, type IpcMainEvent } from 'electron';
import { processWindow } from '../ProcessWindow.mjs';
import { WinIpcChannel } from '../channelEnum.js';

/* 打开开发者工具 */
function openDevTools(): void {
  ipcMain.on(WinIpcChannel.DeveloperTools, function(event: IpcMainEvent): void {
    processWindow?.webContents.openDevTools();
  });
}

export default openDevTools;