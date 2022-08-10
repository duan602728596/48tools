import {
  ipcMain,
  dialog,
  type BrowserWindow,
  type IpcMainInvokeEvent,
  type MessageBoxOptions,
  type MessageBoxReturnValue
} from 'electron';

/* Remote方法的迁移 */
function ipcRemoteHandle(win: BrowserWindow): void {
  // 显示native的message提示
  ipcMain.handle(
    'native-message',
    function(event: IpcMainInvokeEvent, options: MessageBoxOptions): Promise<MessageBoxReturnValue> {
      return dialog.showMessageBox(win, options);
    });
}

export default ipcRemoteHandle;