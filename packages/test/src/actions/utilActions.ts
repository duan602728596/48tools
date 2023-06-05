import type { JSHandle } from '@playwright/test';
import type Electron from 'electron';
import type { IpcMainInvokeEvent, SaveDialogOptions, SaveDialogReturnValue } from 'electron';
import * as config from '../utils/config.js';
import type ElectronApp from '../utils/ElectronApp.js';

/* 设置ffmpeg的地址 */
export function setFFmpegPath(app: ElectronApp): Promise<JSHandle> {
  return app.win.evaluateHandle((ffmpegPath: string): void =>
    localStorage.setItem('FFMPEG_PATH', ffmpegPath), config.ffmpegPath);
}

/* mock show-save-dialog事件 */
export async function mockShowSaveDialog(app: ElectronApp, savePath: string): Promise<void> {
  await app.electronApp.evaluate(({ ipcMain }: typeof Electron, _savePath: string): void => {
    ipcMain.removeHandler('show-save-dialog');
    ipcMain.handle(
      'show-save-dialog',
      function(event: IpcMainInvokeEvent, options: SaveDialogOptions): Promise<SaveDialogReturnValue> {
        return Promise.resolve({
          canceled: false,
          filePath: _savePath
        });
      });
  }, savePath);
}