import jsonp from '../../../utils/jsonp';
import type { QrcodeImage, QrcodeCheck } from './interface';

// 获取微博二维码
export function requestQrcode(): Promise<QrcodeImage> {
  return jsonp('https://login.sina.com.cn/sso/qrcode/image', {
    entry: 'weibo',
    size: 180
  });
}

/**
 * 判断是否登陆
 * @param { string } qrid: 获取微博二维码时得到的qrid
 */
export function requestQrcodeCheck(qrid: string): Promise<QrcodeCheck> {
  return jsonp('https://login.sina.com.cn/sso/qrcode/check', {
    entry: 'weibo',
    qrid
  });
}