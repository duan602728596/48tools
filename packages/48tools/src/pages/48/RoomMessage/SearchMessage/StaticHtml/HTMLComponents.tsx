import type { ReactElement, ReactNode } from 'react';
import type { UploadFileResult } from 'nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/CloudStorageServiceInterface';
import { typeCNName } from '../../MessageDisplay/MessageDisplay';
import type {
  UserV2,
  SendDataItem,
  ReplyInfo,
  LIVEPUSHMessageV2,
  FlipCardInfo,
  FlipCardAudioInfo,
  FlipCardVideoInfo,
  EXPRESSIMAGEMessageV2
} from '../../../types';

interface UserInfoProps {
  item: SendDataItem;
  children?: ReactNode;
}

/* 显示用户消息和时间 */
function Basic(props: UserInfoProps): ReactElement {
  const { item, children }: UserInfoProps = props;
  const user: UserV2 = item.extInfo['user'];

  return (
    <div className="p-3">
      <div className="mb-2">
        <img className="avatar avatar-5 mr-2" src={ user.avatar } />
        <span>{ user.nickName }</span>
      </div>
      { children }
      <time className="d-block">2023-02-03 16:23:19</time>
    </div>
  );
}

interface ComponentProps {
  item: SendDataItem;
}

/* 文字消息 */
export function Text(props: ComponentProps): ReactElement {
  const { item }: ComponentProps = props;
  const bodys: string = item.bodys as string;

  return (
    <Basic item={ item }>
      <p className="mb-2">{ bodys }</p>
    </Basic>
  );
}

/* 回复消息 */
export function Reply(props: ComponentProps): ReactElement {
  const { item }: ComponentProps = props;
  const replyInfo: ReplyInfo = item.bodys['replyInfo'] as ReplyInfo;

  return (
    <Basic item={ item }>
      <p className="mb-2">{ replyInfo.text }</p>
      <blockquote className="ml-4 mb-2 p-2 color-bg-accent">{ replyInfo.replyName }：{ replyInfo.replyText }</blockquote>
    </Basic>
  );
}

/* 图片，音频、视频 */
export function Media(props: ComponentProps): ReactElement {
  const { item }: ComponentProps = props;
  const bodys: UploadFileResult = item.bodys as UploadFileResult;

  return (
    <Basic item={ item }>
      {
        item.msgType === 'IMAGE' && (
          <div className="mb-2">
            <img className="template-image" src={ bodys.url } />
          </div>
        )
      }
      {
        item.msgType === 'VIDEO' && (
          <div className="mb-2">
            <video className="template-image" src={ bodys.url } controls={ true } />
          </div>
        )
      }
      {
        item.msgType === 'AUDIO' && (
          <div className="mb-2">
            <audio className="template-image" src={ bodys.url } controls={ true } />
          </div>
        )
      }
      <div className="mb-2">
        { typeCNName[item.msgType.toLowerCase()] }&nbsp;-&nbsp;
        <a className="color-fg-accent" href={ bodys.url } target="_blank">{ bodys.url }</a>
      </div>
    </Basic>
  );
}

/* 直播 */
export function LivePush(props: ComponentProps): ReactElement {
  const { item }: ComponentProps = props;
  const bodys: LIVEPUSHMessageV2['attach']['livePushInfo'] = item.bodys['livePushInfo'];

  return (
    <Basic item={ item }>
      { typeCNName[item.msgType] }&nbsp;-&nbsp;
      { bodys.liveTitle }
    </Basic>
  );
}

/* 翻牌 */
export function FlipCard(props: ComponentProps): ReactElement {
  const { item }: ComponentProps = props;
  const info: FlipCardInfo = item.bodys['filpCardInfo'] ?? item.bodys['flipCardInfo'];

  return (
    <Basic item={ item }>
      <p className="mb-2">翻牌问题：{ info.question }</p>
      <p className="mb-2">回答：{ info.answer }</p>
    </Basic>
  );
}

/* 视频或音频翻牌 */
export function FlipMedia(props: ComponentProps): ReactElement {
  const { item }: ComponentProps = props;
  const info: FlipCardAudioInfo | FlipCardVideoInfo = (item.bodys['filpCardInfo'] ?? item.bodys['flipCardInfo'])
    ?? (item.msgType === 'FLIPCARD_AUDIO'
      ? (item.bodys['filpCardAudioInfo'] ?? item.bodys['flipCardAudioInfo'])
      : (item.bodys['filpCardVideoInfo'] ?? item.bodys['flipCardVideoInfo']));
  const answer: { url: string } = JSON.parse(info.answer);

  return (
    <Basic item={ item }>
      <p className="mb-2">翻牌问题：{ info.question }</p>
      <p className="mb-2">
        回答：
        <a className="color-fg-accent" href={ answer.url } target="_blank">{ answer.url }</a>
      </p>
      <div className="mb-2">
        <video className="template-image" src={ answer.url } controls={ true } />
      </div>
    </Basic>
  );
}

/* 表情包 */
export function ExpressImage(props: ComponentProps): ReactElement {
  const { item }: ComponentProps = props;
  const expressImgInfo: EXPRESSIMAGEMessageV2['attach']['expressImgInfo'] = item.bodys['expressImgInfo'];

  return (
    <Basic item={ item }>
      <div className="mb-2">
        <img className="template-image-express-image" src={ expressImgInfo.emotionRemote } />
      </div>
    </Basic>
  );
}

/* JSON */
export function JSONComponent(props: ComponentProps): ReactElement {
  const { item }: ComponentProps = props;

  return (
    <Basic item={ item }>
      <pre className="p-3 template-code">
        <code>{ JSON.stringify(item) }</code>
      </pre>
    </Basic>
  );
}

/* error */
export function ErrorJSONComponent(props: ComponentProps): ReactElement {
  const { item }: ComponentProps = props;

  return (
    <pre className="p-3 template-code">
      <code>{ JSON.stringify(item) }</code>
    </pre>
  );
}