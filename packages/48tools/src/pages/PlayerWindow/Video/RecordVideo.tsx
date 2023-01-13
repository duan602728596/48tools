import { useEffect, useRef, type ReactElement, type RefObject, type MutableRefObject } from 'react';
import videojs from 'video.js';
import { source } from '../../../utils/utils';
import { requestDownloadFile } from '../../48/services/pocket48';
import { formatTsUrl } from '../../48/Pocket48/Pocket48Record/Pocket48Record';
import type { PlayerInfo } from '../PlayerWindow';
import type { LiveRoomInfo } from '../../48/services/interface';

interface RecordVideoProps {
  playerInfo: PlayerInfo;
  info: LiveRoomInfo | undefined;
}

/* 录播视频的播放 */
function RecordVideo(props: RecordVideoProps): ReactElement {
  const { playerInfo, info }: RecordVideoProps = props;
  const videojsPlayerRef: MutableRefObject<unknown> = useRef();
  const videoRef: RefObject<HTMLVideoElement> = useRef(null);

  // 加载视频
  async function loadVideo(): Promise<void> {
    if (videoRef.current && info) {
      const m3u8Data: string = await requestDownloadFile(info.content.playStreamPath, {
        'Host': 'cychengyuan-vod.48.cn',
        'User-Agent': 'SNH48 ENGINE'
      });
      const blob: Blob = new Blob([formatTsUrl(m3u8Data, playerInfo.proxyPort)], { type: 'application/vnd.apple.mpegurl' });
      const url: string = URL.createObjectURL(blob);
    }
  }

  useEffect(function(): void {
    loadVideo();
  }, [info, playerInfo]);

  return (
    <div className="grow relative">
      <video ref={ videoRef }
        className="absolute z-10 inset-0 w-full h-full bg-[#000] outline-0"
        id="video"
        controls={ true }
        poster={ source(playerInfo.coverPath) }
      />
    </div>
  );
}

export default RecordVideo;