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
import { useLocation, type Location } from 'react-router';
import { Button, Spin, Empty, Divider } from 'antd';
import classNames from 'classnames';
import type { RoomItem } from '@48tools-api/48/jsdelivrCDN';
import commonStyle from '../../../common.sass';
import Header from '../../../components/Header/Header';
import { useReqRoomIdQuery, type ReqRoomId } from '../reducers/pocketFriends.api';
import Group from './Group';

/* 格式化数据 */
const order: Array<string> = [
  'TEAM SII',
  'TEAM NII',
  'TEAM HII',
  'TEAM X',
  'TEAM B',
  'TEAM E',
  'TEAM J',
  'BEJ48',
  'TEAM G',
  'TEAM NIII',
  'TEAM Z',
  'TEAM C',
  'TEAM K',
  'CKG48',
  'TEAM CII',
  'TEAM GII',
  '预备生',
  'IDFT',
  '荣誉毕业生',
  '',
  '燃烧吧团魂',
  '丝芭影视'
];

interface RoomIdFormatItem {
  title: string;
  data: Array<RoomItem>;
}

function groupToMap(array: Array<RoomItem> = []): Array<RoomIdFormatItem> {
  const obj: Record<string, Array<RoomItem> | undefined> = Object.groupBy(array, (item: RoomItem): string => item.team ?? '');
  const result: Array<RoomIdFormatItem> = [];

  for (const key in obj) {
    const v: Array<RoomItem> | undefined = obj[key];

    v?.length && result.push({
      title: key,
      data: v
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
  const [disableClick, setDisableClick]: [boolean, D<S<boolean>>] = useState(false); // 禁止所有的点击事件
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
            disableClick={ disableClick }
            setDisableClick={ setDisableClick }
          />
        ];
      } else {
        return (
          <Group key={ item.title }
            title={ item.title }
            data={ item.data }
            disableClick={ disableClick }
            setDisableClick={ setDisableClick }
          />
        );
      }
    }).flat();
  }, [roomId, disableClick, setDisableClick]);

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