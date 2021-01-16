import * as querystring from 'querystring';
import got, { Response as GotResponse } from 'got';
import { getAcFuncCookie } from '../../../utils/utils';
import type { AppVisitorLogin, WebToken, LiveWebStartPlay } from './interface';

// 获取acfun直播的html和cookie
export async function requestAcFunLiveHtml(uri: string): Promise<[string, string]> {
  const res: GotResponse<string> = await got.get(uri, {
    responseType: 'text',
    headers: {
      Cookie: getAcFuncCookie()
    }
  });
  const cookie: string = res.headers['set-cookie']![0]
    .split(/;\s*/)[0] // _did=
    .split(/=/)[1];   // did的值

  return [res.body, cookie]; // 获取cookie中的_did值
}

/**
 * 未登陆时，获取acfun的token
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
 * @param { string } authorId: 直播间id
 */
export async function requestPlayUrl(didCookie: string, st: string, authorId: string): Promise<LiveWebStartPlay> {
  const acfunCookie: string | undefined = getAcFuncCookie();
  let userId: string = '';

  if (acfunCookie) {
    for (const item of acfunCookie.split(/\s*;\s*/)) {
      if (/auth_key/i.test(item)) {
        userId = item.split(/=/)[1];
        break;
      }
    }
  }

  const query: string = querystring.stringify({
    subBiz: 'mainApp',
    kpn: 'ACFUN_APP',
    kpf: 'PC_WEB',
    userId, // 用户名，cookie里面的auth_key
    did: didCookie,
    'acfun.midground.api_st': st
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