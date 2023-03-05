import type { ReactElement, ReactNode } from 'react';
import * as PropTypes from 'prop-types';
import type { UploadFileResult } from 'nim-web-sdk-ng/dist/QCHAT_BROWSER_SDK/CloudStorageServiceInterface';
import { typeCNName } from '../MessageDisplay/MessageDisplay';
import { PAGE_SIZE } from './SearchMessage';
import type {
  UserV2,
  SendDataItem,
  ReplyInfo,
  LIVEPUSHMessageV2,
  FlipCardInfo,
  FlipCardAudioInfo,
  FlipCardVideoInfo,
  EXPRESSIMAGEMessageV2
} from '../../types';

/**
 * 根据口袋房间格式化后的数据结构生成html
 * 生成html需要的相关组件，通过renderToString来渲染template
 * 使用github开源的primer(https://primer.style/css/)作为设计语言
 */

/* template总体的html布局 */
interface HtmlProps {
  time: string;
  page: number;
  length: number;
  children: ReactNode;
}

export function Html(props: HtmlProps): ReactElement {
  const { time, page, length, children }: HtmlProps = props;
  const styleValue: string = `.template-body { width: 100%; height: 100%; overflow: hidden; }
.template-auto-content { overflow: auto; }
.template-media { max-width: 600px }
.template-image-express-image { max-width: 85px; }
.template-pre { white-space: pre-wrap; word-break: break-all; }`;
  const maxPage: number = Math.ceil(length / PAGE_SIZE); // 最大页数
  const onlyOnePage: boolean = 1 === maxPage; // 只有一页

  // 小于10页渲染分页，
  function paginateRender(): Array<ReactElement> {
    const element: Array<ReactElement> = [];

    for (let i: number = 1; i <= maxPage; i++) {
      if (i === page) {
        element.push(<em key={ `current-${ i }` } aria-current="page">{ i }</em>);
      } else {
        element.push(<a key={ `href-${ i }` } href={ `${ i }.html` } aria-label={ `第${ i }页` }>{ i }</a>);
      }
    }

    return element;
  }

  // 大于15页渲染分页
  function paginateRenderHasDot(): Array<ReactElement> {
    const element: Array<ReactElement> = [];
    let startPage: number = page - 2;
    let endPage: number = page + 2;
    let hasStartDot: boolean = true;
    let hasEndDot: boolean = true;

    if (page < 5) {
      startPage = 1;
      endPage = 1 + 4;
      hasStartDot = false;
    }

    if (page > maxPage - 4) {
      endPage = maxPage;
      startPage = endPage - 4;
      hasEndDot = false;
    }

    for (let i: number = startPage; i <= endPage; i++) {
      if (i === page) {
        element.push(<em key={ `current-${ i }` } aria-current="page">{ i }</em>);
      } else {
        element.push(<a key={ `href-${ i }` } href={ `${ i }.html` } aria-label={ `第${ i }页` }>{ i }</a>);
      }
    }

    if (hasStartDot) {
      element.unshift(
        <a key="href-1" href="1.html" aria-label="第1页">1</a>,
        <span key="start-dot" className="gap">…</span>
      );
    }

    if (hasEndDot) {
      element.push(
        <span key="end-dot" className="gap">…</span>,
        <a key={ `href-${ maxPage }` } href={ `${ maxPage }.html` } aria-label={ `第${ maxPage }页` }>{ maxPage }</a>
      );
    }

    return element;
  }

  return (
    <html>
      <head>
        <meta charSet="UTF-8" />
        <link rel="stylesheet" href="https://unpkg.com/@primer/css@20.8.3/dist/primer.css" />
        <style>{ styleValue }</style>
      </head>
      <body className="template-body">
        <div className="d-flex flex-column template-body">
          <div className="flex-auto p-2 template-auto-content">
            <header className="mb-2 flash flash-warn f6">
              Created by&nbsp;
              <a href="https://github.com/duan602728596/48tools" target="_blank" rel="noreferrer">48tools</a>
              &nbsp;at { time }. Generated using&nbsp;
              <a href="https://github.com/facebook/react" target="_blank" rel="noreferrer">React</a>
              &nbsp;and&nbsp;
              <a href="https://primer.style/" target="_blank" rel="noreferrer">Primer design</a>.
            </header>
            <div className="Box">
              <ul className="f5">{ children }</ul>
            </div>
          </div>
          <div className="flex-shrink-0 py-2 border-top">
            <nav className="paginate-container" aria-label="Pagination">
              <div className="pagination">
                {
                  // 上一页
                  page <= 1 || onlyOnePage
                    ? <span className="previous_page" aria-disabled="true">上一页</span>
                    : <a className="previous_page" rel="previous" href={ `${ page - 1 }.html` } aria-label="下一页">上一页</a>
                }
                {
                  maxPage > 8
                    ? paginateRenderHasDot()
                    : paginateRender()
                }
                {
                  // 下一页
                  page >= maxPage || onlyOnePage
                    ? <span className="next_page" aria-disabled="true">下一页</span>
                    : <a className="next_page" rel="next" href={ `${ page + 1 }.html` } aria-label="下一页">下一页</a>
                }
              </div>
            </nav>
          </div>
        </div>
      </body>
    </html>
  );
}

Html.propTypes = {
  time: PropTypes.string,
  children: PropTypes.node
};

/* 通用的item，显示用户头像和消息时间 */
interface UserInfoProps {
  item: SendDataItem;
  children?: ReactNode;
}

function Basic(props: UserInfoProps): ReactElement {
  const { item, children }: UserInfoProps = props;
  const user: UserV2 = item.extInfo['user'];

  return (
    <li className="Box-row">
      <div className="mb-2">
        <img className="avatar avatar-5 mr-2" src={ user.avatar } />
        <span>{ user.nickName }</span>
      </div>
      { children }
      <time className="d-block">2023-02-03 16:23:19</time>
    </li>
  );
}

Basic.propTypes = {
  item: PropTypes.object,
  children: PropTypes.node
};

/* 类型对应的组件 */
interface ComponentProps {
  item: SendDataItem;
}

/* 文字消息 */
export function Text(props: ComponentProps): ReactElement {
  const { item }: ComponentProps = props;
  const bodys: string = item.bodys as string;

  return (
    <Basic item={ item }>
      <p className="mb-2 template-pre">{ bodys }</p>
    </Basic>
  );
}

/* 回复消息 */
export function Reply(props: ComponentProps): ReactElement {
  const { item }: ComponentProps = props;
  const replyInfo: ReplyInfo = item.bodys['replyInfo'] as ReplyInfo;

  return (
    <Basic item={ item }>
      <p className="mb-2 template-pre">{ replyInfo.text }</p>
      <blockquote className="ml-2 mb-2 p-2 color-bg-accent template-pre">
        { replyInfo.replyName }：{ replyInfo.replyText }
      </blockquote>
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
            <img className="template-media" src={ bodys.url } />
          </div>
        )
      }
      {
        item.msgType === 'VIDEO' && (
          <div className="mb-2">
            <video className="template-media" src={ bodys.url } controls={ true } />
          </div>
        )
      }
      {
        item.msgType === 'AUDIO' && (
          <div className="mb-2">
            <audio className="template-media" src={ bodys.url } controls={ true } />
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
        {
          item.msgType === 'FLIPCARD_AUDIO'
            ? <audio className="template-media" src={ answer.url } controls={ true } />
            : <video className="template-media" src={ answer.url } controls={ true } />
        }
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
      <pre className="p-2 template-pre">
        <code>{ JSON.stringify(item) }</code>
      </pre>
    </Basic>
  );
}

/* error */
export function ErrorJSONComponent(props: ComponentProps): ReactElement {
  const { item }: ComponentProps = props;

  return (
    <pre className="p-2 template-pre">
      <code>{ JSON.stringify(item) }</code>
    </pre>
  );
}

Text.propTypes
  = Reply.propTypes
  = Media.propTypes
  = LivePush.propTypes
  = FlipCard.propTypes
  = FlipMedia.propTypes
  = ExpressImage.propTypes
  = JSONComponent.propTypes
  = ErrorJSONComponent.propTypes = {
                  item: PropTypes.object
                };