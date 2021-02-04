import { useState, useEffect, ReactElement, Dispatch as D, SetStateAction as S, MouseEvent } from 'react';
import { Empty, Button } from 'antd';
import * as dayjs from 'dayjs';
import style from './qrcode.sass';
import { requestQrcode, requestQrcodeCheck, requestLogin, requestCrossDomainUrl } from './services/WeiboLogin';
import type { QrcodeImage, QrcodeCheck, LoginReturn } from './services/interface';

let qrcodeLoginTimer: NodeJS.Timeout | null = null; // 轮循，判断是否登陆
let qrid: string;

/* 微博二维码 */
function Qrcode(props: {}): ReactElement {
  const [imageData, setImageData]: [string | undefined, D<S<string | undefined>>] = useState(undefined); // 二维码

  // 登陆成功
  async function loginSuccess(alt: string): Promise<void> {
    const resLogin: LoginReturn = await requestLogin(alt);
    const resCookie: string[] = await requestCrossDomainUrl(resLogin.crossDomainUrlList[resLogin.crossDomainUrlList.length - 1]);
    const cookie: string = resCookie.map((o: string): string => o.split(/;\s*/)[0]).join('; ');
  }

  // 判断是否登陆
  async function qrcodeLoginCheck(): Promise<void> {
    try {
      const res: QrcodeCheck = await requestQrcodeCheck(qrid);

      if (Number(res.retcode) === 20000000) {
        loginSuccess(res.data.alt); // 登陆成功
      }
    } catch (err) {
      console.error(err);
    }

    qrcodeLoginTimer = setTimeout(qrcodeLoginCheck, 1_000);
  }

  // 生成二维码
  async function createQrcode(): Promise<void> {
    if (qrcodeLoginTimer !== null) {
      clearTimeout(qrcodeLoginTimer);
    }

    const res: QrcodeImage = await requestQrcode();

    qrid = res.data.qrid;
    setImageData(`https:${ res.data.image }`);
    qrcodeLoginTimer = setTimeout(qrcodeLoginCheck, 1_000);
  }

  // 重新生成二维码
  function handleResetCreateQrcodeClick(event: MouseEvent<HTMLButtonElement>): void {
    createQrcode();
  }

  useEffect(function(): void {
    createQrcode();
  }, []);

  return (
    <div className={ style.content }>
      <div className={ style.qrcodeBox }>
        { imageData ? <img src={ imageData } /> : <Empty description={ false } /> }
      </div>
      <Button className={ style.resetBtn } onClick={ handleResetCreateQrcodeClick }>刷新二维码</Button>
    </div>
  );
}

export default Qrcode;