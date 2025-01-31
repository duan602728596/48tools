import { ipcRenderer, type Cookie, type IpcRendererEvent } from 'electron';
import { useState, useEffect, type ReactElement, type MouseEvent, type Dispatch as D, type SetStateAction as S } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { Button, Alert, Space, App, Modal, Form, Input, Divider, type FormInstance } from 'antd';
import type { useAppProps } from 'antd/es/app/context';
import * as dayjs from 'dayjs';
import { requestUid, requestUserInfo, type UserInfo } from '@48tools-api/weibo/login';
import { WeiboLoginChannel } from '@48tools/main/src/channelEnum';
import { IDBSaveAccount, type WeiboLoginInitialState } from '../reducers/weiboLogin';
import { weiboLoginSelector } from '../reducers/selectors';
import HelpButtonGroup from '../../../components/HelpButtonGroup/HelpButtonGroup';
import type { WeiboAccount } from '../../../commonTypes';

type AppCaptureValue = Partial<Pick<WeiboAccount, 's' | 'from' | 'c'>>;
let waitInputSPromise: PromiseWithResolvers<AppCaptureValue | undefined> | undefined = undefined;

function checkAndSetFormValue(form: FormInstance, oldWeiboAccount: WeiboAccount | undefined, keys: Array<string>): void {
  for (const key of keys) {
    if (oldWeiboAccount?.[key] && !/^\s*$/.test(oldWeiboAccount[key])) {
      form.setFieldValue(key, oldWeiboAccount[key]);
    }
  }
}

/* 打开微博窗口 */
function OpenWeiboWindow(props: { onCancel?: Function }): ReactElement {
  const { accountList }: WeiboLoginInitialState = useSelector(weiboLoginSelector);
  const dispatch: Dispatch = useDispatch();
  const [inputSOpen, setInputSOpen]: [boolean, D<S<boolean>>] = useState(false);
  const { message: messageApi }: useAppProps = App.useApp();
  const [form]: [FormInstance] = Form.useForm();

  // 提取url中的参数
  function handleExtractParamsFromUrlClick(event: MouseEvent): void {
    const demoUrl: string | undefined = form.getFieldValue('demoUrl');

    if (!demoUrl || /^\s*$/i.test(demoUrl)) return;

    const demoUrlParse: URL = new URL(demoUrl);

    form.setFieldsValue({
      s: demoUrlParse.searchParams.get('s'),
      from: demoUrlParse.searchParams.get('from'),
      c: demoUrlParse.searchParams.get('c')
    });
  }

  // 输入s
  function handleInputSOkClick(event: MouseEvent): void {
    waitInputSPromise!.resolve(form.getFieldsValue(['s', 'from', 'c']));
    setInputSOpen(false);
  }

  // 监听是否登陆
  async function handleWeiboLoginCookieListener(event: IpcRendererEvent, cookies: Array<Cookie>): Promise<void> {
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

    checkAndSetFormValue(form, oldWeiboAccount, ['s', 'from', 'c']);
    waitInputSPromise = Promise.withResolvers<AppCaptureValue | undefined>();
    setInputSOpen(true);

    const sValue: AppCaptureValue | undefined = await waitInputSPromise.promise;

    waitInputSPromise = undefined;
    form.resetFields();

    // 保存账号
    await dispatch(IDBSaveAccount({
      data: {
        id: uid,
        username: resUserInfo.data.user.screen_name ?? uid,
        cookie: cookieStr,
        lastLoginTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        s: sValue?.s,
        from: sValue?.from,
        c: sValue?.c
      }
    }));
    messageApi.success('登陆成功！');
    props?.onCancel?.();
  }

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
    <div className="flex mb-[16px]">
      <div>
        <Space size={ 8 }>
          <Alert message="新窗口登陆完毕后关闭窗口，完成登陆。" />
          <Button type="primary" onClick={ handleLoginWeiboClick }>微博登陆</Button>
        </Space>
      </div>
      <div className="grow content-center text-right">
        <HelpButtonGroup navId="weibo-visited" tooltipTitle="关于微博访客的查看" buttonProps={{ children: '关于微博访客的查看' }} />
      </div>
      <Modal title="输入App抓请求URL得来的参数（可跳过）"
        open={ inputSOpen }
        width={ 430 }
        centered={ true }
        closable={ false }
        mask={ false }
        maskClosable={ false }
        destroyOnClose={ true }
        footer={ <Button type="primary" onClick={ handleInputSOkClick }>下一步</Button> }
      >
        <Form form={ form } labelCol={{ span: 3 }}>
          <Form.Item name="s" label="s">
            <Input />
          </Form.Item>
          <Form.Item name="from" label="from">
            <Input />
          </Form.Item>
          <Form.Item name="c" label="c">
            <Input />
          </Form.Item>
          <Divider />
          <div>
            <div className="flex">
              <div className="grow">
                <Form.Item name="demoUrl">
                  <Input />
                </Form.Item>
              </div>
              <div className="shrink-0 ml-[8px]">
                <Button onClick={ handleExtractParamsFromUrlClick }>提取url中的参数</Button>
              </div>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default OpenWeiboWindow;