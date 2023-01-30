import { rStr } from './utils';

// app端口袋48ua
export const engineUserAgent: string = 'SNH48 ENGINE';
export const appUserAgent: string = 'PocketFans201807/6.0.16 (iPhone; iOS 13.5.1; Scale/2.00)';

/* 创建请求头 */
export function createHeaders(): { [key: string]: string } {
  return {
    'Content-Type': 'application/json;charset=utf-8',
    appInfo: JSON.stringify({
      vendor: 'apple',
      deviceId: `${ rStr(8) }-${ rStr(4) }-${ rStr(4) }-${ rStr(4) }-${ rStr(12) }`,
      appVersion: '6.2.2',
      appBuild: '21080401',
      osVersion: '11.4.1',
      osType: 'ios',
      deviceName: 'iPhone XR',
      os: 'ios'
    }),
    'User-Agent': appUserAgent,
    'Accept-Language': 'zh-Hans-AW;q=1',
    Host: 'pocketapi.48.cn'
  };
}

/* 拼接静态文件地址 */
export function source(pathname: string): string {
  if (/^https?\/{2}/i.test(pathname)) {
    return pathname;
  } else {
    const url: URL = new URL(pathname, 'https://source3.48.cn/');

    return url.href;
  }
}