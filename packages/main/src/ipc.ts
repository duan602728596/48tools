import { ipcMain, type BrowserWindow } from 'electron';
import openDevTools, { type as openDevToolsType } from './ipcListener/openDevTools';
import openPlayerHtml, { type as openPlayerHtmlType } from './ipcListener/openPlayerHtml';
import openPlayerDevTools, { type as openPlayerDevToolsType } from './ipcListener/openPlayerDevTools';
import themeChange, { type as themeChangeType } from './ipcListener/themeChange';
import weiboLogin, { type as weiboLoginType } from './ipcListener/weiboLogin';
import nodeMediaServer, { type as nodeMediaServerType } from './nodeMediaServer/nodeMediaServer';
import proxyServer, { type as proxyServerType } from './proxyServer/proxyServer';
import { kuaishouCaptchaCookie, type as kuaishouCaptchaCookieType } from './ipcListener/kuaishouCaptcha';
import { douyinCaptchaCookie, type as douyinCaptchaCookieType } from './ipcListener/douyinCookie';

// 移除所有监听的通信
const removeListenerChannel: Array<string> = [
  openDevToolsType,
  openPlayerHtmlType,
  openPlayerDevToolsType,
  themeChangeType,
  weiboLoginType,
  nodeMediaServerType,
  proxyServerType,
  kuaishouCaptchaCookieType,
  douyinCaptchaCookieType
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