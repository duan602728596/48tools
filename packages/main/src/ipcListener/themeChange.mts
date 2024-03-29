import { EventEmitter } from 'node:events';
import { ipcMain, nativeTheme, type IpcMainEvent } from 'electron';
import { getStore } from '../store.mjs';
import { WinIpcChannel } from '../channelEnum.js';

export type ThemeValue = 'light' | 'dark' | 'system';

class ThemeSourceEvent extends EventEmitter {}
export const themeEvent: ThemeSourceEvent = new ThemeSourceEvent();

/* 切换主题 */
function themeChange(): void {
  /* 暗黑模式切换 */
  ipcMain.on(
    WinIpcChannel.NativeThemeChange,
    /**
     * @param { IpcMainEvent } event
     * @param { ThemeValue } value - 主题
     * @param { boolean } themeSourceEvent - 是否触发子窗口的变化
     */
    function(event: IpcMainEvent, value: ThemeValue, themeSourceEvent: boolean): void {
      getStore().set('theme', value);
      nativeTheme.themeSource = value;

      if (themeSourceEvent) {
        themeEvent.emit('themeSource', value);
      }
    });
}

export default themeChange;