import { BrowserWindow, ipcMain, nativeTheme, type IpcMainEvent } from 'electron';
import type { PlayerInfo } from '@48tools/48tools/src/components/basic/initialState/initialState';
import type { Pocket48LiveType, Pocket48LiveMode } from '@48tools/48tools/src/services/48/enum';
import { isTest, titleBarIcon, createHtmlFilePath, initialState as ils } from '../utils';
import { themeEvent, type ThemeValue } from './themeChange';
import { getStore } from '../store';
import { commandLineOptions } from '../commend';
import { WinIpcChannel } from '../channelEnum';

/* 记录id和窗口的关系 */
export const playerWindowMaps: Map<string, BrowserWindow> = new Map();

/**
 * 打开播放器页面
 * @param { string } title: 窗口标题
 * @param { string } query: 字符串查询参数
 */
function open(title: string, query: string): void {
  const searchParams: URLSearchParams = new URLSearchParams(query);
  const id: string | null = searchParams.get('id');

  if (!id) return;

  if (playerWindowMaps.has(id)) {
    playerWindowMaps.get(id)!.show();

    return;
  }

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
  const player: Record<string, string> = Object.fromEntries(searchParams);

  initialStateSearchParams.set('initialState', ils({
    theme: getStore().get('theme') ?? 'system',
    commandLineOptions,
    playerInfo: <PlayerInfo>{
      ...player,
      liveType: Number(player.liveType) as Pocket48LiveType,
      liveMode: Number(player.liveMode) as Pocket48LiveMode,
      rtmpPort: player.rtmpPort ? Number(player.rtmpPort) : undefined,
      httpPort: player.httpPort ? Number(player.httpPort) : undefined,
      proxyPort: player.proxyPort ? Number(player.proxyPort) : undefined
    },
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