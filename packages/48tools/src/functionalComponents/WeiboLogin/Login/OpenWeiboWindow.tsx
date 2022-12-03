import { ipcRenderer, type Cookie, type IpcRendererEvent } from 'electron';
import { Fragment, useEffect, useCallback, type ReactElement, type MouseEvent } from 'react';
import * as PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Button, Alert, Space, message, Divider } from 'antd';
import * as dayjs from 'dayjs';
import { requestUid, requestUserInfo } from '../services/WeiboLogin';
import { IDBSaveAccount } from '../reducers/weiboLogin';
import UserBrowserLogin from './UserBrowserLogin';
import type { UseMessageReturnType } from '../../../types';
import type { UserInfo } from '../services/interface';

/* 打开微博窗口 */
function OpenWeiboWindow(props: { onCancel: Function }): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();

  // 监听是否登陆
  const handleWeiboLoginCookieListener: (event: IpcRendererEvent, cookies: Array<Cookie>) => Promise<void>
    = useCallback(async function(event: IpcRendererEvent, cookies: Array<Cookie>): Promise<void> {
      const alfIndex: number = cookies.findIndex((o: Cookie): boolean => o.name === 'ALF'),
        ssoLoginIndex: number = cookies.findIndex((o: Cookie): boolean => o.name === 'SSOLoginState'),
        subIndex: number = cookies.findIndex((o: Cookie): boolean => o.name === 'SUB');

      if (alfIndex >= 0 && ssoLoginIndex >= 0 && subIndex >= 0) {
        const cookieStr: string = `SUB=${ cookies[subIndex].value }`;
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
          messageApi.success('登陆成功！');
        } else {
          messageApi.error('账号的uid获取失败！');
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
    <Fragment>
      <div className="mb-[16px]">
        <Space size={ 8 }>
          <Alert message="新窗口登陆完毕后关闭窗口，完成登陆。建议无头浏览器登陆。" />
          <Button onClick={ handleLoginWeiboClick }>微博登陆</Button>
          <Divider type="vertical" />
          <UserBrowserLogin onCancel={ props.onCancel } />
        </Space>
      </div>
      { messageContextHolder }
    </Fragment>
  );
}

OpenWeiboWindow.propTypes = {
  onCancel: PropTypes.func // 关闭弹出层的回调函数
};

export default OpenWeiboWindow;