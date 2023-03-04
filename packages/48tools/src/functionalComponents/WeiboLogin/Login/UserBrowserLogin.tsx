import type { Browser, BrowserContext, Page, Cookie } from 'playwright-core';
import { Fragment, type ReactElement, type MouseEvent } from 'react';
import * as PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Button, message } from 'antd';
import type { UseMessageReturnType } from '@48tools-types/antd';
import * as dayjs from 'dayjs';
import { getBrowser } from '../../../utils/utils';
import { requestUid, requestUserInfo } from '../services/weiboLogin';
import { IDBSaveAccount } from '../reducers/weiboLogin';
import { errorNativeMessage } from '../../../utils/remote/nativeMessage';
import type { UserInfo } from '../services/interface';

let browser: Browser | null = null;

/* 判断是否登陆成功（有cookie） */
function waitFunc(): boolean {
  const documentCookie: string = document.cookie;

  return documentCookie.indexOf('SUBP=') >= 0
    && documentCookie.indexOf('SSOLoginState=') >= 0
    && (documentCookie.indexOf('XSRF-TOKEN=') >= 0
      || documentCookie.indexOf('webim_unReadCount=') >= 0);
}

/* 无头浏览器登陆 */
function UserBrowserLogin(props: { onCancel?: Function }): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();

  // 打开无头浏览器
  async function handleLoginClick(event: MouseEvent): Promise<void> {
    if (browser !== null) return;

    const executablePath: string | null = localStorage.getItem('PUPPETEER_EXECUTABLE_PATH');

    if (!(executablePath && !/^\s*$/.test(executablePath))) {
      errorNativeMessage('请先配置无头浏览器！');

      return;
    }

    try {
      browser = await getBrowser(executablePath).launch({
        headless: false,
        executablePath,
        timeout: 0
      });
      const context: BrowserContext = await browser.newContext();

      // 先去微博登陆页
      const page: Page = await context.newPage();

      page.on('close', function(): void {
        browser?.close();
        browser = null;
      });

      await page.goto('https://passport.weibo.cn/signin/login?display=0&retcode=6102');
      await page.waitForFunction(waitFunc, { timeout: 0 });
      await page.waitForTimeout(1300);

      // 再跳转到微博首页
      await page.goto('https://weibo.com/');
      await page.waitForFunction(waitFunc, { timeout: 0 });
      await page.waitForTimeout(1300);

      // 获取cookies
      const cookies: Array<Cookie> = await context.cookies('https://weibo.com');

      await page.close();

      const subCookie: Cookie | undefined
        = cookies.find((o: Cookie): boolean => o.name === 'SUB');

      if (!subCookie) {
        messageApi.error('没有获取到Cookie！');

        return;
      }

      const cookieStr: string = `SUB=${ subCookie.value }`;
      const uid: string | undefined = await requestUid(cookieStr);

      if (!uid) {
        messageApi.error('账号的uid获取失败！');

        return;
      }

      const resUserInfo: UserInfo = await requestUserInfo(uid, cookieStr);

      await dispatch(IDBSaveAccount({
        data: {
          id: uid,
          username: resUserInfo.data.user.screen_name ?? uid,
          cookie: cookieStr,
          lastLoginTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }
      }));
      messageApi.success('登陆成功！');
      props?.onCancel?.();
    } catch (err) {
      console.error(err);
      browser?.close();
      browser = null;
    }
  }

  return (
    <Fragment>
      <Button type="primary" onClick={ handleLoginClick }>无头浏览器登陆</Button>
      { messageContextHolder }
    </Fragment>
  );
}

UserBrowserLogin.propTypes = {
  onCancel: PropTypes.func // 关闭弹出层的回调函数
};

export default UserBrowserLogin;