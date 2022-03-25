import got, { type Response as GotResponse } from 'got';
import type { LoginUrl, LoginInfo } from './interface';

// 获取登陆二维码地址
export async function requestLoginUrl(): Promise<LoginUrl> {
  const res: GotResponse<LoginUrl> = await got.get('https://passport.bilibili.com/qrcode/getLoginUrl', {
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
    oauthKey,
    gourl: 'https%3A%2F%2Fwww.bilibili.com%2F'
  }).toString();
  const res: GotResponse<string> = await got(`https://passport.bilibili.com/qrcode/getLoginInfo?${ query }`, {
    method: 'POST',
    responseType: 'text'
  });

  return [JSON.parse(res.body), res.headers['set-cookie']!];
}