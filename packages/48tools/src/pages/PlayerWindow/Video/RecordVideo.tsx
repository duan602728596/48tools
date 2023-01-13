import { useEffect, useRef, type ReactElement, type RefObject, type MutableRefObject } from 'react';
import videojs from 'video.js';
import * as classNames from 'classnames';
import style from './recordVideo.sass';
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
  const flvjsPlayerRef: MutableRefObject<any | undefined> = useRef();
  const videoContainerRef: RefObject<HTMLDivElement> = useRef(null);
  const videoRef: RefObject<HTMLVideoElement> = useRef(null);

  // 加载视频
  async function loadVideo(): Promise<void> {
    if (videoRef.current && info) {
      const m3u8Data: string = await requestDownloadFile(info.content.playStreamPath, {
        'Host': 'cychengyuan-vod.48.cn',
        'User-Agent': 'SNH48 ENGINE'
      });
      const blob: Blob = new Blob([formatTsUrl(m3u8Data, playerInfo.proxyPort)], { type: 'application/vnd.apple.mpegurl' });
      const m3u8Url: string = URL.createObjectURL(blob);

      flvjsPlayerRef.current = videojs(videoRef.current, {
        children: []
      });

      const tech: HTMLVideoElement | null | undefined = videoContainerRef.current?.querySelector('.vjs-tech');

      if (tech) {
        tech.controls = true;
        tech.tabIndex = 0;
      }

      flvjsPlayerRef.current.src({
        src: m3u8Url,
        type: 'application/vnd.apple.mpegURL',
        withCredentials: true
      });
    }
  }

  useEffect(function(): () => void {
    loadVideo();

    return function(): void {
      flvjsPlayerRef.current?.dispose?.();
    };
  }, [info, playerInfo]);

  return (
    <div ref={ videoContainerRef } className={ classNames('grow relative', style.videoContainer) }>
      <video ref={ videoRef }
        className="absolute z-10 inset-0 w-full h-full bg-[#000] outline-0"
        controls={ true }
        poster={ source(playerInfo.coverPath) }
      />
    </div>
  );
}

export default RecordVideo;