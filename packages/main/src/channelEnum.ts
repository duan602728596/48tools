/* 统一管理channel type */

// ipcHandle/ipcRemoteHandle
export const enum IpcRemoteHandleChannel {
  ShowOpenDialog = 'show-open-dialog',
  ShowSaveDialog = 'show-save-dialog',
  NativeMessage = 'native-message'
}

// ipcHandle/pocket48LiveRemoteHandle
export const enum Pocket48LiveRemoteHandleChannel {
  Pocket48LiveStart = 'pocket48-live-start',
  Pocket48LiveKill = 'pocket48-live-kill',
  Pocket48LiveClose = 'pocket48-live-close___'
}

// ipcHandle/nodeNimLoginHandle
export const enum NodeNimLoginHandleChannel {
  NodeNimLogin = 'node-nim-login',
  NodeNimClean = 'node-nim-clean'
}

// ipcListener/douyinCookie
export const enum DouyinCookieChannel {
  DouyinCookie = 'douyin-cookie',
  DouyinCookieResponse = 'douyin-cookie-response'
}

// ipcListener/kuaishouCookie
export const enum KuaishouCookieChannel {
  KuaishouCookie = 'kuaishou-cookie',
  KuaiShouCookieResponse = 'kuaishou-cookie-response'
}

// Electron ipc channel
export const enum WinIpcChannel {
  DeveloperTools = 'developer-tools',
  PlayerDeveloperTools = 'player-developer-tools',
  PlayerHtml = 'player.html',
  NativeThemeChange = 'nativeTheme:change',
  ThemeSource = 'themeSource'
}

// ipcListener/weiboLogin
export const enum WeiboLoginChannel {
  WeiboLogin = 'weibo-login',
  WeiboLoginCookie = 'weibo-login-cookie'
}

// nodeMediaServer
export const enum NodeMediaServerChannel {
  NodeMediaServer = 'node-media-server'
}

// proxyServer
export const enum ProxyServerChannel {
  ProxyServer = 'proxy-server'
}