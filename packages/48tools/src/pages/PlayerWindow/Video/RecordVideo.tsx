import { useEffect, useRef, type ReactElement, type RefObject, type MutableRefObject } from 'react';
import * as PropTypes from 'prop-types';
import Hls, { type Events, type ManifestParsedData } from 'hls.js';
import { source, engineUserAgent } from '../../../utils/snh48';
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
  const flvjsPlayerRef: MutableRefObject<Hls | undefined> = useRef();
  const videoRef: RefObject<HTMLVideoElement> = useRef(null);

  // 加载视频
  async function loadVideo(): Promise<void> {
    if (videoRef.current && info) {
      // 兼容早期的mp4格式的电台
      if (/\.mp4$/.test(info.content.playStreamPath)) {
        videoRef.current.src = info.content.playStreamPath;

        return;
      }

      const m3u8Data: string = await requestDownloadFile(info.content.playStreamPath, {
        'Host': 'cychengyuan-vod.48.cn',
        'User-Agent': engineUserAgent
      });
      const blob: Blob = new Blob([formatTsUrl(m3u8Data, playerInfo.proxyPort)], { type: 'application/vnd.apple.mpegurl' });
      const m3u8Url: string = URL.createObjectURL(blob);

      flvjsPlayerRef.current = new Hls();

      flvjsPlayerRef.current.on(Hls.Events.MEDIA_ATTACHED, (): void => {
        console.log('Video and hls.js are now bound together!');
      });

      flvjsPlayerRef.current.on(Hls.Events.MANIFEST_PARSED, (event: Events.MANIFEST_PARSED, data: ManifestParsedData): void => {
        console.log(`Manifest loaded, found ${ data.levels.length } quality level.`);
      });

      flvjsPlayerRef.current.loadSource(m3u8Url);
      flvjsPlayerRef.current.attachMedia(videoRef.current);
    }
  }

  useEffect(function(): () => void {
    loadVideo();

    return function(): void {
      flvjsPlayerRef.current?.destroy?.();
    };
  }, [info, playerInfo]);

  return (
    <div className="grow relative">
      <video ref={ videoRef }
        className="absolute z-10 inset-0 w-full h-full bg-[#000] outline-0"
        controls={ true }
        poster={ source(playerInfo.coverPath) }
      />
    </div>
  );
}

RecordVideo.propTypes = {
  playerInfo: PropTypes.object,
  info: PropTypes.object
};

export default RecordVideo;