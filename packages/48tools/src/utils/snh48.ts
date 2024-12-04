import { Pocket48Login } from '../functionalComponents/Pocket48Login/enum';
import type { UserInfoString, UserInfo } from '../functionalComponents/Pocket48Login/types';

// app端口袋48ua
export const engineUserAgent: string = 'SNH48 ENGINE';
export const appUserAgent: string = 'PocketFans201807/6.0.16 (iPhone; iOS 13.5.1; Scale/2.00)';

/* 随机字符串 */
function rStr(len: number): string {
  const str: string = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890';
  let result: string = '';

  for (let i: number = 0; i < len; i++) {
    const rIndex: number = Math.floor(Math.random() * str.length);

    result += str[rIndex];
  }

  return result;
}

declare global {
  interface GlobalThis {
    __c4x8zwu2__: PromiseWithResolvers<boolean>;
    __x6c2adf8__(): string;
  }
}

async function $__x6c2adf8__(): Promise<string> {
  await globalThis.__c4x8zwu2__.promise;

  return Reflect.get(globalThis, '__x6c2adf8__').call();
}

/* 创建请求头 */
export async function createHeaders(token?: string | undefined, pa?: boolean): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json;charset=utf-8',
    appInfo: JSON.stringify({
      vendor: 'apple',
      deviceId: `${ rStr(8) }-${ rStr(4) }-${ rStr(4) }-${ rStr(4) }-${ rStr(12) }`,
      appVersion: '7.0.4',
      appBuild: '23011601',
      osVersion: '16.3.1',
      osType: 'ios',
      deviceName: 'iPhone XR',
      os: 'ios'
    }),
    'User-Agent': appUserAgent,
    'Accept-Language': 'zh-Hans-AW;q=1',
    Host: 'pocketapi.48.cn'
  };

  if (token) {
    headers.token = token;
  }

  if (token || pa) {
    headers.pa = await $__x6c2adf8__();
  }

  return headers;
}

/* 拼接静态文件地址 */
export function source(pathname: string | undefined): string {
  if (!pathname || pathname === '') return '';

  if (/^https?\/{2}/i.test(pathname)) {
    return pathname;
  } else {
    const url: URL = new URL(pathname, 'https://source3.48.cn/');

    return url.href;
  }
}

export function mp4Source(pathname: string): string {
  if (!pathname || pathname === '') return '';

  const url: URL = new URL(pathname, 'https://mp4.48.cn/');

  return url.href;
}

/* 获取登录的token */
export function getPocket48Token(): string | undefined {
  const userInfoStr: string | null = localStorage.getItem(Pocket48Login.StorageKey);

  if (userInfoStr !== null) {
    const userInfo: UserInfo = JSON.parse(userInfoStr as UserInfoString);

    return userInfo.token;
  }
}