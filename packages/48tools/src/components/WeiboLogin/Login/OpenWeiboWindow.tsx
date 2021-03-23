import { ipcRenderer, Cookie, IpcRendererEvent } from 'electron';
import { useEffect, useCallback, ReactElement, MouseEvent } from 'react';
import * as PropTypes from 'prop-types';
import type { Dispatch } from 'redux';
import { useDispatch } from 'react-redux';
import { Button, Alert, Space, message } from 'antd';
import { findIndex } from 'lodash-es';
import * as dayjs from 'dayjs';
import style from './openWeiboWindow.sass';
import { requestUid, requestUserInfo } from '../services/WeiboLogin';
import { idbSaveAccount } from '../reducers/weiboLogin';
import PuppeteerLogin from './PuppeteerLogin';
import type { UserInfo } from '../services/interface';

/* 打开微博窗口 */
function OpenWeiboWindow(props: { onCancel: Function }): ReactElement {
  const dispatch: Dispatch = useDispatch();

  // 监听是否登陆
  const handleWeiboLoginCookieListener: (event: IpcRendererEvent, cookies: Array<Cookie>) => Promise<void>
    = useCallback(async function(event: IpcRendererEvent, cookies: Array<Cookie>): Promise<void> {
      const alfIndex: number = findIndex(cookies, { name: 'ALF' }),
        ssoLoginIndex: number = findIndex(cookies, { name: 'SSOLoginState' }),
        subIndex: number = findIndex(cookies, { name: 'SUB' });

      if (alfIndex >= 0 && ssoLoginIndex >= 0 && subIndex >= 0) {
        const cookieStr: string = `SUB=${ cookies[subIndex].value }`;
        const uid: string | undefined = await requestUid(cookieStr);

        if (uid) {
          const resUserInfo: UserInfo = await requestUserInfo(uid, cookieStr);

          await dispatch(idbSaveAccount({
            data: {
              id: uid,
              username: resUserInfo.data.user.name,
              cookie: cookieStr,
              lastLoginTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
            }
          }));
          props.onCancel();
          message.success('登陆成功！');
        } else {
          message.error('账号的uid获取失败！');
        }
      }
    }, []);

  // 登陆
  function handleLoginWeiboClick(event: MouseEvent<HTMLButtonElement>): void {
    ipcRenderer.send('weibo-login');
  }

  useEffect(function(): () => void {
    ipcRenderer.on('weibo-login-cookie', handleWeiboLoginCookieListener);

    return function(): void {
      ipcRenderer.removeListener('weibo-login-cookie', handleWeiboLoginCookieListener);
    };
  }, []);

  return (
    <div className={ style.content }>
      <Space size={ 16 }>
        <Alert message="新窗口登陆完毕后关闭窗口，完成登陆。建议扫码登陆。" />
        <Button onClick={ handleLoginWeiboClick }>微博登陆</Button>
        <PuppeteerLogin onCancel={ props.onCancel } />
      </Space>
    </div>
  );
}

OpenWeiboWindow.propTypes = {
  onCancel: PropTypes.func // 关闭弹出层的回调函数
};

export default OpenWeiboWindow;