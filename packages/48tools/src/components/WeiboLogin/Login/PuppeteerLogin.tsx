import * as puppeteer from 'puppeteer-core';
import type { Browser, Page, Protocol } from 'puppeteer-core';
import type { ReactElement, MouseEvent } from 'react';
import * as PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Button, message } from 'antd';
import * as dayjs from 'dayjs';
import { requestUid, requestUserInfo } from '../services/WeiboLogin';
import { IDBSaveAccount } from '../reducers/weiboLogin';
import { errorNativeMessage } from '../../../utils/nativeMessage';
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
function PuppeteerLogin(props: { onCancel: Function }): ReactElement {
  const dispatch: Dispatch = useDispatch();

  // 打开无头浏览器
  async function handleLoginClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    if (browser !== null) return;

    const executablePath: string | null = localStorage.getItem('PUPPETEER_EXECUTABLE_PATH');

    if (!(executablePath && !/^\s*$/.test(executablePath))) {
      errorNativeMessage('请先配置无头浏览器！');

      return;
    }

    try {
      browser = await puppeteer.launch({
        headless: false,
        executablePath,
        defaultViewport: {
          width: 800,
          height: 600
        }
      });

      // 先去微博登陆页
      const page: Page = await browser.newPage();

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
      const cookies: Array<Protocol.Network.Cookie> = await page.cookies('https://weibo.com');

      await page.close();

      const subCookie: Protocol.Network.Cookie | undefined
        = cookies.find((o: Protocol.Network.Cookie): boolean => o.name === 'SUB');

      if (subCookie) {
        const cookieStr: string = `SUB=${ subCookie.value }`;
        const uid: string | undefined = await requestUid(cookieStr);

        if (uid) {
          const resUserInfo: UserInfo = await requestUserInfo(uid, cookieStr);

          await dispatch(IDBSaveAccount({
            data: {
              id: uid,
              username: resUserInfo.data.user.screen_name ?? uid,
              cookie: cookieStr,
              lastLoginTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
            }
          }));
          props.onCancel();
          message.success('登陆成功！');
        } else {
          message.error('账号的uid获取失败！');
        }
      } else {
        message.error('没有获取到Cookie！');
      }
    } catch (err) {
      console.error(err);
      browser?.close();
      browser = null;
    }
  }

  return <Button type="primary" onClick={ handleLoginClick }>无头浏览器登陆</Button>;
}

PuppeteerLogin.propTypes = {
  onCancel: PropTypes.func // 关闭弹出层的回调函数
};

export default PuppeteerLogin;