import { match, type Match, type MatchFunction } from 'path-to-regexp';
import { requestDouyinUrl, type DouyinHtmlResponseType } from '@48tools-api/toutiao/douyin';

type VideoParam = Partial<{ videoId: string }>;
type UserParam = Partial<{ userId: string }>;

const vdouinRegexp: RegExp = /v\.douyin\.com/i;       // 抖音分享短链接
const iesdouyinRegexp: RegExp = /www.iesdouyin.com/i; // 抖音分享长链接
const iesdouyinhrefHtmlRegexp: RegExp = /<a href="https?:\/\/www\.iesdouyin\.com\//i; // 是一个链接
const shareVideo: RegExp = /share\/(video|note)/i;    // 分享视频
const douyinRegexp: RegExp = /www\.douyin\.com/i;     // 抖音域名
const douyinVideoRegexp: RegExp = /\/(video|note)\/[0-9]+/i; // 抖音视频
const videoIdRegexp: RegExp = /^[0-9]+$/;                    // 视频id
const douyinUserRegexp: RegExp = /\/user\//i;                // 抖音用户
const douyinVideoUrlMatch: MatchFunction<VideoParam> = match('/(video|note)/:videoId');
const douyinUserUrlMatch: MatchFunction<UserParam> = match('/user/:userId');
const douyinShareVideoUrlMatch: MatchFunction<VideoParam> = match('/share/(video|note)/:videoId');
const douyinShareUserUrlMatch: MatchFunction<UserParam> = match('/share/user/:userId');

export enum DouyinUrlType {
  Video = 'video',
  User = 'user'
}

export interface ParseResult {
  type: DouyinUrlType;
  id: string;
}

/**
 * URL解析地址
 * @param { URL } urlParse - 地址的解析
 * @param { string } url - 抖音url地址
 * @param { string | undefined } cookie - 请求时使用的cookie
 */
async function douyinUrlParse(urlParse: URL, url: string, cookie: string | undefined): Promise<ParseResult | undefined> {
  let type: DouyinUrlType | undefined;
  let id: string | undefined;
  const modalId: string | null = urlParse.searchParams.get('modal_id');

  if (vdouinRegexp.test(urlParse.hostname)) {
    // 处理分享链接
    const douyinShareVideo: DouyinHtmlResponseType = await requestDouyinUrl(url, cookie);

    if (
      douyinShareVideo.type === 'html'
      && iesdouyinhrefHtmlRegexp.test(douyinShareVideo.html)
      && iesdouyinRegexp.test(douyinShareVideo.html)
    ) {
      const parseDocument: Document = new DOMParser().parseFromString(douyinShareVideo.html, 'text/html');
      const href: string = parseDocument.querySelector('a')!.getAttribute('href')!;

      if (shareVideo.test(href)) {
        const matchResult: Match<VideoParam> = douyinShareVideoUrlMatch(new URL(href).pathname);

        if (typeof matchResult === 'object') {
          type = DouyinUrlType.Video;
          id = matchResult.params.videoId;
        }
      } else {
        const matchResult: Match<UserParam> = douyinShareUserUrlMatch(new URL(href).pathname);

        if (typeof matchResult === 'object') {
          type = DouyinUrlType.User;
          id = matchResult.params.userId;
        }
      }
    }
  } else if (modalId) {
    type = DouyinUrlType.Video;
    id = modalId;
  } else if (douyinRegexp.test(urlParse.hostname) && douyinVideoRegexp.test(urlParse.pathname)) {
    // /video/:videoId
    const matchResult: Match<VideoParam> = douyinVideoUrlMatch(urlParse.pathname);

    if (typeof matchResult === 'object') {
      type = DouyinUrlType.Video;
      id = matchResult.params.videoId;
    }
  } else if (douyinRegexp.test(urlParse.hostname) && douyinUserRegexp.test(urlParse.pathname)) {
    // /user/:userId
    const matchResult: Match<UserParam> = douyinUserUrlMatch(urlParse.pathname);

    if (typeof matchResult === 'object') {
      type = DouyinUrlType.User;
      id = matchResult.params.userId;
    }
  }

  return type && id ? { type, id } : undefined;
}

/**
 * 非URL解析ID
 * @param { string } url - 抖音url地址
 */
function noUrlParse(url: string): ParseResult {
  return {
    type: videoIdRegexp.test(url) ? DouyinUrlType.Video : DouyinUrlType.User,
    id: url
  };
}

/**
 * 将抖音地址解析成不同的类型
 * @param { string } url - 抖音url地址
 * @param { string | undefined } cookie - cookie
 */
async function parser(url: string, cookie: string | undefined): Promise<ParseResult | undefined> {
  let urlParse: URL | undefined = undefined; // url的解析结果

  try {
    urlParse = new URL(url);
  } catch { /* noop */ }

  if (urlParse) {
    return await douyinUrlParse(urlParse, url, cookie);
  } else {
    return noUrlParse(url);
  }
}

export default parser;