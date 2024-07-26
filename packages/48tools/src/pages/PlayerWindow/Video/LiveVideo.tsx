import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { useEffect, useRef, type ReactElement, type RefObject } from 'react';
import mpegts from 'mpegts.js';
import type { LiveRoomInfo } from '@48tools-api/48';
import { getFFmpeg } from '../../../utils/utils';
import { source } from '../../../utils/snh48';
import type { PlayerInfo } from '../../../components/basic/initialState/initialState';

function handleChildProcessStdoutOrStderr(data: Buffer): void {
  // console.log(data.toString());
}

function handleChildProcessClose(): void {
  // nothing
}

function handleChildProcessError(err: Error): void {
  console.error(err);
}

interface VideoProps {
  playerInfo: PlayerInfo;
  info: LiveRoomInfo | undefined;
}

/* 视频的播放 */
function LiveVideo(props: VideoProps): ReactElement {
  const { playerInfo, info }: VideoProps = props;
  const childRef: RefObject<ChildProcessWithoutNullStreams | null> = useRef(null);
  const flvPlayerRef: RefObject<mpegts.Player | null> = useRef(null);
  const videoRef: RefObject<HTMLVideoElement | null> = useRef(null);

  // 加载视频
  function loadVideo(): void {
    if (videoRef.current) {
      flvPlayerRef.current = mpegts.createPlayer({
        type: 'flv',
        isLive: true,
        url: `ws://localhost:${ playerInfo.httpPort }/live/${ playerInfo.id }.flv`
      });

      flvPlayerRef.current.attachMediaElement(videoRef.current);
      flvPlayerRef.current.load();
    }
  }

  // 流推送
  function rtmpInit(): void {
    if (!info) return;

    const args: Array<string> = [
      '-re', '-i', info.content.playStreamPath, '-c:v', 'libx264', '-preset', 'superfast',
      '-tune', 'zerolatency', '-c:a', 'aac', '-ar', '44100', '-f', 'flv',
      `rtmp://localhost:${ playerInfo.rtmpPort }/live/${ playerInfo.id }`
    ];
    const child: ChildProcessWithoutNullStreams = spawn(getFFmpeg(), args);

    child.stdout.on('data', handleChildProcessStdoutOrStderr);
    child.stderr.on('data', handleChildProcessStdoutOrStderr);
    child.on('close', handleChildProcessClose);
    child.on('error', handleChildProcessError);

    childRef.current = child;
    loadVideo();
  }

  useEffect(function(): () => void {
    rtmpInit();

    return function(): void {
      childRef.current && childRef.current.kill();
      flvPlayerRef.current && flvPlayerRef.current.destroy();
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

export default LiveVideo;