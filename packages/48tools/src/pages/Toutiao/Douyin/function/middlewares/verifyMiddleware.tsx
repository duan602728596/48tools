import { ipcRenderer, type IpcRendererEvent, type Cookie } from 'electron';
import { DouyinCookieChannel } from '@48tools/main/src/channelEnum';
import { douyinCookie } from '../../../../../utils/toutiao/DouyinCookieStore';
import type { GetVideoUrlOnionContext } from '../../../types';

/* 在新窗口弹出验证码并获取cookie */
export function verifyCookieInNewWindow(): Promise<string | undefined> {
  return new Promise((resolve: Function, reject: Function): void => {
    ipcRenderer.once(DouyinCookieChannel.DouyinCookieResponse, function(event: IpcRendererEvent, cookie: Array<Cookie>): void {
      if (cookie?.length) {
        resolve(cookie.filter((o: Cookie): boolean => o.name !== '')
          .map((o: Cookie): string => `${ o.name }=${ o.value }`).join('; '));
      } else {
        resolve(undefined);
      }
    });

    ipcRenderer.send(DouyinCookieChannel.DouyinCookie);
  });
}

/* 验证码中间页 */
async function verifyMiddleware(ctx: GetVideoUrlOnionContext, next: Function): Promise<void> {
  if (ctx.data || !ctx?.html?.includes('验证码中间页')) {
    next();

    return;
  }

  try {
    // 验证码获取到的cookie
    const verifyCookieValue: string | undefined = await verifyCookieInNewWindow();

    if (!verifyCookieValue) {
      ctx.setUrlLoading(false);

      return;
    }

    douyinCookie.set(verifyCookieValue);
    next();
  } catch (err) {
    console.error(err);
    ctx.messageApi.error('验证码获取失败！');
    ctx.setUrlLoading(false);
  }
}

export default verifyMiddleware;