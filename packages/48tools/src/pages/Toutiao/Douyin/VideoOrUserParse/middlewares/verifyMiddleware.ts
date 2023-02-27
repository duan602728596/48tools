import { setTimeout } from 'node:timers/promises';
import { ipcRenderer } from 'electron';
import * as toutiaosdk from '../../../sdk/toutiaosdk';
import douyinCookieCache from '../../DouyinCookieCache';
import type { GetVideoUrlOnionContext, VerifyData } from '../../../types';
import { requestDouyinVideo, requestDouyinUser, type DouyinVideo } from '../../../services/douyin';

function parseVerifyData(html: string): VerifyData {
  const verifyDataArr: string[] = html.split(/\n/);
  const verifyData: string | undefined = verifyDataArr.find((o: string): boolean => /const\s+verify_data\s+=\s+/i.test(o));
  const verifyDataJson: VerifyData = JSON.parse(verifyData!.replace(/const\s+verify_data\s+=\s+/i, ''));

  return verifyDataJson;
}

export function verifyCookie(html: string, cookie: string): Promise<string> {
  return new Promise(async (resolve: Function, reject: Function): Promise<void> => {
    const verifyDataJson: VerifyData = parseVerifyData(html);

    ipcRenderer.send('toutiao-fp', verifyDataJson.fp); // 将fp发送到主线程
    await setTimeout(2_000);
    await toutiaosdk.captcha('init', [{
      commonOptions: { aid: 6383, iid: '0', did: '0' },
      captchaOptions: {
        hideCloseBtn: true,
        showMode: 'mask',
        successCb(): void {
          resolve(`${ cookie } s_v_web_id=${ verifyDataJson.fp };`); // 需要的完整的cookie
        }
      }
    }]);
    await toutiaosdk.captcha('render', [{ verify_data: verifyDataJson }]);
  });
}

/* 验证码中间页 */
async function verifyMiddleware(ctx: GetVideoUrlOnionContext, next: Function): Promise<void> {
  if (!(ctx.html && ctx.html.includes('验证码中间页'))) {
    next();

    return;
  }

  try {
    const douyinCompleteCookie: string = await verifyCookie(ctx.html, ctx.cookie!);
    let res: DouyinVideo | undefined;

    if (ctx.type === 'video') {
      res = await requestDouyinVideo((u: string) => `${ u }${ ctx.id }`, douyinCompleteCookie);
    }

    if (ctx.type === 'user') {
      res = await requestDouyinUser((u: string) => `${ u }${ ctx.id }`, douyinCompleteCookie);
    }

    if (res && res.type === 'html') {
      ctx.html = res.body;
    }

    douyinCookieCache.setCookie(douyinCompleteCookie);
    ctx.cookie = douyinCompleteCookie;
    next();
  } catch (err) {
    console.error(err);
    ctx.messageApi.error('验证码获取失败！');
    ctx.setUrlLoading(false);
  }
}

export default verifyMiddleware;