import * as querystring from 'querystring';
import type { ParsedUrlQuery } from 'querystring';
import { useState, useMemo, ReactElement, Dispatch as D, SetStateAction as S } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale-provider/zh_CN';
import { requestLiveRoomInfo } from '../services/services';
import type { LiveRoomInfo } from '../types';

interface Search {
  coverPath: string;
  title: string;
  liveId: string;
  id: string;
}

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

  return (
    <ConfigProvider locale={ zhCN }>
      <div>

      </div>
    </ConfigProvider>
  );
}

export default PlayerApp;