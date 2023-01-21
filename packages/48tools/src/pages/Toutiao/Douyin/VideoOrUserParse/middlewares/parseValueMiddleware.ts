import { match, type MatchFunction, type Match } from 'path-to-regexp';
import {
  requestDouyinUrl,
  requestDouyinVideo,
  requestDouyinUser,
  type DouyinVideo
} from '../../../services/douyin';
import douyinCookieCache from '../../DouyinCookieCache';
import * as toutiaosdk from '../../sdk/toutiaosdk';
import type { GetVideoUrlOnionContext } from '../../../types';

const vdouinRegexp: RegExp = /v\.douyin\.com/i;       // 抖音分享短链接
const iesdouyinRegexp: RegExp = /www.iesdouyin.com/i; // 抖音分享长链接
const iesdouyinhrefHtmlRegexp: RegExp = /<a href="https?:\/\/www\.iesdouyin\.com\//i; // 是一个链接
const shareVideo: RegExp = /share\/video/i;       // 分享视频
const douyinRegexp: RegExp = /www\.douyin\.com/i;     // 抖音域名
const douyinVideoRegexp: RegExp = /\/video\/[0-9]+/i; // 抖音视频
const videoIdRegexp: RegExp = /^[0-9]+$/;         // 视频id
const douyinUserRegexp: RegExp = /\/user\//i;     // 抖音用户
const douyinVideoUrlMatch: MatchFunction = match('/video/:videoId');
const douyinUserUrlMatch: MatchFunction = match('/user/:userId');
const douyinShareVideoUrlMatch: MatchFunction = match('/share/video/:videoId');
const douyinShareUserUrlMatch: MatchFunction = match('/share/user/:userId');

interface TypeAndId {
  type: 'video' | 'user' | undefined;
  id: string | undefined;
}

/* URL解析地址 */
async function getTypeAndIdWithUrlParse(urlParse: URL, cookie: string | undefined, ctx: GetVideoUrlOnionContext): Promise<TypeAndId> {
  let type: 'video' | 'user' | undefined;
  let id: string | undefined;
  const modalId: string | null = urlParse.searchParams.get('modal_id');

  if (vdouinRegexp.test(urlParse.hostname)) {
    // 处理分享链接
    const douyinShareVideo: DouyinVideo = await requestDouyinUrl(ctx.value, cookie);

    if (
      douyinShareVideo.type === 'html'
      && iesdouyinhrefHtmlRegexp.test(douyinShareVideo.body)
      && iesdouyinRegexp.test(douyinShareVideo.body)
    ) {
      const parseDocument: Document = new DOMParser().parseFromString(douyinShareVideo.body, 'text/html');
      const href: string = parseDocument.querySelector('a')!.getAttribute('href')!;

      if (shareVideo.test(href)) {
        const matchResult: Match = douyinShareVideoUrlMatch(new URL(href).pathname);

        if (typeof matchResult === 'object') {
          type = 'video';
          id = matchResult.params['videoId'];
        }
      } else {
        const matchResult: Match = douyinShareUserUrlMatch(new URL(href).pathname);

        if (typeof matchResult === 'object') {
          type = 'user';
          id = matchResult.params['userId'];
        }
      }
    }
  } else if (modalId) {
    type = 'video';
    id = modalId;
  } else if (douyinRegexp.test(urlParse.hostname) && douyinVideoRegexp.test(urlParse.pathname)) {
    // /video/:videoId
    const matchResult: Match = douyinVideoUrlMatch(urlParse.pathname);

    if (typeof matchResult === 'object') {
      type = 'video';
      id = matchResult.params['videoId'];
    }
  } else if (douyinRegexp.test(urlParse.hostname) && douyinUserRegexp.test(urlParse.pathname)) {
    // /user/:userId
    const matchResult: Match = douyinUserUrlMatch(urlParse.pathname);

    if (typeof matchResult === 'object') {
      type = 'user';
      id = matchResult.params['userId'];
    }
  }

  return { type, id };
}

/* 非URL解析ID */
function getTypeAndId(ctx: GetVideoUrlOnionContext): TypeAndId {
  let type: 'video' | 'user' | undefined;
  let id: string | undefined;

  if (videoIdRegexp.test(ctx.value)) {
    type = 'video';
    id = ctx.value;
  } else {
    type = 'user';
    id = ctx.value;
  }

  return { type, id };
}

/**
 * 根据传入的值判断是视频还是用户
 * 视频：
 * https://www.douyin.com/user/MS4wLjABAAAAc6-xMO2J77mP_3h_pOdPT-47qE0cywiTLB7PF4csqPM?modal_id=7184782545546939709
 * https://www.douyin.com/video/7141964711570066722
 * 7184782545546939709
 * https://v.douyin.com/kt5s7j4/
 * 用户：
 * https://www.douyin.com/user/MS4wLjABAAAAc6-xMO2J77mP_3h_pOdPT-47qE0cywiTLB7PF4csqPM
 * MS4wLjABAAAAc6-xMO2J77mP_3h_pOdPT-47qE0cywiTLB7PF4csqPM
 * https://v.douyin.com/kG3Cu1b/
 */
async function parseValueMiddleware(ctx: GetVideoUrlOnionContext, next: Function): Promise<void> {
  let urlParse: URL | undefined = undefined;
  let douyinVideo: DouyinVideo | null = null;
  let douyinCookie: string | undefined = undefined;
  let html: string;

  douyinCookieCache.getCookie((c: string): unknown => douyinCookie = c); // 取缓存的cookie

  try {
    urlParse = new URL(ctx.value);
  } catch { /* noop */ }

  try {
    if (urlParse) {
      const result: TypeAndId = await getTypeAndIdWithUrlParse(urlParse, douyinCookie, ctx);

      ctx.type = result.type;
      ctx.id = result.id;
    } else {
      const result: TypeAndId = getTypeAndId(ctx);

      ctx.type = result.type;
      ctx.id = result.id;
    }

    if (ctx.type === 'video') {
      douyinVideo = await requestDouyinVideo((u: string) => `${ u }${ ctx.id }`, douyinCookie);
    } else {
      douyinVideo = await requestDouyinUser((u: string) => `${ u }${ ctx.id }`, douyinCookie);
    }

    if (douyinVideo === null) return;

    // 根据请求的结果判断是否继续请求
    if ((douyinVideo as DouyinVideo).type === 'html') {
      html = (douyinVideo as DouyinVideo).body;
    } else {
      // 计算__ac_signature并获取html
      const acSignature: string = await toutiaosdk.acrawler('sign', ['', (douyinVideo as DouyinVideo).value]);
      const douyinAcCookie: string = `__ac_nonce=${ (douyinVideo as DouyinVideo).value }; __ac_signature=${ acSignature };`;

      if (ctx.type === 'video') {
        douyinVideo = await requestDouyinVideo((u: string) => `${ u }${ ctx.id }`, douyinAcCookie);
      } else {
        douyinVideo = await requestDouyinUser((u: string) => `${ u }${ ctx.id }`, douyinAcCookie);
      }

      ctx.cookie = douyinAcCookie;
      html = (douyinVideo as DouyinVideo).body;
    }

    ctx.html = html;
    next();
  } catch (err) {
    console.error(err);
    ctx.messageApi.error('视频地址解析失败！');
    ctx.setUrlLoading(false);
  }
}

export default parseValueMiddleware;