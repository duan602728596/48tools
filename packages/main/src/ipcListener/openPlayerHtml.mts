import { BrowserWindow, ipcMain, nativeTheme, type IpcMainEvent } from 'electron';
import type { PlayerInfo } from '@48tools/48tools/src/components/basic/initialState/initialState.js';
import type { Pocket48LiveType, Pocket48LiveMode } from '@48tools/48tools/src/services/48/enum.js';
import { isTest, titleBarIcon, createHtmlFilePath, initialState as ils } from '../utils.mjs';
import { themeEvent, type ThemeValue } from './themeChange.mjs';
import { getStore } from '../store.mjs';
import { commandLineOptions } from '../commend.mjs';
import { WinIpcChannel } from '../channelEnum.js';

/* 记录id和窗口的关系 */
export const playerWindowMaps: Map<string, BrowserWindow> = new Map();

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

  const player: Record<string, string> = Object.fromEntries(searchParams);
  const inRecord: boolean = player.playerType === 'record';

  let win: BrowserWindow | null = new BrowserWindow({
    width: inRecord ? 643 : 327,
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

  initialStateSearchParams.set('initialState', ils({
    theme: getStore().get('theme') ?? 'system',
    commandLineOptions,
    playerInfo: {
      ...player,
      liveType: Number(player.liveType) as Pocket48LiveType,
      liveMode: Number(player.liveMode) as Pocket48LiveMode,
      rtmpPort: player.rtmpPort ? Number(player.rtmpPort) : undefined,
      httpPort: player.httpPort ? Number(player.httpPort) : undefined,
      proxyPort: player.proxyPort ? Number(player.proxyPort) : undefined
    } as PlayerInfo,
    isTest
  }));

  win.loadFile(createHtmlFilePath('player'),
    {
      search: initialStateSearchParams.toString()
    }
  );

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