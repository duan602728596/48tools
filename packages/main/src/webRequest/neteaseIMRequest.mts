import { session, type OnBeforeSendHeadersListenerDetails, type BeforeSendResponse } from 'electron';

/* 网易云信修改 */
function neteaseIMRequest(): void {
  session.defaultSession.webRequest.onBeforeSendHeaders({
    urls: [
      'ws://*.netease.im:*/*',
      'wss://*.netease.im:*/*'
    ]
  }, function(details: OnBeforeSendHeadersListenerDetails, callback: (res: BeforeSendResponse) => void): void {
    callback({
      requestHeaders: {
        ...details.requestHeaders,
        Origin: 'https://pocketapi.48.cn',
        'User-Agent': 'PocketFans201807/24020203'
      }
    });
  });
}

export default neteaseIMRequest;