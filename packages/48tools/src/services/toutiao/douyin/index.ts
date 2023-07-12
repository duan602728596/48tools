import got, { type Response as GotResponse } from 'got';
import { pcUserAgent } from '../../../utils/utils';
import { awemePostQuery, awemeDetailQuery } from '../../../utils/toutiao/signUtils';
import { douyinCookie } from '../../../utils/toutiao/DouyinCookieStore';
import { msToken, douyinUserAgent } from '../../../utils/toutiao/signUtils';
import Signer from '../../../utils/toutiao/Signer';
import type {
  AwemePostResponse,
  AwemeDetailResponse,
  DouyinHtmlResponseType,
  DouyinUserApiType,
  DouyinDetailApiType,
  LiveEnter
} from './interface';
import type { VideoQuery } from '../../../pages/Toutiao/types';

export type * from './interface';

type RequestDouyinHtmlReturn = (urlCb: string | ((url?: string) => string), cookie?: string) => Promise<DouyinHtmlResponseType>;

/**
 * 获取抖音网页的html
 * @param { string } url: 抖音地址
 */
function requestDouyinHtml(url?: string): RequestDouyinHtmlReturn {
  async function _requestDouyinHtml(urlCb: string | ((url?: string) => string), cookie: string = ''): Promise<DouyinHtmlResponseType> {
    const uri: string = typeof urlCb === 'function' ? urlCb(url) : urlCb;
    const res: GotResponse<string> = await got.get(uri, {
      responseType: 'text',
      headers: {
        'User-Agent': pcUserAgent,
        Cookie: '__ac_referer=__ac_blank;' + cookie,
        Host: new URL(uri).host
      },
      followRedirect: false
    });

    const acNonceStr: string | undefined = res?.headers?.['set-cookie']?.find?.(
      (o: string): boolean => o.includes('__ac_nonce'));

    return acNonceStr ? {
      type: 'cookie',
      cookie: acNonceStr.split(/s*;s*/)[0].split(/=/)[1],
      html: res.body
    } : {
      type: 'html',
      html: res.body
    };
  }

  return _requestDouyinHtml;
}

export const requestDouyinVideo: RequestDouyinHtmlReturn = requestDouyinHtml('https://www.douyin.com/video/');
export const requestDouyinUser: RequestDouyinHtmlReturn = requestDouyinHtml('https://www.douyin.com/user/');
export const requestDouyinUrl: RequestDouyinHtmlReturn = requestDouyinHtml();

/**
 * 抖音302地址的处理
 * @param { string } uri
 */
export async function requestGetVideoRedirectUrl(uri: string): Promise<string> {
  const res: GotResponse<string> = await got.get(uri, {
    responseType: 'text',
    headers: {
      Host: 'www.douyin.com',
      'User-Agent': pcUserAgent
    },
    followRedirect: false
  });

  return res.body;
}

/**
 * 请求user的视频列表
 * @param { string } cookie: string
 * @param { VideoQuery } videoQuery: user id
 */
export async function requestAwemePost(cookie: string, videoQuery: VideoQuery): Promise<AwemePostResponse | string> {
  const query: string = awemePostQuery(videoQuery.secUserId, videoQuery.maxCursor);
  const res: GotResponse<AwemePostResponse | string> = await got.get(
    `https://www.douyin.com/aweme/v1/web/aweme/post/?${ query }`, {
      responseType: 'json',
      headers: {
        Referer: `https://www.douyin.com/user/${ videoQuery.secUserId }`,
        Host: 'www.douyin.com',
        'User-Agent': douyinUserAgent,
        Cookie: cookie
      },
      followRedirect: false
    });

  return res.body;
}

export async function requestAwemePostReturnType(cookie: string, videoQuery: VideoQuery): Promise<DouyinUserApiType> {
  const res: AwemePostResponse | string = await requestAwemePost(cookie, videoQuery);

  return { type: 'userApi', data: typeof res === 'object' ? res : undefined };
}

/* 请求视频的detail */
export async function requestAwemeDetail(cookie: string, id: string, signature: string): Promise<AwemeDetailResponse | string> {
  const query: string = awemeDetailQuery(id, signature);
  const res: GotResponse<AwemeDetailResponse | string> = await got.get(
    `https://www.douyin.com/aweme/v1/web/aweme/detail/?${ query }`, {
      responseType: 'json',
      headers: {
        Referer: `https://www.douyin.com/video/${ id }`,
        Host: 'www.douyin.com',
        'User-Agent': douyinUserAgent,
        Cookie: cookie
      },
      followRedirect: false
    });

  return res.body;
}

export async function requestAwemeDetailReturnType(cookie: string, id: string, signature: string): Promise<DouyinDetailApiType> {
  const res: AwemeDetailResponse | string = await requestAwemeDetail(cookie, id, signature);

  return { type: 'detailApi', data: typeof res === 'object' ? res : undefined };
}

/* 请求ttwid */
export async function requestTtwidCookie(): Promise<void> {
  const res: GotResponse = await got.post('https://ttwid.bytedance.com/ttwid/union/register/', {
    responseType: 'json',
    json: {
      region: 'union',
      aid: 1768,
      needFid: false,
      service: 'www.ixigua.com',
      migrate_info: { ticket: '', source: 'source' },
      cbUrlProtocol: 'https',
      union: true
    }
  });

  if (res.headers?.['set-cookie']) {
    for (const cookieStr of res.headers['set-cookie']) {
      douyinCookie.set(cookieStr);
    }
  }
}

/**
 * 抖音直播
 * @param { string } cookie
 * @param { string } rid
 */
export async function requestLiveEnter(cookie: string, rid: string): Promise<LiveEnter | string> {
  const token: string = msToken();
  const searchParams: URLSearchParams = new URLSearchParams({
    aid: '6383',
    device_platform: 'web',
    web_rid: rid,
    msToken: token
  });
  const xbogus: string = Signer.sign(searchParams.toString(), pcUserAgent);

  searchParams.set('X-Bogus', xbogus);

  const res: GotResponse<LiveEnter | string> = await got.get(
    `https://live.douyin.com/webcast/room/web/enter/?${ searchParams.toString() }`, {
      responseType: 'json',
      headers: {
        Referer: 'https://live.douyin.com/',
        Host: 'live.douyin.com',
        'User-Agent': pcUserAgent,
        Cookie: cookie
      }
    });

  return res.body;
}