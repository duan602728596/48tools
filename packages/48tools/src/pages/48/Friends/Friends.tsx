import {
  Fragment,
  useState,
  useMemo,
  useCallback,
  type ReactElement,
  type MouseEvent,
  type Dispatch as D,
  type SetStateAction as S
} from 'react';
import { useLocation, type Location } from 'react-router-dom';
import { Button, Spin, Empty, Divider } from 'antd';
import * as classNames from 'classnames';
import commonStyle from '../../../common.sass';
import Header from '../../../components/Header/Header';
import { useReqRoomIdQuery, type ReqRoomId } from '../reducers/pocketFriends.api';
import Group from './Group';
import type { RoomItem } from '../services/interface';

/* 格式化数据 */
const order: Array<string> = [
  'TEAM SII',
  'TEAM NII',
  'TEAM HII',
  'TEAM X',
  'BEJ48',
  'TEAM G',
  'TEAM NIII',
  'TEAM Z',
  'CKG48',
  'TEAM CII',
  'TEAM GII',
  '预备生',
  'IDFT',
  '荣誉毕业生',
  '',
  '丝芭影视'
];

interface RoomIdFormatItem {
  title: string;
  data: Array<RoomItem>;
}

function groupToMap(array: Array<RoomItem> = []): Array<RoomIdFormatItem> {
  const obj: Record<string, Array<RoomItem>> = {};
  const result: Array<RoomIdFormatItem> = [];

  for (const item of array) {
    const title: string = item.team ?? '';

    obj[title] ??= [];
    obj[title].push(item);
  }

  for (const key in obj) {
    result.push({
      title: key,
      data: obj[key]
    });
  }

  return result.sort((a: RoomIdFormatItem, b: RoomIdFormatItem): number => {
    const aIndex: number = order.indexOf(a.title);
    const bIndex: number = order.indexOf(b.title);

    return (aIndex < 0 ? 9999 : aIndex) - (bIndex < 0 ? 9999 : bIndex);
  });
}

/* 关注friends */
function Friends(props: {}): ReactElement {
  const location: Location = useLocation();
  const fromPathname: string = location?.state?.from ?? '/';
  const [addLoading, setAddLoading]: [boolean, D<S<boolean>>] = useState(false);
  const reqRoomId: ReqRoomId = useReqRoomIdQuery(undefined);
  const roomId: Array<RoomIdFormatItem> = groupToMap(reqRoomId.data ?? []);

  const loading: boolean = useMemo(function(): boolean {
    return reqRoomId.isLoading || reqRoomId.isFetching;
  }, [reqRoomId.isLoading, reqRoomId.isFetching]);

  // 渲染组
  const groupRender: () => Array<ReactElement> = useCallback(function(): Array<ReactElement> {
    return roomId.map((item: { title: string; data: Array<RoomItem> }, index: number): ReactElement | ReactElement[] => {
      if (index === 0) {
        return [
          <Divider key="0" />,
          <Group key={ item.title }
            title={ item.title }
            data={ item.data }
            addLoading={ addLoading }
            setAddLoading={ setAddLoading }
          />
        ];
      } else {
        return (
          <Group key={ item.title }
            title={ item.title }
            data={ item.data }
            addLoading={ addLoading }
            setAddLoading={ setAddLoading }
          />
        );
      }
    }).flat();
  }, [roomId, addLoading, setAddLoading]);

  return (
    <Fragment>
      <Header to={ fromPathname }>
        <Button onClick={ (event: MouseEvent): unknown => reqRoomId.refetch() }>刷新</Button>
      </Header>
      {
        loading && (
          <div className="text-center">
            <Spin />
            <span className={ classNames('ml-[14px] align-[2px]', commonStyle.text) }>加载中...</span>
          </div>
        )
      }
      { !loading && (reqRoomId.data?.length ? groupRender() : <Empty />) }
    </Fragment>
  );
}

export default Friends;