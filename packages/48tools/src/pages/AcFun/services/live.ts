import * as querystring from 'node:querystring';
import got, { type Response as GotResponse } from 'got';
import getLiveWorker from './live.worker/getLiveWorker';
import { getAcFuncCookie } from '../../../utils/utils';
import type { AppVisitorLogin, WebToken, LiveWebStartPlay } from './interface';

/**
 * 获取acfun直播的html和cookie
 * @param { string } roomId: 直播间id
 */
export function requestAcFunLiveHtml(roomId: string): Promise<string> {
  return new Promise((resolve: Function, reject: Function): void => {
    const worker: Worker = getLiveWorker();

    worker.addEventListener('message', function(event: MessageEvent<string>) {
      resolve(event.data);
      worker.terminate();
    });
    worker.postMessage({ roomId, cookie: getAcFuncCookie() });
  });
}

/**
 * 未登陆时，获取acfun的token和userId
 * @param { string } didCookie: cookie中的_did值
 */
export async function requestRestAppVisitorLogin(didCookie: string): Promise<AppVisitorLogin> {
  const res: GotResponse<string> = await got('https://id.app.acfun.cn/rest/app/visitor/login', {
    method: 'POST',
    responseType: 'text',
    headers: {
      Referer: 'https://live.acfun.cn/',
      Cookie: `_did=${ didCookie }`,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: 'sid=acfun.api.visitor'
  });

  return JSON.parse(res.body);
}

// 已登陆时，获取acfun的token，直接使用登陆后得到的cookie
export async function requestWebTokenGet(): Promise<WebToken> {
  const res: GotResponse<string> = await got('https://id.app.acfun.cn/rest/web/token/get', {
    method: 'POST',
    responseType: 'text',
    headers: {
      Referer: 'https://live.acfun.cn/',
      Cookie: getAcFuncCookie(),
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: 'sid=acfun.midground.api'
  });

  return JSON.parse(res.body);
}

/**
 * 获取地址
 * @param { string } didCookie: cookie里did的值
 * @param { string } st: 前面获取的token
 * @param { number } userId: 用户id，未登陆时为临时获取的id
 * @param { boolean } isVisitor: 是否为未登陆状态
 * @param { string } authorId: 直播间id
 */
export async function requestPlayUrl(
  didCookie: string,
  st: string,
  userId: number,
  isVisitor: boolean,
  authorId: string
): Promise<LiveWebStartPlay> {
  const query: string = querystring.stringify({
    subBiz: 'mainApp',
    kpn: 'ACFUN_APP',
    kpf: 'PC_WEB',
    userId,
    did: didCookie,
    [isVisitor ? 'acfun.api.visitor_st' : 'acfun.midground.api_st']: st
  });
  const res: GotResponse<string> = await got(`https://api.kuaishouzt.com/rest/zt/live/web/startPlay?${ query }`, {
    method: 'POST',
    responseType: 'text',
    headers: {
      Referer: 'https://live.acfun.cn/',
      Cookie: getAcFuncCookie(),
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: querystring.stringify({
      authorId,
      pullStreamType: 'FLV'
    })
  });

  return JSON.parse(res.body);
}