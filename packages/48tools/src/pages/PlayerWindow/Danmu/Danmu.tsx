import { randomUUID } from 'node:crypto';
import {
  Fragment,
  useState,
  useEffect,
  useMemo,
  useRef,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type MutableRefObject
} from 'react';
import { Avatar, Switch } from 'antd';
import NimChatroomSocket from './NimChatroomSocket';
import { source } from '../../../utils/utils';
import type { LiveRoomInfo } from '../../48/services/interface';
import type { LiveRoomMessage, LiveRoomCustom } from './messageType';

interface DanmuItemProps {
  item: LiveRoomMessage;
}

/* 显示单条弹幕 */
function DanmuItem(props: DanmuItemProps): ReactElement {
  const { item }: DanmuItemProps = props;
  const custom: LiveRoomCustom = JSON.parse(item.custom);

  return (
    <div className="py-[1px]">
      <Avatar size="small" src={ source(custom.user.avatar) } />
      <span className="ml-[3px]">{ custom.user.nickName }：</span>
      { item.text }
    </div>
  );
}

interface DanmuProps {
  info: LiveRoomInfo | undefined;
}

/* 显示弹幕 */
function Danmu(props: DanmuProps): ReactElement {
  const { info }: DanmuProps = props;
  const [danmuData, setDanmuData]: [Array<LiveRoomMessage>, D<S<Array<LiveRoomMessage>>>] = useState([]);
  const nimRef: MutableRefObject<NimChatroomSocket | null> = useRef(null);

  const danMuList: Array<ReactElement> = useMemo(function(): Array<ReactElement> {
    return danmuData.map((o: LiveRoomMessage): ReactElement => <DanmuItem key={ o.vid } item={ o } />);
  }, [danmuData]);

  // 获取到新信息
  function handleNewMessage(t: NimChatroomSocket, event: Array<LiveRoomMessage>): void {
    const filterMessage: Array<LiveRoomMessage> = [];

    for (const item of event) {
      if (item.type === 'text') {
        item.vid = randomUUID();
        filterMessage.unshift(item);
      }
    }

    setDanmuData((prevState: Array<LiveRoomMessage>) => filterMessage.concat(prevState));
  }

  // 开启弹幕功能
  function danmuOpen(): void {
    if (!nimRef.current && info) {
      nimRef.current = new NimChatroomSocket({
        roomId: info.content.roomId,
        onMessage: handleNewMessage
      });
      nimRef.current.init();
    }
  }

  // 关闭弹幕功能
  function danmuClose(): void {
    if (nimRef.current) {
      nimRef.current.disconnect();
      nimRef.current = null;
    }
  }

  // 开启或者关闭弹幕
  function handleSwitchChange(checked: boolean): void {
    if (checked) {
      danmuOpen();
    } else {
      danmuClose();
    }
  }

  useEffect(function(): () => void {
    danmuOpen();

    return function(): void {
      danmuClose();
    };

  }, [info]);

  return (
    <Fragment>
      <div className="mb-[6px]">
        <Switch className="mr-[8px]"
          size="small"
          defaultChecked={ true }
          checkedChildren="弹幕开启"
          unCheckedChildren="弹幕关闭"
          onChange={ handleSwitchChange }
        />
        <i>弹幕最上面是最新的消息。</i>
      </div>
      <div className="h-[500px] relative z-50 overflow-auto">
        { danMuList }
      </div>
    </Fragment>
  );
}

export default Danmu;