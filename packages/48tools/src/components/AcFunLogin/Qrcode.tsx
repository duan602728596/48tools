import type { CancelableRequest, Response as GotResponse } from 'got';
import {
  useState,
  useEffect,
  useMemo,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent
} from 'react';
import * as PropTypes from 'prop-types';
import { Button, Empty, message } from 'antd';
import * as dayjs from 'dayjs';
import { requestPcDirectQr, requestPcDirectScanResult, requestPcDirectAcceptResult } from './services/acfunLogin';
import { warningNativeMessage } from '../../utils/remote/nativeMessage';
import type { PcDirectQr, ScanResult, AcceptResult } from './services/interface';

export const ACFUN_COOKIE_KEY: string = 'ACFUN_COOKIE';
let scanResultRequest: CancelableRequest<GotResponse<ScanResult>> | null = null,
  acceptResultRequest: CancelableRequest<GotResponse<AcceptResult>> | null = null;
let resetCreateQrcodeTimer: NodeJS.Timeout | null = null;

export interface AcFunCookie {
  time: string;
  cookie: string;
}

function clearData(): void {
  if (scanResultRequest) {
    scanResultRequest.cancel();
    scanResultRequest = null;
  }

  if (acceptResultRequest) {
    acceptResultRequest.cancel();
    acceptResultRequest = null;
  }

  if (resetCreateQrcodeTimer) {
    clearTimeout(resetCreateQrcodeTimer);
    resetCreateQrcodeTimer = null;
  }
}

/* 生成A站二维码 */
function Qrcode(props: { onCancel: Function }): ReactElement {
  const [imageData, setImageData]: [string | undefined, D<S<string | undefined>>] = useState(undefined); // 二维码
  const acFunCookie: AcFunCookie | null = useMemo(function(): AcFunCookie | null {
    const info: string | null = localStorage.getItem(ACFUN_COOKIE_KEY);

    return info ? JSON.parse(info) : null;
  }, []);

  // 清除cookie
  function handleClearAcFunCookieClick(event: MouseEvent<HTMLButtonElement>): void {
    localStorage.removeItem(ACFUN_COOKIE_KEY);
    warningNativeMessage('A站Cookie已清除，请重新登陆。');
  }

  // 生成二维码
  async function createQrcode(): Promise<void> {
    try {
      clearData();
      resetCreateQrcodeTimer = setTimeout(createQrcode, 90_000); // 刷新二维码

      // 获取二维码图片
      const resQr: PcDirectQr = await requestPcDirectQr();

      setImageData(`data:image/png;base64,${ resQr.imageData }`);

      // 等待二维码扫描确认（阻塞）
      scanResultRequest = requestPcDirectScanResult(resQr.qrLoginToken, resQr.qrLoginSignature);

      const resScanResult: ScanResult = (await scanResultRequest).body;

      scanResultRequest = null;

      if (resScanResult.result !== 0) {
        message.error('登陆失败！请刷新后重新登陆！');

        return;
      }

      // 扫描登陆成功
      acceptResultRequest = requestPcDirectAcceptResult(resQr.qrLoginToken, resScanResult.qrLoginSignature);

      const resAcceptResult: GotResponse<AcceptResult> = await acceptResultRequest;

      acceptResultRequest = null;

      if (resAcceptResult.body.result === 0) {
        const time: string = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const cookie: string = resAcceptResult.headers['set-cookie']!
          .map((o: string): string => o.split(/;\s*/)[0]).join('; ');

        localStorage.setItem(ACFUN_COOKIE_KEY, JSON.stringify({ time, cookie }));
        message.success('登陆成功！');
        props.onCancel();
      } else {
        message.error('登陆失败！请刷新后重新登陆！');
      }
    } catch { /* noop */ }
  }

  // 重新生成二维码
  function handleResetCreateQrcodeClick(event: MouseEvent<HTMLButtonElement>): void {
    createQrcode();
  }

  useEffect(function(): () => void {
    createQrcode();

    return function(): void {
      clearData();
    };
  }, []);

  return (
    <div className="h-[300px]">
      <div className="mt-0 mb-[24px] mx-auto w-[196px] h-[196px]">
        { imageData ? <img className="block w-full h-full" src={ imageData } /> : <Empty description={ false } /> }
      </div>
      <div className="text-center">
        <Button type="text" danger={ true } onClick={ handleClearAcFunCookieClick }>清除Cookie</Button>
        <Button className="ml-[16px]" type="text" onClick={ handleResetCreateQrcodeClick }>刷新二维码</Button>
        <p className="mt-[8px]">上次登陆时间：{ acFunCookie?.time ?? '无' }</p>
      </div>
    </div>
  );
}

Qrcode.propTypes = {
  onCancel: PropTypes.func
};

export default Qrcode;