import { useState, useEffect, type ReactElement, type Dispatch as D, type SetStateAction as S } from 'react';
import * as classNames from 'classnames';
import style from './playerWindow.sass';
import LiveInfo from './LiveInfo/LiveInfo';
import Video from './Video/Video';
import RecordVideo from './Video/RecordVideo';
import Danmu from './Danmu/Danmu';
import { requestLiveRoomInfo } from '../48/services/pocket48';
import type { LiveRoomInfo } from '../48/services/interface';

export interface PlayerInfo {
  coverPath: string;
  title: string;
  liveId: string;
  id: string;
  liveType: number;
  rtmpPort: number;
  httpPort: number;
  proxyPort: number;
  playerType: 'live' | 'record';
}

const playerInfo: PlayerInfo = globalThis.__INITIAL_STATE__.playerInfo;
const inRecord: boolean = playerInfo.playerType === 'record';

/* 直播窗口 */
function PlayerWindow(props: {}): ReactElement {
  const [info, setInfo]: [LiveRoomInfo | undefined, D<S<LiveRoomInfo | undefined>>]
    = useState(undefined); // 直播信息

  // 请求直播间信息
  async function getLiveRoomInfo(): Promise<void> {
    try {
      const res: LiveRoomInfo = await requestLiveRoomInfo(playerInfo.liveId);

      console.log(res.content);
      setInfo(res);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(function(): void {
    getLiveRoomInfo();
  }, []);

  return (
    <div className={ classNames('flex w-full h-full', style.text) }>
      <div className="flex flex-col grow p-[16px] h-full">
        <LiveInfo playerInfo={ playerInfo } info={ info } />
        {
          inRecord
            ? <RecordVideo playerInfo={ playerInfo } info={ info } />
            : <Video playerInfo={ playerInfo } info={ info } />
        }
      </div>
      {
        !inRecord && (
          <div className="flex flex-col shrink-0 pr-[16px] pt-[16px] pb-[16px] w-[300px] h-full text-[12px]">
            <Danmu info={ info } />
          </div>
        )
      }
    </div>
  );
}

export default PlayerWindow;