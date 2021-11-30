import * as querystring from 'node:querystring';
import type { ParsedUrlQuery } from 'node:querystring';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { ipcRenderer } from 'electron';
import {
  useState,
  useEffect,
  useMemo,
  useRef,
  type ReactElement,
  type ReactNode,
  type Dispatch as D,
  type SetStateAction as S,
  type RefObject,
  type MutableRefObject,
  type MouseEvent
} from 'react';
import { ConfigProvider, Avatar, Tag, Button } from 'antd';
import zhCN from 'antd/es/locale-provider/zh_CN';
import { ToolTwoTone as IconToolTwoTone } from '@ant-design/icons';
import flvjs from 'flv.js';
import style from './playerApp.sass';
import ThemeProvider from '../../../../components/Theme/ThemeProvider';
import { requestLiveRoomInfo } from '../../services/pocket48';
import { getFFmpeg, source } from '../../../../utils/utils';
import type { LiveRoomInfo } from '../../services/interface';

interface Search {
  coverPath: string;
  title: string;
  liveId: string;
  id: string;
  liveType: number;
  rtmpPort: number;
  httpPort: number;
}

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
  const childRef: MutableRefObject<ChildProcessWithoutNullStreams | undefined> = useRef();
  const videoRef: RefObject<HTMLVideoElement> = useRef(null);

  // 打开开发者工具
  function handleOpenDeveloperToolsClick(event: MouseEvent): void {
    ipcRenderer.send('player-developer-tools', search.id);
  }

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

    childRef.current = child;
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
  function infoRender(): Array<ReactNode> | null {
    if (info) {
      const { content }: LiveRoomInfo = info;

      return [
        <Avatar key="avatar" src={ source(content.user.userAvatar) } />,
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
      childRef.current && childRef.current.kill();
    };
  }, [info, search]);

  return (
    <ThemeProvider isChildrenWindow={ true }>
      <ConfigProvider locale={ zhCN }>
        <div className={ style.content }>
          <header className={ style.header }>
            <h1 className={ style.title }>{ search.title }</h1>
            { search.liveType === 2 ? <Tag color="volcano">电台</Tag> : <Tag color="purple">视频</Tag> }
            <div className={ style.flex }>
              <div className={ style.userBox }>{ infoRender() }</div>
              <div className={ style.tools }>
                <Button type="text" icon={ <IconToolTwoTone /> } onClick={ handleOpenDeveloperToolsClick } />
              </div>
            </div>
          </header>
          <div>
            <video ref={ videoRef }
              className={ style.video }
              controls={ true }
              poster={ source(search.coverPath) }
            />
          </div>
        </div>
      </ConfigProvider>
    </ThemeProvider>
  );
}

export default PlayerApp;