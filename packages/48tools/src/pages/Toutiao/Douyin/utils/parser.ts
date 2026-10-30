import { match, type Match, type MatchFunction } from 'path-to-regexp';
import { requestDouyinUrl, type DouyinHtmlResponseType } from '@48tools-api/toutiao/douyin';

type VideoParamType = 'video' | 'note';
type VideoParam = Partial<{ videoId: string; videoType: VideoParamType }>;
type UserParam = Partial<{ userId: string }>;
type DouyinHtmlResponse = Extract<DouyinHtmlResponseType, { html: string }>;

const douyinHostRegexp: RegExp = /(^|\.)(douyin\.com|iesdouyin\.com)$/i; // 抖音及其分享域名
const videoIdRegexp: RegExp = /^[0-9]+$/;                    // 视频id
const douyinVideoUrlMatch: MatchFunction<VideoParam> = match('/:videoType/:videoId');
const douyinUserUrlMatch: MatchFunction<UserParam> = match('/user/:userId');
const douyinShareVideoUrlMatch: MatchFunction<VideoParam> = match('/share/:videoType/:videoId');
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
 * 判断字符串是否是video或note
 * @param { VideoParamType | undefined } t
 */
function isVideoParamType(t: VideoParamType | undefined): t is VideoParamType {
  if (!t) return false;

  const tLow: string = t.toLowerCase();

  return tLow === 'video' || tLow === 'note';
}

/**
 * 解析受支持的抖音URL
 * @param { URL } urlParse - 地址的解析
 */
function parseDouyinUrl(urlParse: URL): ParseResult | undefined {
  if (urlParse.protocol !== 'http:' && urlParse.protocol !== 'https:') return undefined;
  if (!douyinHostRegexp.test(urlParse.hostname)) return undefined;

  const modalId: string | null = urlParse.searchParams.get('modal_id');

  if (modalId) return { type: DouyinUrlType.Video, id: modalId };

  if (/^\/(video|note)\/[0-9]+/i.test(urlParse.pathname)) {
    const matchResult: Match<VideoParam> = douyinVideoUrlMatch(urlParse.pathname);

    if (typeof matchResult === 'object' && isVideoParamType(matchResult.params.videoType)) {
      return { type: DouyinUrlType.Video, id: matchResult.params.videoId! };
    }
  } else if (/^\/user\//i.test(urlParse.pathname)) {
    const matchResult: Match<UserParam> = douyinUserUrlMatch(urlParse.pathname);

    if (typeof matchResult === 'object') {
      return { type: DouyinUrlType.User, id: matchResult.params.userId! };
    }
  } else if (/^\/share\/(video|note)\//i.test(urlParse.pathname)) {
    const matchResult: Match<VideoParam> = douyinShareVideoUrlMatch(urlParse.pathname);

    if (typeof matchResult === 'object' && isVideoParamType(matchResult.params.videoType)) {
      return { type: DouyinUrlType.Video, id: matchResult.params.videoId! };
    }
  } else if (/^\/share\/user\//i.test(urlParse.pathname)) {
    const matchResult: Match<UserParam> = douyinShareUserUrlMatch(urlParse.pathname);

    if (typeof matchResult === 'object') {
      return { type: DouyinUrlType.User, id: matchResult.params.userId! };
    }
  }

  return undefined;
}

/**
 * 解析重定向中的地址，忽略无效URL
 * @param { string } href - 跳转地址
 * @param { string } sourceUrl - 短链接地址
 */
function parseRedirectHref(href: string, sourceUrl: string): ParseResult | undefined {
  try {
    return parseDouyinUrl(new URL(href, sourceUrl));
  } catch { /* noop */ }

  return undefined;
}

/**
 * 解析短链接的Location、canonical和页面链接
 * @param { DouyinHtmlResponse } response - 短链接请求结果
 * @param { string } sourceUrl - 短链接地址
 */
function parseDouyinRedirect(response: DouyinHtmlResponse, sourceUrl: string): ParseResult | undefined {
  if (response.redirectUrl) {
    const result: ParseResult | undefined = parseRedirectHref(response.redirectUrl, sourceUrl);

    if (result) return result;
  }

  const parseDocument: Document = new DOMParser().parseFromString(response.html, 'text/html');
  const links: Array<Element> = [
    ...parseDocument.querySelectorAll('link[rel~="canonical"][href]'),
    ...parseDocument.querySelectorAll('a[href]')
  ];

  for (const link of links) {
    const result: ParseResult | undefined = parseRedirectHref(link.getAttribute('href')!, sourceUrl);

    if (result) return result;
  }

  return undefined;
}

/**
 * URL解析地址
 * @param { URL } urlParse - 地址的解析
 * @param { string } url - 抖音url地址
 * @param { string | undefined } cookie - 请求时使用的cookie
 */
async function douyinUrlParse(urlParse: URL, url: string, cookie: string | undefined): Promise<ParseResult | undefined> {
  const directResult: ParseResult | undefined = parseDouyinUrl(urlParse);

  if (directResult) return directResult;

  if ((urlParse.protocol === 'http:' || urlParse.protocol === 'https:') && urlParse.hostname.toLowerCase() === 'v.douyin.com') {
    const douyinShareResponse: DouyinHtmlResponseType = await requestDouyinUrl(url, cookie);

    if ('html' in douyinShareResponse) {
      return parseDouyinRedirect(douyinShareResponse, url);
    }
  }

  return undefined;
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
