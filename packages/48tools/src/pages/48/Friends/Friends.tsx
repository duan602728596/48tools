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

type RoomIdFormat = Array<{ title: string; data: Array<RoomItem> }>;

function groupToMap(array: Array<RoomItem> = []): RoomIdFormat {
  const obj: Record<string, Array<RoomItem>> = {};
  const result: RoomIdFormat = [];

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

  return result;
}

/* 关注friends */
function Friends(props: {}): ReactElement {
  const location: Location = useLocation();
  const fromPathname: string = location?.state?.from ?? '/';
  const [addLoading, setAddLoading]: [boolean, D<S<boolean>>] = useState(false);
  const reqRoomId: ReqRoomId = useReqRoomIdQuery(undefined);
  const roomId: RoomIdFormat = useMemo(function(): RoomIdFormat {
    return groupToMap(reqRoomId.data);
  }, [reqRoomId.data]);
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