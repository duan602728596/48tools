import * as dayjs from 'dayjs';

/* 抖音cookie的缓存 */
interface CookieSessionValue {
  value: string;
  time: number;
}

class DouyinCookieCache {
  static SESSION_NAME: string = 'DOU_YIN_COOKIE_CACHE';

  // 从sessionStorage中取值
  get cookie(): CookieSessionValue | undefined {
    const cookieStr: string | null = sessionStorage.getItem(DouyinCookieCache.SESSION_NAME);

    if (cookieStr) {
      return JSON.parse(cookieStr);
    }
  }

  // 判断是否在缓存时间内并赋值
  getCookie(callback: (v: string) => void): void {
    const cookie: CookieSessionValue | undefined = this.cookie;

    if (cookie && dayjs().diff(cookie.time, 'second') < 3600) { // 缓存
      callback(cookie.value);
    }
  }

  // 设置cookie的值
  setCookie(cookieValue: string): void {
    sessionStorage.setItem(DouyinCookieCache.SESSION_NAME, JSON.stringify({
      value: cookieValue,
      time: dayjs().valueOf()
    }));
  }

  // 清除cookie的值
  clearCookie(): void {
    sessionStorage.removeItem(DouyinCookieCache.SESSION_NAME);
  }
}

export default new DouyinCookieCache();