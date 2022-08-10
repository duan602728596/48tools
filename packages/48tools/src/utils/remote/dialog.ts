import {
  ipcRenderer,
  type OpenDialogOptions,
  type OpenDialogReturnValue,
  type SaveDialogOptions,
  type SaveDialogReturnValue
} from 'electron';

/**
 * 显示打开的文件选择框
 * @param { OpenDialogOptions } options: 配置
 * @return { Promise<OpenDialogReturnValue> }
 */
export function showOpenDialog(options: OpenDialogOptions): Promise<OpenDialogReturnValue> {
  return ipcRenderer.invoke('show-open-dialog', options);
}

/**
 * 显示保存的文件选择框
 * @param { SaveDialogOptions } options: 配置
 * @return { Promise<SaveDialogReturnValue> }
 */
export function showSaveDialog(options: SaveDialogOptions): Promise<SaveDialogReturnValue> {
  return ipcRenderer.invoke('show-save-dialog', options);
}