import { session, type OnBeforeSendHeadersListenerDetails, type BeforeSendResponse } from 'electron';

/* 修改微博CDN资源请求的Referer */
function weiboResourceRequestInit(): void {
  session.defaultSession.webRequest.onBeforeSendHeaders({
    urls: ['*://*.sinaimg.cn/*']
  }, function(details: OnBeforeSendHeadersListenerDetails, callback: (res: BeforeSendResponse) => void): void {
    callback({
      requestHeaders: {
        ...details.requestHeaders,
        Referer: 'https://www.weibo.com/'
      }
    });
  });
}

export default weiboResourceRequestInit;