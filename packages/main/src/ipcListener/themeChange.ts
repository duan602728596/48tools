import { EventEmitter } from 'node:events';
import { ipcMain, nativeTheme, type IpcMainEvent } from 'electron';
import store from '../store';

export type ThemeValue = 'light' | 'dark' | 'system';

class ThemeSourceEvent extends EventEmitter {}
export const themeEvent: ThemeSourceEvent = new ThemeSourceEvent();
export const type: string = 'nativeTheme:change';

/* 切换主题 */
function themeChange(): void {
  /**
   * 暗黑模式切换
   * @param { ThemeValue } value: 主题
   * @param { boolean } themeSourceEvent: 是否触发子窗口的变化
   */
  ipcMain.on(type, function(event: IpcMainEvent, value: ThemeValue, themeSourceEvent: boolean): void {
    store.set('theme', value);
    nativeTheme.themeSource = value;

    if (themeSourceEvent) {
      themeEvent.emit('themeSource', value);
    }
  });
}

export default themeChange;