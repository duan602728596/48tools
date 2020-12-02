import * as querystring from 'querystring';
import type { ParsedUrlQuery } from 'querystring';
import { useState, useEffect, useMemo, ReactElement, ReactNodeArray, Dispatch as D, SetStateAction as S } from 'react';
import { ConfigProvider, Avatar } from 'antd';
import zhCN from 'antd/es/locale-provider/zh_CN';
import style from './playerApp.sass';
import { requestLiveRoomInfo } from '../services/services';
import type { LiveRoomInfo } from '../types';

interface Search {
  coverPath: string;
  title: string;
  liveId: string;
  id: string;
}

const SOURCE_HOST: string = 'https://source3.48.cn/'; // 静态文件地址

/* PlayerApp */
function PlayerApp(props: {}): ReactElement {
  const search: Search = useMemo(function(): Search {
    const s: ParsedUrlQuery = querystring.parse(window.location.search.replace(/^\?/, ''));

    return {
      coverPath: s.coverPath as string,
      title: s.title as string,
      liveId: s.liveId as string,
      id: s.id as string
    };
  }, []);
  const [info, setInfo]: [LiveRoomInfo | undefined, D<S<LiveRoomInfo | undefined>>] = useState(undefined); // 直播信息

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

  return (
    <ConfigProvider locale={ zhCN }>
      <div className={ style.content }>
        <header className={ style.header }>
          <h1 className={ style.title }>{ search.title }</h1>
          { infoRender() }
        </header>
      </div>
    </ConfigProvider>
  );
}

export default PlayerApp;