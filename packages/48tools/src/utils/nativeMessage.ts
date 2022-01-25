import { dialog, getCurrentWindow } from '@electron/remote';
import type { MessageBoxReturnValue, MessageBoxOptions } from 'electron';

/**
 * 显示native的message提示
 * @param { MessageBoxOptions | string } optionsOrMessageText: 配置
 */
export function nativeMessage(optionsOrMessageText: MessageBoxOptions | string): Promise<MessageBoxReturnValue> {
  const messageOptions: MessageBoxOptions = typeof optionsOrMessageText === 'string'
    ? { message: optionsOrMessageText } : optionsOrMessageText;

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