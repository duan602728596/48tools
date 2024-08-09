import { ipcMain } from 'electron';
import openDevTools from './ipcListener/openDevTools.mjs';
import openPlayerHtml from './ipcListener/openPlayerHtml.mjs';
import openPlayerDevTools from './ipcListener/openPlayerDevTools.mjs';
import themeChange from './ipcListener/themeChange.mjs';
import weiboLogin from './ipcListener/weiboLogin.mjs';
import nodeMediaServer from './nodeMediaServer/nodeMediaServer.mjs';
import proxyServer from './proxyServer/proxyServer.mjs';
import { kuaishouCaptchaCookie } from './ipcListener/kuaishouCaptcha.mjs';
import { douyinCaptchaCookie } from './ipcListener/douyinCookie.mjs';
import {
  DouyinCookieChannel,
  KuaishouCookieChannel,
  WinIpcChannel,
  WeiboLoginChannel,
  NodeMediaServerChannel,
  ProxyServerChannel
} from './channelEnum.js';

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
export function ipc(): void {
  openDevTools();          // 打开开发者工具
  openPlayerHtml();        // 打开播放器
  openPlayerDevTools();    // 打开播放器开发者工具
  themeChange();           // 主题更换
  weiboLogin();            // 微博登录
  nodeMediaServer();       // 启动node-media-server
  proxyServer();           // 启动代理服务
  kuaishouCaptchaCookie(); // 快手cookie
  douyinCaptchaCookie();   // 抖音cookie
}