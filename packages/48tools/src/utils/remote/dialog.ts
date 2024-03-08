import {
  ipcRenderer,
  type OpenDialogOptions,
  type OpenDialogReturnValue,
  type SaveDialogOptions,
  type SaveDialogReturnValue
} from 'electron';
import { IpcRemoteHandleChannel } from '@48tools/main/src/channelEnum';

/**
 * 显示打开的文件选择框
 * @param { OpenDialogOptions } options - 配置
 * @return { Promise<OpenDialogReturnValue> }
 */
export function showOpenDialog(options: OpenDialogOptions): Promise<OpenDialogReturnValue> {
  return ipcRenderer.invoke(IpcRemoteHandleChannel.ShowOpenDialog, options);
}

/**
 * 显示保存的文件选择框
 * @param { SaveDialogOptions } options - 配置
 * @return { Promise<SaveDialogReturnValue> }
 */
export function showSaveDialog(options: SaveDialogOptions): Promise<SaveDialogReturnValue> {
  return ipcRenderer.invoke(IpcRemoteHandleChannel.ShowSaveDialog, options);
}