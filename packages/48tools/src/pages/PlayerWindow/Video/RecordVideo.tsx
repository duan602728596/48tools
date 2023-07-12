import { useEffect, useRef, useSyncExternalStore, type ReactElement, type RefObject, type MutableRefObject } from 'react';
import * as PropTypes from 'prop-types';
import Hls, { type Events, type ManifestParsedData } from 'hls.js';
import { requestDownloadFile, type LiveRoomInfo } from '@48tools-api/48';
import { source, engineUserAgent } from '../../../utils/snh48';
import { formatTsUrl } from '../../48/Pocket48/Pocket48Record/Pocket48Record';
import { danmuStore } from '../function/DanmuStore';
import type { PlayerInfo } from '../../../components/basic/initialState/initialState';
import type { DanmuItem } from '../types';

interface RecordVideoProps {
  playerInfo: PlayerInfo;
  info: LiveRoomInfo | undefined;
}

export const VIDEO_ID: string = 'record-video';

/* 录播视频的播放 */
function RecordVideo(props: RecordVideoProps): ReactElement {
  const { playerInfo, info }: RecordVideoProps = props;
  const danmuList: Array<DanmuItem> = useSyncExternalStore(danmuStore.subscribe, danmuStore.getDanmuList);
  const videoLoaded: boolean = useSyncExternalStore(danmuStore.subscribe, danmuStore.getVideoLoaded);
  const hlsPlayerRef: MutableRefObject<Hls | undefined> = useRef();
  const videoRef: RefObject<HTMLVideoElement> = useRef(null);

  // 加载视频
  async function loadVideo(): Promise<void> {
    if (videoRef.current && info) {
      // 兼容早期的mp4格式的电台
      if (/\.mp4$/.test(info.content.playStreamPath)) {
        videoRef.current.src = info.content.playStreamPath;
        danmuStore.setVideoLoaded(true);

        return;
      }

      if (hlsPlayerRef.current) return;

      const m3u8Data: string = await requestDownloadFile(info.content.playStreamPath, {
        'Host': 'cychengyuan-vod.48.cn',
        'User-Agent': engineUserAgent
      });
      const blob: Blob = new Blob([formatTsUrl(m3u8Data, playerInfo.proxyPort)], { type: 'application/vnd.apple.mpegurl' });
      const m3u8Url: string = URL.createObjectURL(blob);

      hlsPlayerRef.current = new Hls();

      hlsPlayerRef.current.on(Hls.Events.MEDIA_ATTACHED, (): void => {
        danmuStore.setVideoLoaded(true);
        console.log('Video and hls.js are now bound together!');
      });

      hlsPlayerRef.current.on(Hls.Events.MANIFEST_PARSED, (event: Events.MANIFEST_PARSED, data: ManifestParsedData): void => {
        console.log(`Manifest loaded, found ${ data.levels.length } quality level.`);
      });

      hlsPlayerRef.current.loadSource(m3u8Url);
      hlsPlayerRef.current.attachMedia(videoRef.current);
    }
  }

  // 生成弹幕文件
  function createVideoTrack(): void {
    if (videoLoaded && danmuList.length && videoRef.current) {
      const track: TextTrack = videoRef.current.addTextTrack('subtitles', '弹幕', 'zh');

      track.mode = 'hidden';

      for (const item of danmuList) {
        const vttcue: VTTCue = new VTTCue(item.currentTime, item.currentTime + 3, `${ item.nickname }：${ item.message }`);

        vttcue.align = 'left';
        vttcue.line = 500;
        track.addCue(vttcue);
      }
    }
  }

  useEffect(function(): () => void {
    loadVideo();

    return function(): void {
      hlsPlayerRef.current?.destroy?.();
    };
  }, [info, playerInfo]);

  useEffect(function() {
    createVideoTrack();
  }, [danmuList, videoLoaded]);

  return (
    <div className="grow relative">
      <video ref={ videoRef }
        className="absolute z-10 inset-0 w-full h-full bg-[#000] outline-0"
        id={ VIDEO_ID }
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