import {
  session,
  type OnBeforeRequestListenerDetails,
  type Response,
  type IpcMainEvent
} from 'electron';

export const TOUTIAO_REQUEST: string = 'toutiao-fp';
let fpCache: string;

/* 监听渲染线程传递的fp的值，为后面拦截头条的请求做准备 */
export function handleToutiaoFpListener(event: IpcMainEvent, fpValue: string): void {
  fpCache = fpValue;
}

/* 拦截头条的请求，并赋值fp */
function toutiaoRequest(): void {
  session.defaultSession.webRequest.onBeforeRequest({
    urls: ['*://verify.snssdk.com/*']
  }, function(details: OnBeforeRequestListenerDetails, callback: (res: Response) => void): void {
    if (details.url.includes('captcha/get') || details.url.includes('captcha/verify')) {
      const urlResult: URL = new URL(details.url);
      const searchFpValue: string | null = urlResult.searchParams.get('fp');

      if (searchFpValue === null || searchFpValue === '') {
        urlResult.searchParams.set('fp', fpCache);
        callback({ redirectURL: urlResult.toString() });

        return;
      }
    }

    callback({});
  });
}

export default toutiaoRequest;