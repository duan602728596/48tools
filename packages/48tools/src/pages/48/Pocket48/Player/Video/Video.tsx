import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { useEffect, useRef, type ReactElement, type RefObject, type MutableRefObject } from 'react';
import flvjs from 'flv.js';
import { getFFmpeg, source } from '../../../../../utils/utils';
import type { Search } from '../LiveVideo';
import type { LiveRoomInfo } from '../../../services/interface';

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
  search: Search;
  info: LiveRoomInfo | undefined;
}

/* 视频的播放 */
function Video(props: VideoProps): ReactElement {
  const { search, info }: VideoProps = props;
  const childRef: MutableRefObject<ChildProcessWithoutNullStreams | undefined> = useRef();
  const flvPlayerRef: MutableRefObject<flvjs.Player | undefined> = useRef();
  const videoRef: RefObject<HTMLVideoElement> = useRef(null);

  // 加载视频
  function loadVideo(): void {
    if (videoRef.current && info) {
      flvPlayerRef.current = flvjs.createPlayer({
        type: 'flv',
        isLive: true,
        url: `http://localhost:${ search.httpPort }/live/${ search.id }.flv`
      });

      flvPlayerRef.current.attachMediaElement(videoRef.current);
      flvPlayerRef.current.load();
    }
  }

  // 流推送
  function rtmpInit(): void {
    if (!info) return;

    const args: Array<string> = [
      '-re',
      '-i',
      info.content.playStreamPath,
      '-c:v',
      'libx264',
      '-preset',
      'superfast',
      '-tune',
      'zerolatency',
      '-c:a',
      'aac',
      '-ar',
      '44100',
      '-f',
      'flv',
      `rtmp://localhost:${ search.rtmpPort }/live/${ search.id }`
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
  }, [info, search]);

  return (
    <div>
      <video ref={ videoRef }
        className="block w-full min-h-[500px] outline-0"
        controls={ true }
        poster={ source(search.coverPath) }
      />
    </div>
  );
}

export default Video;