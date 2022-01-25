import { dialog, getCurrentWindow } from '@electron/remote';
import type { MessageBoxReturnValue, MessageBoxOptions } from 'electron';

/**
 * 显示native的message提示
 * @param { MessageBoxOptions | string } options: 配置
 */
export function nativeMessage(options: MessageBoxOptions | string): Promise<MessageBoxReturnValue> {
  const messageOptions: MessageBoxOptions = typeof options === 'string' ? { message: options } : options;

  if (typeof messageOptions.type !== 'string') {
    messageOptions.type = 'info';
  }

  return dialog.showMessageBox(getCurrentWindow(), messageOptions);
}

export function errorNativeMessage(messageText: string): Promise<MessageBoxReturnValue> {
  return nativeMessage({
    message: messageText,
    type: 'error'
  });
}

export function warningNativeMessage(messageText: string): Promise<MessageBoxReturnValue> {
  return nativeMessage({
    message: messageText,
    type: 'warning'
  });
}

export function infoNativeMessage(messageText: string): Promise<MessageBoxReturnValue> {
  return nativeMessage({
    message: messageText,
    type: 'info'
  });
}