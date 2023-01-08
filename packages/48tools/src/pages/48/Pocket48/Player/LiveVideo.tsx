import { useState, useEffect, useMemo, type ReactElement, type Dispatch as D, type SetStateAction as S } from 'react';
import LiveInfo from './LiveInfo/LiveInfo';
import Video from './Video/Video';
import { requestLiveRoomInfo } from '../../services/pocket48';
import type { LiveRoomInfo } from '../../services/interface';

export interface Search {
  coverPath: string;
  title: string;
  liveId: string;
  id: string;
  liveType: number;
  rtmpPort: number;
  httpPort: number;
}

/* LiveVideo */
function LiveVideo(props: {}): ReactElement {
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
    <div className="p-[16px]">
      <LiveInfo search={ search } info={ info } />
      <Video search={ search } info={ info } />
    </div>
  );
}

export default LiveVideo;