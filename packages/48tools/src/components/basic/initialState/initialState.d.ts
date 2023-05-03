import type { CommandLineOptions } from '@48tools/main/src/commend';
import type { PlayerInfo } from '../../../pages/PlayerWindow/PlayerWindow';

export interface InitialState {
  theme: 'light' | 'dark' | 'system';
  commandLineOptions: CommandLineOptions;
  playerInfo: PlayerInfo;
}

declare global {
  interface GlobalThis {
    __INITIAL_STATE__: InitialState;
  }
}