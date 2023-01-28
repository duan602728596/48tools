import { randomUUID } from 'node:crypto';
import {
  Fragment,
  useState,
  useEffect,
  useRef,
  forwardRef,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type MutableRefObject,
  type RefObject,
  type FunctionComponent,
  type ForwardedRef
} from 'react';
import { Avatar, Switch } from 'antd';
import VirtualList from 'rc-virtual-list';
import NimChatroomSocket from './NimChatroomSocket';
import { source } from '../../../utils/snh48';
import type { LiveRoomInfo } from '../../48/services/interface';
import type { LiveRoomMessage, LiveRoomTextMessage, LiveRoomTextCustom } from './messageType';

interface DanmuItemProps {
  item: LiveRoomTextMessage;
}

/* 显示单条弹幕 */
const DanmuItem: FunctionComponent<DanmuItemProps> = forwardRef(
  function(props: DanmuItemProps, ref: ForwardedRef<any>): ReactElement | null {
    const { item }: DanmuItemProps = props;
    const [height, setHeight]: [number, D<S<number>>] = useState(26);
    const divRef: RefObject<HTMLDivElement> = useRef(null);

    useEffect(function(): void {
      if (divRef.current) {
        const newHeight: number = divRef.current!.getBoundingClientRect().height + 2;

        if (newHeight > 26) {
          setHeight((prevState: number): number => newHeight);
        }
      }
    }, []);

    try {
      const custom: LiveRoomTextCustom = JSON.parse(item.custom);

      return (
        <div ref={ ref } className="py-[1px] pl-[3px] pr-[20px]" style={{ height }}>
          <div ref={ divRef }>
            <Avatar size="small" src={ source(custom.user.avatar) } />
            <span className="ml-[3px]">{ custom.user.nickName }：</span>
            { item.text }
          </div>
        </div>
      );
    } catch (err) {
      console.error(err, props);

      return null;
    }
  });

interface DanmuProps {
  info: LiveRoomInfo | undefined;
}

/* 显示弹幕 */
function Danmu(props: DanmuProps): ReactElement {
  const { info }: DanmuProps = props;
  const [danmuData, setDanmuData]: [Array<LiveRoomTextMessage>, D<S<Array<LiveRoomTextMessage>>>] = useState([]);
  const [danmuListHeight, setDanmuListHeight]: [number, D<S<number>>] = useState(0);
  const nimRef: MutableRefObject<NimChatroomSocket | null> = useRef(null);
  const resizeObserverRef: MutableRefObject<ResizeObserver | null> = useRef(null);
  const danmuListRef: RefObject<HTMLDivElement> = useRef(null);

  // 获取到新信息
  function handleNewMessage(t: NimChatroomSocket, event: Array<LiveRoomMessage>): void {
    const filterMessage: Array<LiveRoomTextMessage> = [];

    for (const item of event) {
      if (item.type === 'text') {
        item.vid = randomUUID();
        filterMessage.unshift(item);
      }
    }

    setDanmuData((prevState: LiveRoomTextMessage[]): LiveRoomTextMessage[] => filterMessage.concat(prevState));
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

  function handleResizeObserverCallback(entries: ResizeObserverEntry[], observer: ResizeObserver): void {
    setDanmuListHeight((prevState: number): number => entries[0].contentRect.height);
  }

  useEffect(function(): () => void {
    resizeObserverRef.current = new ResizeObserver(handleResizeObserverCallback);
    danmuListRef.current && resizeObserverRef.current.observe(danmuListRef.current);
    danmuOpen();

    return function(): void {
      danmuClose();
      resizeObserverRef.current?.disconnect?.();
      resizeObserverRef.current = null;
    };
  }, [info]);

  return (
    <Fragment>
      <div className="shrink-0 mb-[6px]">
        <Switch size="small"
          defaultChecked={ true }
          checkedChildren="弹幕开启"
          unCheckedChildren="弹幕关闭"
          onChange={ handleSwitchChange }
        />
        <i className="block mt-[4px]">弹幕最上面是最新的消息，鼠标滚轮向下滚动可以查看其他消息。</i>
      </div>
      <div ref={ danmuListRef } className="grow relative z-50 overflow-hidden">
        <VirtualList data={ danmuData } height={ danmuListHeight } itemHeight={ 26 } itemKey="vid">
          { (item: LiveRoomTextMessage): ReactElement => <DanmuItem key={ item.vid } item={ item } /> }
        </VirtualList>
      </div>
    </Fragment>
  );
}

export default Danmu;