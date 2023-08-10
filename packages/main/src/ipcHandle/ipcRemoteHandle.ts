import {
  ipcMain,
  dialog,
  type BrowserWindow,
  type IpcMainInvokeEvent,
  type OpenDialogOptions,
  type OpenDialogReturnValue,
  type SaveDialogOptions,
  type SaveDialogReturnValue,
  type MessageBoxOptions,
  type MessageBoxReturnValue
} from 'electron';
import { IpcRemoteHandleChannel } from '../channelEnum';

/* Remote方法的迁移 */
function ipcRemoteHandle(win: BrowserWindow): void {
  // 显示打开的文件选择框
  ipcMain.handle(
    IpcRemoteHandleChannel.ShowOpenDialog,
    function(event: IpcMainInvokeEvent, options: OpenDialogOptions): Promise<OpenDialogReturnValue> {
      return dialog.showOpenDialog(options);
    });

  // 显示保存的文件选择框
  ipcMain.handle(
    IpcRemoteHandleChannel.ShowSaveDialog,
    function(event: IpcMainInvokeEvent, options: SaveDialogOptions): Promise<SaveDialogReturnValue> {
      return dialog.showSaveDialog(options);
    });

  // 显示native的message提示
  ipcMain.handle(
    IpcRemoteHandleChannel.NativeMessage,
    function(event: IpcMainInvokeEvent, options: MessageBoxOptions): Promise<MessageBoxReturnValue> {
      return dialog.showMessageBox(win, options);
    });
}

export default ipcRemoteHandle;