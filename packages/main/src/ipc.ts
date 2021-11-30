import { ipcMain, type BrowserWindow, type IpcMainEvent } from 'electron';
import { openPlayerHtml, playerWindowMaps } from './function/openPlayerHtml';
import ipcTheme, { NATIVE_THEME_CHANGE_CHANNEL } from './function/ipcTheme';
import weiboLogin from './function/weiboLogin';
import { nodeMediaServerInit, NODE_MEDIA_SERVER_CHANNEL } from './nodeMediaServer/nodeMediaServer';

// 通信类型
const DEVELOP_TOOLS_CHANNEL: string = 'developer-tools';
const PLAYER_HTML_CHANNEL: string = 'player.html';
const PLAYER_DEVELOPER_TOOLS_CHANNEL: string = 'player-developer-tools';
const WEIBO_LOGIN_CHANNEL: string = 'weibo-login';

/* 移除所有监听的通信 */
const removeListenerChannel: Array<string> = [
  DEVELOP_TOOLS_CHANNEL,
  PLAYER_HTML_CHANNEL,
  PLAYER_DEVELOPER_TOOLS_CHANNEL,
  WEIBO_LOGIN_CHANNEL,
  NATIVE_THEME_CHANGE_CHANNEL,
  NODE_MEDIA_SERVER_CHANNEL
];

export function removeIpc(): void {
  for (const channel of removeListenerChannel) {
    ipcMain.removeAllListeners(channel);
  }
}

/* ipc通信 */
export function ipc(win: BrowserWindow): void {
  // 打开开发者工具
  ipcMain.on(DEVELOP_TOOLS_CHANNEL, function(event: IpcMainEvent): void {
    win.webContents.openDevTools();
  });

  // 获取其他路由的文件的绝对路径
  ipcMain.on(PLAYER_HTML_CHANNEL, function(event: IpcMainEvent, title: string, query: string): void {
    openPlayerHtml(title, query);
  });

  /**
   * 根据当前窗口的唯一id打开子窗口的开发者工具
   * @param { IpcMainEvent } event
   * @param { string } pid: 当前窗口的唯一id
   */
  ipcMain.on(PLAYER_DEVELOPER_TOOLS_CHANNEL, function(event: IpcMainEvent, pid: string): void {
    playerWindowMaps.get(pid)?.webContents.openDevTools();
  });

  // 切换主题
  ipcTheme();

  // 微博登陆
  ipcMain.on(WEIBO_LOGIN_CHANNEL, function(event: IpcMainEvent): void {
    weiboLogin(win);
  });

  // 启动node-media-server
  nodeMediaServerInit();
}