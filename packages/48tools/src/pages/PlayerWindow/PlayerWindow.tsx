import { useState, useEffect, useMemo, type ReactElement, type Dispatch as D, type SetStateAction as S } from 'react';
import * as classNames from 'classnames';
import style from './playerWindow.sass';
import LiveInfo from './LiveInfo/LiveInfo';
import Video from './Video/Video';
import Danmu from './Danmu/Danmu';
import { requestLiveRoomInfo } from '../48/services/pocket48';
import type { LiveRoomInfo } from '../48/services/interface';

export interface Search {
  coverPath: string;
  title: string;
  liveId: string;
  id: string;
  liveType: number;
  rtmpPort: number;
  httpPort: number;
}

/* 直播窗口 */
function PlayerWindow(props: {}): ReactElement {
  const search: Search = useMemo(function(): Search {
    const searchParams: URLSearchParams = new URLSearchParams(window.location.search);

    return {
      coverPath: searchParams.get('coverPath')!,
      title: searchParams.get('title')!,
      liveId: searchParams.get('liveId')!,
      id: searchParams.get('id')!,
      liveType: Number(searchParams.get('liveType')!),
      rtmpPort: Number(searchParams.get('rtmpPort')!),
      httpPort: Number(searchParams.get('httpPort')!)
    };
  }, []);
  const [info, setInfo]: [LiveRoomInfo | undefined, D<S<LiveRoomInfo | undefined>>]
    = useState(undefined); // 直播信息

  // 请求直播间信息
  async function getLiveRoomInfo(): Promise<void> {
    try {
      const res: LiveRoomInfo = await requestLiveRoomInfo(search.liveId);

      setInfo(res);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(function(): void {
    getLiveRoomInfo();
  }, []);

  return (
    <div className={ classNames('flex', style.text) }>
      <div className="p-[16px] grow-1">
        <LiveInfo search={ search } info={ info } />
        <Video search={ search } info={ info } />
      </div>
      <div className="shrink-0 mr-[16px] mt-[16px] w-[300px] text-[12px]">
        <Danmu info={ info } />
      </div>
    </div>
  );
}

export default PlayerWindow;