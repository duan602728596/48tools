import { promisify } from 'node:util';
import { Fragment, useMemo, useEffect, useRef, type ReactElement, type RefObject, type MouseEvent } from 'react';
import * as PropTypes from 'prop-types';
import { message, Button, Alert } from 'antd';
import { toCanvas } from 'qrcode/lib/browser';
import * as dayjs from 'dayjs';
import style from './qrcode.sass';
import { requestLoginUrl, requestLoginInfo } from './services/bilibiliLogin';
import { warningNativeMessage } from '../../utils/remote/nativeMessage';
import type { UseMessageReturnType } from '../../commonTypes';
import type { LoginUrl, LoginInfo } from './services/interface';

const toCanvasPromise: (e: HTMLCanvasElement, u: string) => Promise<void> = promisify(toCanvas);

export const BILIBILI_COOKIE_KEY: string = 'BILIBILI_COOKIE';
let oauthKey: string | null = null;
let loginInfoTimer: NodeJS.Timeout | null = null;
let resetCreateQrcodeTimer: NodeJS.Timeout | null = null;

export interface BilibiliCookie {
  time: string;
  cookie: string;
}

/**
 * 二维码扫描、刷新等
 * @param { Function } props.onCancel: 关闭弹出层的方法
 */
function Qrcode(props: { onCancel: Function }): ReactElement {
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const canvasRef: RefObject<HTMLCanvasElement> = useRef(null);
  const bilibiliCookie: BilibiliCookie | null = useMemo(function(): BilibiliCookie | null {
    const info: string | null = localStorage.getItem(BILIBILI_COOKIE_KEY);

    return info ? JSON.parse(info) : null;
  }, []);

  // 清除cookie
  function handleClearBilibiliCookieClick(event: MouseEvent): void {
    localStorage.removeItem(BILIBILI_COOKIE_KEY);
    warningNativeMessage('B站Cookie已清除，请重新登陆。');
  }

  // 轮询，判断接口返回的值
  async function getLoginInfo(): Promise<void> {
    const [res, cookieArr]: [LoginInfo, Array<string>] = await requestLoginInfo(oauthKey!);

    if (res.status) {
      const time: string = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const cookie: string = cookieArr.map((o: string): string => o.split(/;\s*/)[0]).join('; ');

      localStorage.setItem(BILIBILI_COOKIE_KEY, JSON.stringify({ time, cookie }));
      messageApi.success('登陆成功！');
      props.onCancel();
    } else {
      loginInfoTimer = setTimeout(getLoginInfo, 1_000);
    }
  }

  // 生成二维码
  async function createQrcode(): Promise<void> {
    if (!canvasRef.current) {
      return;
    }

    if (loginInfoTimer !== null) {
      clearTimeout(loginInfoTimer);
    }

    const loginUrlRes: LoginUrl = await requestLoginUrl();

    await toCanvasPromise(canvasRef.current, loginUrlRes.data.url);
    oauthKey = loginUrlRes.data.oauthKey;
    loginInfoTimer = setTimeout(getLoginInfo, 1_000);
    resetCreateQrcodeTimer = setTimeout(createQrcode, 120_000);
  }

  // 重新生成二维码
  function handleResetCreateQrcodeClick(event: MouseEvent): void {
    createQrcode();
  }

  useEffect(function(): () => void {
    createQrcode();

    return function(): void {
      if (loginInfoTimer !== null) {
        clearTimeout(loginInfoTimer);
      }

      if (resetCreateQrcodeTimer !== null) {
        clearTimeout(resetCreateQrcodeTimer);
      }
    };
  }, []);

  return (
    <Fragment>
      <Alert className={ style.alert } type="info" message="下载付费直播或者大会员专属视频时需要登陆。" />
      <div className="mt-0 mb-[24px] mx-auto w-[196px] h-[196px]">
        <canvas ref={ canvasRef } width={ 196 } height={ 196 } />
      </div>
      <div className="text-center">
        <Button type="text" danger={ true } onClick={ handleClearBilibiliCookieClick }>清除Cookie</Button>
        <Button className="ml-[16px]" type="text" onClick={ handleResetCreateQrcodeClick }>刷新二维码</Button>
        <p className="mt-[8px]">上次登陆时间：{ bilibiliCookie?.time ?? '无' }</p>
      </div>
      { messageContextHolder }
    </Fragment>
  );
}

Qrcode.propTypes = {
  onCancel: PropTypes.func
};

export default Qrcode;