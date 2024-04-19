import { ipcRenderer, type Cookie, type IpcRendererEvent } from 'electron';
import { useState, useEffect, useCallback, type ReactElement, type MouseEvent, type Dispatch as D, type SetStateAction as S } from 'react';
import * as PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Button, Alert, Space, App, Modal, Form, Input, type FormInstance } from 'antd';
import type { useAppProps } from 'antd/es/app/context';
import * as dayjs from 'dayjs';
import { requestUid, requestUserInfo, type UserInfo } from '@48tools-api/weibo/login';
import { WeiboLoginChannel } from '@48tools/main/src/channelEnum';
import type { PromiseWithResolvers } from '@48tools-types/ECMAScript';
import { IDBSaveAccount, type WeiboLoginInitialState } from '../reducers/weiboLogin';
import { weiboLoginSelector } from '../reducers/selectors';
import type { WeiboAccount } from '../../../commonTypes';

let waitInputSPromise: PromiseWithResolvers<string | undefined> | undefined = undefined;

/* 打开微博窗口 */
function OpenWeiboWindow(props: { onCancel?: Function }): ReactElement {
  const { accountList }: WeiboLoginInitialState = useSelector(weiboLoginSelector);
  const dispatch: Dispatch = useDispatch();
  const [inputSOpen, setInputSOpen]: [boolean, D<S<boolean>>] = useState(false);
  const { message: messageApi }: useAppProps = App.useApp();
  const [form]: [FormInstance] = Form.useForm();

  // 输入s
  function handleInputSOkClick(event: MouseEvent): void {
    waitInputSPromise!.resolve(form.getFieldValue('s'));
    setInputSOpen(false);
  }

  // 监听是否登陆
  const handleWeiboLoginCookieListener: (event: IpcRendererEvent, cookies: Array<Cookie>) => Promise<void>
    = useCallback(async function(event: IpcRendererEvent, cookies: Array<Cookie>): Promise<void> {
      const subIndex: number = cookies.findIndex((o: Cookie): boolean => o.name === 'SUB');

      if (subIndex < 0) {
        messageApi.error('Cookie获取失败！');

        return;
      }

      const cookieStr: string = cookies.map((o: Cookie): string => `${ o.name }=${ o.value }`).join('; ');
      const uid: string | undefined = await requestUid(cookieStr);

      if (!uid) {
        messageApi.error('账号的uid获取失败！');

        return;
      }

      const resUserInfo: UserInfo = await requestUserInfo(uid, cookieStr);

      // 等待输入s
      const oldWeiboAccount: WeiboAccount | undefined = accountList.find((o: WeiboAccount): boolean => o.id === uid);

      if (oldWeiboAccount?.s && !/^\s*$/.test(oldWeiboAccount.s)) {
        form.setFieldValue('s', oldWeiboAccount.s);
      }

      waitInputSPromise = Promise.withResolvers<string | undefined>();
      setInputSOpen(true);

      const sValue: string | undefined = await waitInputSPromise.promise;

      waitInputSPromise = undefined;
      form.resetFields();

      // 保存账号
      await dispatch(IDBSaveAccount({
        data: {
          id: uid,
          username: resUserInfo.data.user.screen_name ?? uid,
          cookie: cookieStr,
          lastLoginTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          s: sValue
        }
      }));
      messageApi.success('登陆成功！');
      props?.onCancel?.();
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
      <Modal open={ inputSOpen }
        width={ 430 }
        centered={ true }
        closable={ false }
        mask={ false }
        maskClosable={ false }
        destroyOnClose={ true }
        footer={ <Button type="primary" onClick={ handleInputSOkClick }>下一步</Button> }
      >
        <Form form={ form }>
          <Form.Item name="s" label='输入抓包得来的"s"参数（可跳过）'>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

OpenWeiboWindow.propTypes = {
  onCancel: PropTypes.func // 关闭弹出层的回调函数
};

export default OpenWeiboWindow;