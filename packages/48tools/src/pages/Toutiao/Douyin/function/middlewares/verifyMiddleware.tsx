import { setTimeout } from 'node:timers/promises';
import { ipcRenderer } from 'electron';
import type { ReactElement, MouseEvent } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Button } from 'antd';
import { CloseCircleFilled as IconCloseCircleFilled } from '@ant-design/icons';
import * as toutiaosdk from '../../../sdk/toutiaosdk';
import { douyinCookie } from '../DouyinCookieStore';
import { DouyinUrlType } from '../parser';
import { requestDouyinVideo, requestDouyinUser } from '../../../services/douyin';
import type { GetVideoUrlOnionContext, VerifyData } from '../../../types';
import type { DouyinHtmlResponseType } from '../../../services/interface';

let closeBtnElement: HTMLElement | null = null;
let closeBtnRoot: Root | null = null;

/* 销毁关闭按钮 */
function closeCaptchaDestroy(): void {
  if (closeBtnElement) {
    document.body.removeChild(closeBtnElement);
    closeBtnElement = null;
  }

  if (closeBtnRoot) {
    closeBtnRoot.unmount();
    closeBtnRoot = null;
  }
}

/* 显示关闭按钮 */
function closeCaptchaDisplay(resolve: Function): void {
  closeBtnElement = document.createElement('div');
  document.body.appendChild(closeBtnElement);
  closeBtnRoot = createRoot(closeBtnElement);

  // 关闭验证码
  function handleCaptchaCloseClick(event: MouseEvent): void {
    const captchaContainer: HTMLElement | null = document.getElementById('captcha_container');

    captchaContainer && document.body.removeChild(captchaContainer);
    closeCaptchaDestroy();
    resolve();
  }

  function Close(props: {}): ReactElement {
    return (
      <Button className="absolute z-[150000] top-[50%] left-[50%] mt-[-170px] ml-[88px]"
        type="primary"
        danger={ true }
        icon={ <IconCloseCircleFilled /> }
        onClick={ handleCaptchaCloseClick }
      >
        关闭
      </Button>
    );
  }

  closeBtnRoot.render(<Close />);
}

/* 解析verify_data */
function parseVerifyData(html: string): VerifyData {
  const verifyDataArr: string[] = html.split(/\n/);
  const verifyData: string | undefined = verifyDataArr.find((o: string): boolean => /const\s+verify_data\s+=\s+/i.test(o));
  const verifyDataJson: VerifyData = JSON.parse(verifyData!.replace(/const\s+verify_data\s+=\s+/i, ''));

  return verifyDataJson;
}

/**
 * 弹出验证码并获取cookie
 * @param { string } html: 验证码中间页的html
 * @param { string | undefined } cookie: 显示的cookie
 * @return { string | undefined } 返回cookie或关闭时返回undefined
 */
export function verifyCookie(html: string, cookie: string | undefined): Promise<string | undefined> {
  return new Promise(async (resolve: Function, reject: Function): Promise<void> => {
    const verifyDataJson: VerifyData = parseVerifyData(html);

    ipcRenderer.send('toutiao-fp', verifyDataJson.fp); // 将fp发送到主线程
    await setTimeout(2_000);

    // 监听验证码的出现
    let mutationObserver: MutationObserver | null = new MutationObserver((mutations: MutationRecord[]): void => {
      if (
        mutations.some((mutation: MutationRecord) =>
          mutation?.addedNodes?.length
            ? Array.from(mutation.addedNodes).some((node: Node) => node['id'] === 'captcha_container')
            : false)
      ) {
        closeCaptchaDisplay(resolve);
        mutationObserver!.disconnect();
        mutationObserver = null;
      }
    });

    mutationObserver.observe(document.body, { childList: true });
    await toutiaosdk.captcha('init', [{
      commonOptions: { aid: 6383, iid: '0', did: '0' },
      captchaOptions: {
        hideCloseBtn: true,
        showMode: 'mask',
        successCb(): void {
          closeCaptchaDestroy();
          resolve(`s_v_web_id=${ verifyDataJson.fp };`); // 需要的完整的cookie
        }
      }
    }]);
    await toutiaosdk.captcha('render', [{ verify_data: verifyDataJson }]);
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
    const verifyCookieValue: string | undefined = await verifyCookie(ctx.html, douyinCookie.toString());

    if (!verifyCookieValue) {
      ctx.setUrlLoading(false);

      return;
    }

    douyinCookie.set(verifyCookieValue);

    // 获取数据
    let res: DouyinHtmlResponseType | undefined;

    if (ctx.parseResult.type === DouyinUrlType.Video) {
      res = await requestDouyinVideo((u: string) => `${ u }${ ctx.parseResult.id }`, douyinCookie.toString());
    }

    if (ctx.parseResult.type === DouyinUrlType.User) {
      res = await requestDouyinUser((u: string) => `${ u }${ ctx.parseResult.id }`, douyinCookie.toString());
    }

    if (res && res.type === 'html') {
      ctx.html = res.html;
    }

    next();
  } catch (err) {
    console.error(err);
    ctx.messageApi.error('验证码获取失败！');
    ctx.setUrlLoading(false);
  }
}

export default verifyMiddleware;