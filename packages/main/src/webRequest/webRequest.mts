import { session, type OnBeforeSendHeadersListenerDetails, type BeforeSendResponse } from 'electron';
import { pcUserAgent } from '../utils.mjs';

function webRequest(): void {
  session.defaultSession.webRequest.onBeforeSendHeaders({
    urls: [
      'ws://*.netease.im:*/*',
      'wss://*.netease.im:*/*',
      '*://*.sinaimg.cn/*',
      '*://live.kuaishou.com/*'
    ]
  }, function(details: OnBeforeSendHeadersListenerDetails, callback: (res: BeforeSendResponse) => void): void {
    const url: URL = new URL(details.url);
    const headers: Record<string, string> = { ...details.requestHeaders };

    if (/sinaimg\.cn/i.test(url.hostname)) {
      /* 修改微博CDN资源请求的Referer */
      Object.assign(headers, {
        Referer: 'https://www.weibo.com/'
      });
    } else if (/ws{1,2}:/i.test(url.protocol) && /netease\.im/i.test(url.hostname)) {
      /* 网易云信修改 */
      Object.assign(headers, {
        Origin: 'https://pocketapi.48.cn',
        'User-Agent': 'PocketFans201807/24020203'
      });
    } else if (/live\.kuaishou\.com/i.test(url.hostname)) {
      /* 修改快手的请求 */
      Object.assign(headers, {
        Host: 'live.kuaishou.com',
        Referer: 'https://live.kuaishou.com/',
        'User-Agent': pcUserAgent,
        Cookie: headers.Cookie1
      });
      delete headers.Cookie1;
    }

    callback({ requestHeaders: headers });
  });
}

export default webRequest;