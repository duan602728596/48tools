// @ts-expect-error
import got, { type Response as GotResponse } from 'got';
import type { LoginUrl, LoginInfo } from './interface';

export type * from './interface';

// 获取登陆二维码地址
export async function requestLoginUrl(): Promise<LoginUrl> {
  const res: GotResponse<LoginUrl> = await got.get(
    'https://passport.bilibili.com/x/passport-login/web/qrcode/generate?source=main-fe-header', {
      responseType: 'json'
    });

  return res.body;
}

/**
 * 循环查询是否扫码登陆
 * @param { string } oauthKey
 */
export async function requestLoginInfo(oauthKey: string): Promise<[LoginInfo, Array<string>]> {
  const query: string = new URLSearchParams({
    qrcode_key: oauthKey,
    source: 'main-fe-header'
  }).toString();
  const res: GotResponse<LoginInfo> = await got(
    `https://passport.bilibili.com/x/passport-login/web/qrcode/poll?${ query }`, {
      method: 'GET',
      responseType: 'json',
      headers: {
        Referer: 'https://www.bilibili.com/'
      }
    });

  return [res.body, res.headers['set-cookie']!];
}