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
import { GiftTwoTone as IconGiftTwoTone } from '@ant-design/icons';
import VirtualList, { type ListRef } from 'rc-virtual-list';
import * as classNames from 'classnames';
import type { LiveRoomInfo } from '@48tools-api/48';
import commonStyle from '../../../common.sass';
import NimChatroomSocket from '../sdk/NimChatroomSocket';
import { source } from '../../../utils/snh48';
import type {
  LiveRoomMessage,
  LiveRoomTextMessage,
  LiveRoomGiftInfoCustom,
  LiveRoomTextCustom
} from './messageType';

const VirtualItemClassName: string = 'Virtual-Item-2';

/**
 * 判断是否要显示文字
 * @param { LiveRoomMessage } item - 消息
 * @param { LiveRoomTextCustom | LiveRoomGiftInfoCustom } custom - 自定义消息
 */
function isLiveRoomTextCustom(item: LiveRoomMessage, custom: LiveRoomTextCustom | LiveRoomGiftInfoCustom): custom is LiveRoomTextCustom {
  return item.type === 'text' || custom.messageType === 'BARRAGE_MEMBER' || custom.messageType === 'BARRAGE_NORMAL';
}

/* 显示单条弹幕 */
interface DanmuItemProps {
  item: LiveRoomMessage;
  index: number;
}

const DanmuItem: FunctionComponent<DanmuItemProps> = forwardRef(
  function(props: DanmuItemProps, ref: ForwardedRef<any>): ReactElement | null {
    const { item, index }: DanmuItemProps = props;
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
      const custom: LiveRoomTextCustom | LiveRoomGiftInfoCustom = JSON.parse(item.custom);
      const isBarrage: boolean = custom.messageType === 'BARRAGE_NORMAL' || custom.messageType === 'BARRAGE_MEMBER';
      const isMember: boolean = custom.messageType === 'BARRAGE_MEMBER';

      if (isLiveRoomTextCustom(item, custom)) {
        return (
          <div ref={ ref }
            className={ classNames('py-[1px] pl-[3px] pr-[20px]', VirtualItemClassName, isMember ? commonStyle.primaryText : undefined) }
            style={{ height }}
            data-index={ index }
          >
            <div ref={ divRef }>
              <Avatar size="small" src={ source(custom.user.avatar) } />
              <span className="ml-[3px]">{ custom.user.nickName }：</span>
              { (isMember || isBarrage) ? custom.text : (item as LiveRoomTextMessage).text }
            </div>
          </div>
        );
      } else {
        const tpNum: number = Number(custom.giftInfo.tpNum);

        return (
          <div ref={ ref }
            className={ classNames('py-[1px] pl-[3px] pr-[20px]', VirtualItemClassName) }
            style={{ height }}
            data-index={ index }
          >
            <div ref={ divRef }>
              <IconGiftTwoTone className="mr-[3px] text-[22px] align-[-5px]" />
              { custom.user.nickName }
              &nbsp;送给&nbsp;
              { custom.giftInfo.acceptUser.userName }&nbsp;
              { custom.giftInfo.giftNum }个
              { custom.giftInfo.giftName }{ tpNum > 0 ? `(${ tpNum })` : null }。
            </div>
          </div>
        );
      }
    } catch (err) {
      console.error(err, props);

      return null;
    }
  });

/* 显示弹幕 */
interface DanmuProps {
  info: LiveRoomInfo | undefined;
}

function Danmu(props: DanmuProps): ReactElement {
  const { info }: DanmuProps = props;
  const [danmuData, setDanmuData]: [Array<LiveRoomMessage>, D<S<Array<LiveRoomMessage>>>] = useState([]);
  const [danmuListHeight, setDanmuListHeight]: [number, D<S<number>>] = useState(0);
  const nimRef: MutableRefObject<NimChatroomSocket | null> = useRef(null);
  const resizeObserverRef: MutableRefObject<ResizeObserver | null> = useRef(null);
  const danmuListRef: RefObject<HTMLDivElement> = useRef(null);
  const virtualListRef: RefObject<ListRef> = useRef(null);

  // 获取到新信息
  function handleNewMessage(t: NimChatroomSocket, event: Array<LiveRoomMessage>): void {
    const filterMessage: Array<LiveRoomMessage> = [];

    for (const item of event) {
      if (item.type === 'text') {
        item.vid = randomUUID();
        filterMessage.unshift(item);
      } else if (item.type === 'custom') {
        const custom: LiveRoomTextCustom | LiveRoomGiftInfoCustom = JSON.parse(item.custom);

        if (custom.messageType === 'BARRAGE_MEMBER' || custom.messageType === 'BARRAGE_NORMAL' || 'giftInfo' in custom) {
          item.vid = randomUUID();
          filterMessage.unshift(item);
        }
      }
    }

    setDanmuData((prevState: LiveRoomMessage[]): LiveRoomMessage[] => filterMessage.concat(prevState));
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

  // 上下滚动
  function handleScrollKeydown(event: KeyboardEvent): void {
    if (danmuListRef.current && virtualListRef.current && (event.code === 'ArrowUp' || event.code === 'ArrowDown')) {
      const antListItem: HTMLElement | null = danmuListRef.current.querySelector(`.${ VirtualItemClassName }`);

      if (antListItem) {
        const indexStr: string | null = antListItem.getAttribute('data-index');

        if (indexStr) {
          const index: number = Number(indexStr);

          virtualListRef.current.scrollTo({
            index: event.code === 'ArrowUp' ? (index - 3) : (index + 3),
            align: 'top'
          });
        }
      }
    }
  }

  useEffect(function(): () => void {
    document.addEventListener('keydown', handleScrollKeydown);
    resizeObserverRef.current = new ResizeObserver(handleResizeObserverCallback);
    danmuListRef.current && resizeObserverRef.current.observe(danmuListRef.current);
    danmuOpen();

    return function(): void {
      document.removeEventListener('keydown', handleScrollKeydown);
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
      <div ref={ danmuListRef } className={ classNames('grow relative z-50 overflow-hidden', commonStyle.virtualList) }>
        <VirtualList ref={ virtualListRef } data={ danmuData } height={ danmuListHeight } itemHeight={ 26 } itemKey="vid">
          {
            (item: LiveRoomTextMessage, index: number): ReactElement =>
              <DanmuItem key={ item.vid } item={ item } index={ index } />
          }
        </VirtualList>
      </div>
    </Fragment>
  );
}

export default Danmu;