import { ipcRenderer, type Cookie, type IpcRendererEvent } from 'electron';
import { useEffect, useCallback, type ReactElement, type MouseEvent } from 'react';
import * as PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Button, Alert, Space, App } from 'antd';
import type { useAppProps } from 'antd/es/app/context';
import * as dayjs from 'dayjs';
import { requestUid, requestUserInfo, type UserInfo } from '@48tools-api/weibo/login';
import { WeiboLoginChannel } from '@48tools/main/src/channelEnum';
import { IDBSaveAccount } from '../reducers/weiboLogin';

/* 打开微博窗口 */
function OpenWeiboWindow(props: { onCancel?: Function }): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const { message: messageApi }: useAppProps = App.useApp();

  // 监听是否登陆
  const handleWeiboLoginCookieListener: (event: IpcRendererEvent, cookies: Array<Cookie>) => Promise<void>
    = useCallback(async function(event: IpcRendererEvent, cookies: Array<Cookie>): Promise<void> {
      const subIndex: number = cookies.findIndex((o: Cookie): boolean => o.name === 'SUB');

      if (subIndex >= 0) {
        const cookieStr: string = cookies.map((o: Cookie): string => `${ o.name }=${ o.value }`).join('; ');
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
      } else {
        messageApi.error('Cookie获取失败！');
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
    <div className="mb-[16px]">
      <Space size={ 8 }>
        <Alert message="新窗口登陆完毕后关闭窗口，完成登陆。" />
        <Button type="primary" onClick={ handleLoginWeiboClick }>微博登陆</Button>
      </Space>
    </div>
  );
}

OpenWeiboWindow.propTypes = {
  onCancel: PropTypes.func // 关闭弹出层的回调函数
};

export default OpenWeiboWindow;