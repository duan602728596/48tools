import { ipcRenderer, type Cookie, type IpcRendererEvent } from 'electron';
import { Fragment, useEffect, useCallback, type ReactElement, type MouseEvent } from 'react';
import * as PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Button, Alert, Space, message, Divider } from 'antd';
import type { UseMessageReturnType } from '@48tools-types/antd';
import * as dayjs from 'dayjs';
import { requestUid, requestUserInfo, type UserInfo } from '@48tools-api/weibo/login';
import { WeiboLoginChannel } from '@48tools/main/src/channelEnum';
import { IDBSaveAccount } from '../reducers/weiboLogin';
import UserBrowserLogin from './UserBrowserLogin';

/* 打开微博窗口 */
function OpenWeiboWindow(props: { onCancel?: Function }): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();

  // 监听是否登陆
  const handleWeiboLoginCookieListener: (event: IpcRendererEvent, cookies: Array<Cookie>) => Promise<void>
    = useCallback(async function(event: IpcRendererEvent, cookies: Array<Cookie>): Promise<void> {
      const ssoLoginIndex: number = cookies.findIndex((o: Cookie): boolean => o.name === 'SSOLoginState'),
        subIndex: number = cookies.findIndex((o: Cookie): boolean => o.name === 'SUB');

      if (ssoLoginIndex >= 0 && subIndex >= 0) {
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
          messageApi.success('登陆成功！');
          props?.onCancel?.();
        } else {
          messageApi.error('账号的uid获取失败！');
        }
      }
    }, []);

  // 登陆
  function handleLoginWeiboClick(event: MouseEvent): void {
    ipcRenderer.send(WeiboLoginChannel.WeiboLogin);
  }

  useEffect(function(): () => void {
    ipcRenderer.on(WeiboLoginChannel.WeiboLoginCookie, handleWeiboLoginCookieListener);

    return function(): void {
      ipcRenderer.removeListener(WeiboLoginChannel.WeiboLoginCookie, handleWeiboLoginCookieListener);
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