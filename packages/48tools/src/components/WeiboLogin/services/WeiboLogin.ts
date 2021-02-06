import got, { Response as GotResponse } from 'got';
import jsonp from '../../../utils/jsonp';
import type { QrcodeImage, QrcodeCheck, LoginReturn, UserInfo } from './interface';

// 获取微博二维码
export function requestQrcode(): Promise<QrcodeImage> {
  return jsonp<QrcodeImage>('https://login.sina.com.cn/sso/qrcode/image', {
    entry: 'weibo',
    size: 180
  });
}

/**
 * 判断是否登陆
 * @param { string } qrid: 获取微博二维码时得到的qrid
 */
export function requestQrcodeCheck(qrid: string): Promise<QrcodeCheck> {
  return jsonp<QrcodeCheck>('https://login.sina.com.cn/sso/qrcode/check', {
    entry: 'weibo',
    qrid
  });
}

/**
 * 获取cookie和其他相关信息
 * @param { string } alt: 判断是否登陆后获得的alt
 */
export function requestLogin(alt: string): Promise<LoginReturn> {
  return jsonp<LoginReturn>('https://login.sina.com.cn/sso/login.php', {
    entry: 'weibo',
    returntype: 'TEXT',
    crossdomain: 1,
    cdult: 3,
    domain: 'weibo.com',
    alt,
    savestate: 30
  });
}

/**
 * 获取cookie
 * @param { string } uri: CrossDomainUrl
 */
export async function requestCrossDomainUrl(uri: string): Promise<string[]> {
  const res: GotResponse<string> = await got.get(uri);

  return [res.headers['set-cookie']![0]];
}

/**
 * 获取账号信息
 * @param { string } id: 用户id
 * @param { string } cookie
 */
export async function requestUserInfo(id: string, cookie: string): Promise<UserInfo> {
  const res: GotResponse<UserInfo> = await got.get(`https://weibo.com/ajax/profile/info?uid=${ id }`, {
    responseType: 'json',
    headers: {
      Cookie: cookie
    }
  });

  return res.body;
}