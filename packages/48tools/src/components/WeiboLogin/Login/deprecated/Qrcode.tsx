import { useState, useEffect, type ReactElement, type Dispatch as D, type SetStateAction as S, type MouseEvent } from 'react';
import * as PropTypes from 'prop-types';
import type { Dispatch } from 'redux';
import { useDispatch } from 'react-redux';
import { Empty, Button, message } from 'antd';
import * as dayjs from 'dayjs';
import style from './qrcode.sass';
import { idbSaveAccount } from '../../reducers/weiboLogin';
import {
  requestQrcode,
  requestQrcodeCheck,
  requestLoginV2,
  requestCrossDomainUrl,
  requestUserInfo
} from '../../services/WeiboLogin';
import type { QrcodeImage, QrcodeCheck, LoginReturn, UserInfo } from '../../services/interface';

let qrcodeLoginTimer: NodeJS.Timeout | null = null; // 轮循，判断是否登陆
let qrid: string | null = null;

/**
 * @deprecated
 * 微博二维码
 */
function Qrcode(props: { onCancel: Function }): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [imageData, setImageData]: [string | undefined, D<S<string | undefined>>] = useState(undefined); // 二维码

  // 登陆成功
  async function loginSuccess(alt: string): Promise<void> {
    // 缓存所有的cookie
    const resLogin: LoginReturn = await requestLoginV2(alt);
    const cookie: string = await requestCrossDomainUrl(resLogin.crossDomainUrlList[3]);
    const resUserInfo: UserInfo = await requestUserInfo(resLogin.uid, cookie);

    await dispatch(idbSaveAccount({
      data: {
        id: resLogin.uid,
        username: resUserInfo.data.user.screen_name ?? resLogin.uid,
        cookie,
        lastLoginTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
    }));
    props.onCancel();
    message.success('登陆成功！');
  }

  // 判断是否登陆
  async function qrcodeLoginCheck(): Promise<void> {
    try {
      const res: QrcodeCheck = await requestQrcodeCheck(qrid!);

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

  useEffect(function(): () => void {
    createQrcode();

    return function(): void {
      if (qrcodeLoginTimer !== null) {
        clearTimeout(qrcodeLoginTimer);
      }

      qrid = null;
    };
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

Qrcode.propTypes = {
  onCancel: PropTypes.func // 关闭弹出层的回调函数
};

export default Qrcode;