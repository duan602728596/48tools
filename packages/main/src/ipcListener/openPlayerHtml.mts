import { BrowserWindow, ipcMain, nativeTheme, type IpcMainEvent } from 'electron';
import type { PlayerInfo } from '@48tools/48tools/src/components/basic/initialState/initialState.js';
import { isDevelopment, isServe, isTest, titleBarIcon, createHtmlFilePath, createInitialState } from '../utils.mjs';
import { themeEvent, type ThemeValue } from './themeChange.mjs';
import { getStore } from '../store.mjs';
import { commandLineOptions } from '../commend.mjs';
import { WinIpcChannel } from '../channelEnum.js';

/* 记录id和窗口的关系 */
export const playerWindowMaps: Map<string, BrowserWindow> = new Map();

interface PlayerInfoSearchParams extends Omit<PlayerInfo, 'liveType' | 'liveMode' | 'rtmpPort' | 'httpPort' | 'proxyPort'> {
  liveType: `${ PlayerInfo['liveType'] }`;
  liveMode: `${ PlayerInfo['liveMode'] }`;
  rtmpPort: `${ PlayerInfo['rtmpPort'] }`;
  httpPort: `${ PlayerInfo['httpPort'] }`;
  proxyPort: `${ PlayerInfo['proxyPort'] }`;
}

/**
 * 打开播放器页面
 * @param { string } title - 窗口标题
 * @param { string } query - 字符串查询参数
 */
function open(title: string, query: string): void {
  const searchParams: URLSearchParams = new URLSearchParams(query);
  const id: string | null = searchParams.get('id');

  if (!id) return;

  if (playerWindowMaps.has(id)) {
    playerWindowMaps.get(id)!.show();

    return;
  }

  const playerSearchParams: PlayerInfoSearchParams = Object.fromEntries(searchParams) as unknown as PlayerInfoSearchParams;

  let win: BrowserWindow | null = new BrowserWindow({
    width: 643,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      contextIsolation: false
    },
    title,
    icon: titleBarIcon,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#000000' : undefined
  });

  // initialState
  const initialStateSearchParams: URLSearchParams = new URLSearchParams();

  initialStateSearchParams.set('initialState', createInitialState({
    theme: getStore().get('theme') ?? 'system',
    commandLineOptions,
    playerInfo: {
      ...playerSearchParams,
      liveType: Number(playerSearchParams.liveType),
      liveMode: Number(playerSearchParams.liveMode),
      rtmpPort: playerSearchParams.rtmpPort ? Number(playerSearchParams.rtmpPort) : undefined,
      httpPort: playerSearchParams.httpPort ? Number(playerSearchParams.httpPort) : undefined,
      proxyPort: playerSearchParams.proxyPort ? Number(playerSearchParams.proxyPort) : undefined
    },
    isTest
  }));

  if (isDevelopment && isServe) {
    win.loadURL(`http://localhost:7654/player.html?${ initialStateSearchParams.toString() }`);
  } else {
    win.loadFile(createHtmlFilePath('player'), {
      search: initialStateSearchParams.toString()
    });
  }

  // 切换主题
  function handleThemeEvent(value: ThemeValue): void {
    win && win.webContents.send(WinIpcChannel.ThemeSource, value);
  }

  win.on('closed', function(): void {
    themeEvent.off('themeSource', handleThemeEvent);
    playerWindowMaps.delete(id);
    win = null;
  });

  themeEvent.on('themeSource', handleThemeEvent);
  playerWindowMaps.set(id, win);
}

function openPlayerHtml(): void {
  ipcMain.on(WinIpcChannel.PlayerHtml, function(event: IpcMainEvent, title: string, query: string): void {
    open(title, query);
  });
}

export default openPlayerHtml;