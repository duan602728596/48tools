import * as querystring from 'querystring';
import type { ParsedUrlQuery } from 'querystring';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import {
  useState,
  useEffect,
  useMemo,
  useRef,
  ReactElement,
  ReactNodeArray,
  Dispatch as D,
  SetStateAction as S,
  RefObject
} from 'react';
import { ConfigProvider, Avatar, Tag } from 'antd';
import zhCN from 'antd/es/locale-provider/zh_CN';
import flvjs from 'flv.js';
import style from './playerApp.sass';
import { requestLiveRoomInfo } from '../services/services';
import type { LiveRoomInfo } from '../types';
import { getFFmpeg } from '../../../utils/utils';

interface Search {
  coverPath: string;
  title: string;
  liveId: string;
  id: string;
  liveType: number;
  rtmpPort: number;
  httpPort: number;
}

const SOURCE_HOST: string = 'https://source3.48.cn/'; // 静态文件地址

function handleChildProcessStdoutOrStderr(data: Buffer): void {
  // console.log(data.toString());
}

function handleChildProcessClose(): void {
  // nothing
}

function handleChildProcessError(err: Error): void {
  console.error(err);
}

/* PlayerApp */
function PlayerApp(props: {}): ReactElement {
  const search: Search = useMemo(function(): Search {
    const s: ParsedUrlQuery = querystring.parse(window.location.search.replace(/^\?/, ''));

    return {
      coverPath: s.coverPath as string,
      title: s.title as string,
      liveId: s.liveId as string,
      id: s.id as string,
      liveType: Number(s.liveType),
      rtmpPort: Number(s.rtmpPort),
      httpPort: Number(s.httpPort)
    };
  }, []);
  const [info, setInfo]: [LiveRoomInfo | undefined, D<S<LiveRoomInfo | undefined>>] = useState(undefined); // 直播信息
  const childRef: RefObject<ChildProcessWithoutNullStreams> = useRef(null);
  const videoRef: RefObject<HTMLVideoElement> = useRef(null);

  // 加载视频
  function loadVideo(): void {
    if (videoRef.current && info) {
      const flvPlayer: flvjs.Player = flvjs.createPlayer({
        type: 'flv',
        isLive: true,
        url: `http://localhost:${ search.httpPort }/live/${ search.id }.flv`
      });

      flvPlayer.attachMediaElement(videoRef.current);
      flvPlayer.load();
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

    // @ts-ignore
    childRef['current'] = child;
    loadVideo();
  }

  // 请求直播间信息
  async function getLiveRoomInfo(): Promise<void> {
    try {
      const res: LiveRoomInfo = await requestLiveRoomInfo(search.liveId);

      setInfo(res);
    } catch (err) {
      console.error(err);
    }
  }

  // 渲染小偶像信息
  function infoRender(): ReactNodeArray | null {
    if (info) {
      const { content }: LiveRoomInfo = info;

      return [
        <Avatar key="avatar" src={ `${ SOURCE_HOST }${ content.user.userAvatar }` } />,
        <span key="username" className={ style.user }>{ content.user.userName }</span>
      ];
    } else {
      return null;
    }
  }

  useEffect(function(): void {
    getLiveRoomInfo();
  }, []);

  useEffect(function(): () => void {
    rtmpInit();

    return function(): void {
      if (childRef.current) {
        childRef.current.kill();
      }
    };
  }, [info, search]);

  return (
    <ConfigProvider locale={ zhCN }>
      <div className={ style.content }>
        <header className={ style.header }>
          <h1 className={ style.title }>{ search.title }</h1>
          { search.liveType === 2 ? <Tag color="volcano">电台</Tag> : <Tag color="purple">视频</Tag> }
          <div>{ infoRender() }</div>
        </header>
        <div>
          <video ref={ videoRef }
            className={ style.video }
            controls={ true }
            poster={ `${ SOURCE_HOST }${ search.coverPath }` }
          />
        </div>
      </div>
    </ConfigProvider>
  );
}

export default PlayerApp;