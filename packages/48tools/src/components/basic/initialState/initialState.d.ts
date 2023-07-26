import type { CommandLineOptions } from '@48tools/main/src/commend';

// 播放器窗口初始化参数
export interface PlayerInfo {
  coverPath: string;
  title: string;
  liveId: string;
  id: string;
  liveType: number;
  liveMode: number;
  rtmpPort: number;
  httpPort: number;
  proxyPort: number;
  playerType: 'live' | 'record';
}

export interface InitialState {
  theme: 'light' | 'dark' | 'system';
  commandLineOptions: CommandLineOptions;
  playerInfo: PlayerInfo;
  isTest: boolean;
}

declare global {
  interface GlobalThis {
    __INITIAL_STATE__: InitialState;
  }
}