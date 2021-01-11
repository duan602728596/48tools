import got, { Response as GotResponse } from 'got';
import type { LoginUrl } from './interface';

// 获取登陆二维码地址
export async function requestLoginUrl(): Promise<LoginUrl> {
  const res: GotResponse<LoginUrl> = await got.get('https://passport.bilibili.com/qrcode/getLoginUrl', {
    responseType: 'json'
  });

  return res.body;
}