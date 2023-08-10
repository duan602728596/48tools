import { ipcMain, type BrowserWindow } from 'electron';
import openDevTools from './ipcListener/openDevTools';
import openPlayerHtml from './ipcListener/openPlayerHtml';
import openPlayerDevTools from './ipcListener/openPlayerDevTools';
import themeChange from './ipcListener/themeChange';
import weiboLogin from './ipcListener/weiboLogin';
import nodeMediaServer from './nodeMediaServer/nodeMediaServer';
import proxyServer from './proxyServer/proxyServer';
import { kuaishouCaptchaCookie } from './ipcListener/kuaishouCaptcha';
import { douyinCaptchaCookie } from './ipcListener/douyinCookie';
import {
  DouyinCookieChannel,
  KuaishouCookieChannel,
  WinIpcChannel,
  WeiboLoginChannel,
  NodeMediaServerChannel,
  ProxyServerChannel
} from './channelEnum';

// 移除所有监听的通信
const removeListenerChannel: Array<string | DouyinCookieChannel> = [
  DouyinCookieChannel.DouyinCookie,
  KuaishouCookieChannel.KuaishouCookie,
  WinIpcChannel.DeveloperTools,
  WinIpcChannel.PlayerDeveloperTools,
  WinIpcChannel.PlayerHtml,
  WinIpcChannel.NativeThemeChange,
  WeiboLoginChannel.WeiboLogin,
  NodeMediaServerChannel.NodeMediaServer,
  ProxyServerChannel.ProxyServer
];

export function removeIpc(): void {
  for (const channel of removeListenerChannel) {
    ipcMain.removeAllListeners(channel);
  }
}

/* ipc通信 */
export function ipc(win: BrowserWindow): void {
  openDevTools(win);          // 打开开发者工具
  openPlayerHtml();           // 打开播放器
  openPlayerDevTools();       // 打开播放器开发者工具
  themeChange();              // 主题更换
  weiboLogin(win);            // 微博登录
  nodeMediaServer();          // 启动node-media-server
  proxyServer();              // 启动代理服务
  kuaishouCaptchaCookie(win); // 快手cookie
  douyinCaptchaCookie(win);   // 抖音cookie
}