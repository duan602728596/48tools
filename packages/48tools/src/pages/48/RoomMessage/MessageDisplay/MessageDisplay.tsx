import { setTimeout, clearTimeout } from 'node:timers';
import { shell } from 'electron';
import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type MutableRefObject,
  type RefObject,
  type ForwardedRef,
  type FunctionComponent,
  type MouseEvent,
  type FocusEvent
} from 'react';
import * as PropTypes from 'prop-types';
import { List, Popover, Typography, Empty, Spin, type TypographyProps } from 'antd';
import VirtualList, { type ListRef } from 'rc-virtual-list';
import * as classNames from 'classnames';
import style from './messageDisplay.sass';
import commonStyle from '../../../../common.sass';
import { omit } from '../../../../utils/lodash';
import { mp4Source } from '../../../../utils/snh48';
import { accessibilityClassName } from '../../../../components/basic/Accessibility/Accessibility';
import type { FormatCustomMessage, FlipCardInfo, FlipCardAudioInfo, FlipCardVideoInfo, ReplyInfo } from '../../types';

const { Paragraph }: TypographyProps = Typography;

export const typeCNName: Record<string, string> = {
  video: '视频',
  audio: '音频',
  image: '图片',
  LIVEPUSH: '直播',
  FLIPCARD_AUDIO: '语音翻牌',
  FLIPCARD_VIDEO: '视频翻牌'
};
const timerMap: Map<string, NodeJS.Timeout> = new Map(); // 记录定时器，在没有焦点时需要清除定时器
const VirtualItemClassName: string = 'Virtual-Item-1';

// 打开网站
function handleOpenFileClick(event: MouseEvent<HTMLAnchorElement>): void {
  shell.openExternal(event.target['getAttribute']('data-href'));
}

// 链接的无障碍
function handleLinkFocus(event: FocusEvent<HTMLAnchorElement>): void {
  const id: string = event.target['getAttribute']('data-client-id')!;

  if (timerMap.has(id)) {
    clearTimeout(timerMap.get(id));
  }

  if (document.body.classList.contains(accessibilityClassName)) {
    const timer: NodeJS.Timeout = setTimeout((): void => {
      event.target.dispatchEvent(new Event('mouseover', { bubbles: true }));
    }, 1_000);

    timerMap.set(id, timer);
  }
}

function handleLinkBlur(event: FocusEvent<HTMLAnchorElement>): void {
  const id: string = event.target['getAttribute']('data-client-id')!;

  if (timerMap.has(id)) {
    clearTimeout(timerMap.get(id));
  }

  if (document.body.classList.contains(accessibilityClassName)) {
    event.target.dispatchEvent(new Event('mouseout', { bubbles: true }));
  }
}

/* 显示单个消息 */
interface MessageItemProps {
  item: FormatCustomMessage;
  index: number;
}

const MessageItem: FunctionComponent<MessageItemProps> = forwardRef(
  function(props: MessageItemProps, ref: ForwardedRef<any>): ReactElement {
    const { item, index }: MessageItemProps = props;
    const [height, setHeight]: [number, D<S<number>>] = useState(26); // 高度
    const divRef: RefObject<HTMLDivElement> = useRef(null);

    // 根据不同类型渲染消息
    function messageRender(): Array<ReactElement> {
      const renderElement: Array<ReactElement> = [
        <div key="user" className="shrink-0">{ item.user.nickName }：</div>,
        <time key="time" className="shrink-0 block pl-[12px]">{ item.time }</time>
      ];

      try {
        if (item.type === 'text') {
          // 普通消息
          renderElement.splice(1, 0,
            <Paragraph key="body" className="grow whitespace-pre-wrap break-all">{ item.body }</Paragraph>);
        } else if (item.type === 'custom' && (item.attach.messageType === 'REPLY' || item.attach.messageType === 'GIFTREPLY')) {
          // 回复消息
          const replyInfo: ReplyInfo = item.attach.replyInfo ?? item.attach.giftReplyInfo;

          renderElement.splice(1, 0,
            <Paragraph key="body" className="grow whitespace-pre-wrap break-all">
              { replyInfo.text }
              <blockquote className="whitespace-pre-wrap">
                { replyInfo.replyName }：{ replyInfo.replyText }
              </blockquote>
            </Paragraph>);
        } else if (item.type === 'image') {
          // 图片
          renderElement.splice(1, 0,
            <Paragraph key="body" className="grow break-all">
              { typeCNName[item.type] }&nbsp;-&nbsp;
              <Popover content={ <img className="max-w-[400px] max-h-[400px]" src={ item.attach.url } /> }>
                <a role="button"
                  aria-label="浏览器内打开图片"
                  tabIndex={ 0 }
                  data-href={ item.attach.url }
                  data-client-id={ item.msgIdClient }
                  onClick={ handleOpenFileClick }
                  onFocus={ handleLinkFocus }
                  onBlur={ handleLinkBlur }
                >
                  { item.attach.url }
                </a>
              </Popover>
            </Paragraph>);
        } else if (item.type === 'video' || item.type === 'audio') {
          // 视频和音频
          renderElement.splice(1, 0,
            <Paragraph key="body" className="grow break-all">
              { typeCNName[item.type] }&nbsp;-&nbsp;
              <Popover content={ <video className="max-w-[400px] max-h-[400px]" src={ item.attach.url } controls={ true } /> }>
                <a role="button"
                  aria-label="浏览器内打开媒体文件"
                  tabIndex={ 0 }
                  data-href={ item.attach.url }
                  data-client-id={ item.msgIdClient }
                  onClick={ handleOpenFileClick }
                  onFocus={ handleLinkFocus }
                  onBlur={ handleLinkBlur }
                >
                  { item.attach.url }
                </a>
              </Popover>
            </Paragraph>);
        } else if (item.type === 'custom' && item.attach.messageType === 'LIVEPUSH') {
          // 直播
          renderElement.splice(1, 0,
            <Paragraph key="body" className="grow break-all">
              { typeCNName[item.attach.messageType] }&nbsp;-&nbsp;
              { item.attach.livePushInfo.liveTitle }
            </Paragraph>);
        } else if (item.type === 'custom' && item.attach.messageType === 'FLIPCARD') {
          // 鸡腿翻牌
          const info: FlipCardInfo = item.attach.filpCardInfo ?? item.attach.flipCardInfo;

          renderElement.splice(1, 0,
            <Paragraph key="body" className="grow break-all">
              <div>翻牌问题：{ info.question }</div>
              <div>回答：{ info.answer }</div>
            </Paragraph>);
        } else if (
          item.type === 'custom'
          && (item.attach.messageType === 'FLIPCARD_AUDIO'
            || item.attach.messageType === 'FLIPCARD_VIDEO')
        ) {
          // 语音翻牌
          const info: FlipCardAudioInfo | FlipCardVideoInfo = (item.attach.filpCardInfo ?? item.attach.flipCardInfo)
            ?? (item.attach.messageType === 'FLIPCARD_AUDIO'
              ? (item.attach.filpCardAudioInfo ?? item.attach.flipCardAudioInfo)
              : (item.attach.filpCardVideoInfo ?? item.attach.flipCardVideoInfo));
          const answer: { url: string } = JSON.parse(info.answer);
          const answerUrl: string = mp4Source(answer.url);

          renderElement.splice(1, 0,
            <Paragraph key="body" className="grow break-all">
              <div>翻牌问题：{ info.question }</div>
              <div>
                回答：
                <Popover content={ <video className="max-w-[200px] max-h-[200px]" src={ answerUrl } controls={ true } /> }>
                  <a role="button"
                    aria-label="浏览器内打开媒体文件"
                    tabIndex={ 0 }
                    data-href={ answerUrl }
                    data-client-id={ item.msgIdClient }
                    onClick={ handleOpenFileClick }
                    onFocus={ handleLinkFocus }
                    onBlur={ handleLinkBlur }
                  >
                    { answerUrl }
                  </a>
                </Popover>
              </div>
            </Paragraph>);
        } else if (item.type === 'custom' && item.attach.messageType === 'EXPRESSIMAGE') {
          renderElement.splice(1, 0,
            <div key="body" className="grow">
              <img src={ item.attach.expressImgInfo.emotionRemote } height={ 40 } />
            </div>);
        } else {
          renderElement.splice(1, 0,
            <code key="body" className="grow block">
              { JSON.stringify(omit(item, ['msgIdClient'])) }
            </code>);
        }
      } catch (err) {
        console.error(err, item);
        renderElement.splice(1, 0,
          <code key="body" className="grow block">
            { JSON.stringify(omit(item, ['msgIdClient'])) }
          </code>);
      }

      return renderElement;
    }

    useEffect(function(): void {
      if (divRef.current) {
        const newHeight: number = divRef.current!.getBoundingClientRect().height + 6;

        setHeight((prevState: number): number => newHeight);
      }
    }, []);

    return (
      <List.Item ref={ ref }
        className={ classNames('mr-[30px] text-[12px]', VirtualItemClassName, style.item) }
        style={{ height }}
        data-index={ index }
      >
        <div ref={ divRef } className={ classNames('flex w-full min-h-[20px]', commonStyle.text) }>
          { messageRender() }
        </div>
      </List.Item>
    );
  });

/* 使用虚拟列表显示房间消息 */
interface MessageDisplayProps {
  data: Array<FormatCustomMessage>;
  loading?: boolean;
}

function MessageDisplay(props: MessageDisplayProps): ReactElement {
  const { data, loading }: MessageDisplayProps = props;
  const [messageListHeight, setMessageListHeight]: [number, D<S<number>>] = useState(0); // 当前content的高度
  const resizeObserverRef: MutableRefObject<ResizeObserver | null> = useRef(null);
  const messageListRef: RefObject<HTMLDivElement> = useRef(null);
  const virtualListRef: RefObject<ListRef> = useRef(null);

  function handleResizeObserverCallback(entries: ResizeObserverEntry[], observer: ResizeObserver): void {
    setMessageListHeight((prevState: number): number => entries[0].contentRect.height);
  }

  // 上下滚动
  function handleScrollKeydown(event: KeyboardEvent): void {
    if (messageListRef.current && virtualListRef.current && (event.code === 'ArrowUp' || event.code === 'ArrowDown')) {
      const antListItem: HTMLElement | null = messageListRef.current.querySelector(`.${ VirtualItemClassName }`);

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
    messageListRef.current && resizeObserverRef.current.observe(messageListRef.current);

    return function(): void {
      document.removeEventListener('keydown', handleScrollKeydown);
      resizeObserverRef.current?.disconnect?.();
      resizeObserverRef.current = null;
    };
  }, []);

  return (
    <div ref={ messageListRef } className="relative z-50 h-full overflow-hidden">
      <Spin size="large" spinning={ loading }>
        <List className={ commonStyle.virtualList } size="small">
          {
            data.length > 0 ? (
              <VirtualList ref={ virtualListRef }
                data={ data }
                height={ messageListHeight }
                itemHeight={ 26 }
                itemKey="msgIdClient"
              >
                {
                  (item: FormatCustomMessage, index: number): ReactElement =>
                    <MessageItem key={ item.msgIdClient } item={ item } index={ index } />
                }
              </VirtualList>
            ) : <Empty className="pt-[20px]" />
          }
        </List>
      </Spin>
    </div>
  );
}

MessageDisplay.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool
};

export default MessageDisplay;