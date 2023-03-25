import { Fragment, useState, type ReactElement, type Dispatch as D, type SetStateAction as S, type MouseEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Button, Modal, Form, message, Avatar, Tabs, type FormInstance } from 'antd';
import type { UseMessageReturnType } from '@48tools-types/antd';
import type { Tab } from 'rc-tabs/es/interface';
import style from './pocket48Login.sass';
import { requestMobileCodeLogin } from './services/pocket48Login';
import { pick } from '../../utils/lodash';
import { setUserInfo } from './reducers/pocket48Login';
import { source } from '../../utils/snh48';
import LoginForm from './LoginForm/LoginForm';
import TokenForm from './TokenForm/TokenForm';
import type { LoginUserInfo } from './services/interface';
import type { Pocket48LoginInitialState } from './reducers/pocket48Login';
import type { UserInfo } from './types';

/* redux selector */
type RState = { pocket48Login: Pocket48LoginInitialState };

const selector: Selector<RState, Pocket48LoginInitialState> = createStructuredSelector({
  // 口袋48已登陆账号
  userInfo: ({ pocket48Login }: RState): UserInfo | null => pocket48Login.userInfo
});

/**
 * 口袋48登录
 * 快速设置账号debug:
sessionStorage.setItem('POCKET48_USER_INFO', JSON.stringify({
  "token": "",
  "nickname": "test",
  "avatar": "/avatar/2023/0130/338518xzn4qph5wislm87p46xqpsf7.jpg"
}));
 *
 */
function Pocket48Login(props: {}): ReactElement {
  const { userInfo }: Pocket48LoginInitialState = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [open, setOpen]: [boolean, D<S<boolean>>] = useState(false);
  const [tabsKey, setTabsKey]: [string, D<S<string>>] = useState('loginForm');
  const [loginForm]: [FormInstance] = Form.useForm();
  const [tokenForm]: [FormInstance] = Form.useForm();

  // 登录并保存token
  async function handleLoginClick(event: MouseEvent): Promise<void> {
    let value: { area: string; mobile: string; code: string };

    try {
      value = await loginForm.validateFields();
    } catch {
      return;
    }

    try {
      const res: LoginUserInfo = await requestMobileCodeLogin(value.mobile, value.code);

      if (res.success) {
        dispatch(setUserInfo(
          pick(res.content.userInfo, ['token', 'nickname', 'avatar'])
        ));
        setOpen(false);
        messageApi.success('登录成功！');
      } else {
        console.error(res);
        messageApi.error('登录失败！');
      }
    } catch (err) {
      console.error(err);
      messageApi.error('登录中出现错误，登录失败！');
    }
  }

  // 直接保存token
  async function handleSaveTokenClick(event: MouseEvent): Promise<void> {
    let value: { token: string };

    try {
      value = await tokenForm.validateFields();
    } catch {
      return;
    }

    dispatch(setUserInfo({
      token: value.token.trim(),
      nickname: '',
      avatar: '',
      unknown: true
    }));
    setOpen(false);
  }

  function afterClose(): void {
    loginForm.resetFields();
    tokenForm.resetFields();
    setTabsKey('loginForm');
  }

  // button的渲染
  function loginButtonRender(): ReactElement {
    let icon: ReactElement | null = null;
    let nickname: string = '口袋48登录';

    if (userInfo) {
      icon = (
        <Avatar className={ style.avatar } size="small" src={ userInfo.unknown ? undefined : source(userInfo.avatar) }>
          { userInfo?.unknown ? '?' : undefined }
        </Avatar>
      );
      nickname = userInfo.unknown ? '未知用户' : userInfo.nickname;
    }

    return (
      <Button icon={ icon } onClick={ (event: MouseEvent): void => setOpen(true) }>
        { nickname }
      </Button>
    );
  }

  const tabsItem: Array<Tab> = [
    {
      key: 'loginForm',
      label: '验证码登录',
      children: <LoginForm form={ loginForm } />
    },
    {
      key: 'tokenForm',
      label: 'Token',
      children: <TokenForm form={ tokenForm } />
    }
  ];

  return (
    <Fragment>
      { loginButtonRender() }
      <Modal title="口袋48登录"
        open={ open }
        width={ 400 }
        centered={ true }
        destroyOnClose={ true }
        closable={ false }
        maskClosable={ false }
        afterClose={ afterClose }
        okText="登录"
        onOk={ tabsKey === 'tokenForm' ? handleSaveTokenClick : handleLoginClick }
        onCancel={ (event: MouseEvent): void => setOpen(false) }
      >
        <div className="h-[200px]">
          <Tabs type="card" activeKey={ tabsKey } items={ tabsItem } onChange={ (key: string): void => setTabsKey(key) } />
        </div>
      </Modal>
      { messageContextHolder }
    </Fragment>
  );
}

export default Pocket48Login;