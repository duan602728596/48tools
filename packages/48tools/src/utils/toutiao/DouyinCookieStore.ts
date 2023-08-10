import { parse, serialize } from 'cookie';
import { rStr } from '../utils';

interface CookieItem {
  key: string;
  value: string;
}

/* 抖音cookie的相关存储 */
class DouyinCookieStore {
  static localStorageItemName: string = 'DOUYIN_COOKIE';

  #cookieMap: Map<string, string> = new Map();

  constructor() {
    this.#cookieMapInit();
  }

  // 将cookie保存到localStorage
  #cookieMapSave(): void {
    const cookieArray: Array<CookieItem> = [];

    this.#cookieMap.forEach((v: string, k: string): void => {
      cookieArray.push({ key: k, value: v });
    });

    localStorage.setItem(DouyinCookieStore.localStorageItemName, JSON.stringify(cookieArray));
  }

  // 从localStorage读取cookie
  #cookieMapInit(): void {
    const cookieStr: string | null = localStorage.getItem(DouyinCookieStore.localStorageItemName);

    if (cookieStr) {
      const cookieArray: Array<CookieItem> = JSON.parse(cookieStr);

      cookieArray.forEach((v: CookieItem): void => {
        this.#cookieMap.set(v.key, v.value);
      });
    } else {
      this.#setDefaultCookie();
    }
  }

  #setDefaultCookie(): void {
    const passportCsrfToken: string = rStr(32);

    this.#cookieMap.set('passport_csrf_token', passportCsrfToken);
    this.#cookieMap.set('passport_csrf_token_default', passportCsrfToken);
  }

  // 解析cookie
  set(string: string): void {
    const cookies: Record<string, string> = parse(string);

    Object.keys(cookies).forEach((key: string): void => {
      this.#cookieMap.set(key, cookies[key]);
    });
    this.#cookieMapSave();
  }

  // 添加cookie
  setKV(key: string, value: string): void {
    this.#cookieMap.set(key, value);
    this.#cookieMapSave();
  }

  // 转换成cookie字符串
  toString(): string {
    let cookieString: string = '';

    this.#cookieMap.forEach((value: string, key: string): void => {
      const setCookie: string = serialize(key, value);

      cookieString += `${ setCookie }; `;
    });

    return cookieString;
  }

  // 重置cookie
  reset(): void {
    this.#cookieMap.clear();
    this.#setDefaultCookie();
  }
}

export const douyinCookie: DouyinCookieStore = new DouyinCookieStore();