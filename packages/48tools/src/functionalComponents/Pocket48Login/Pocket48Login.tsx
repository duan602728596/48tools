import { clipboard } from 'electron';
import {
  Fragment,
  createElement,
  useState,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { Button, Modal, Form, message, Avatar, Tabs, Dropdown, type FormInstance } from 'antd';
import type { UseMessageReturnType } from '@48tools-types/antd';
import type { Tab } from 'rc-tabs/es/interface';
import type { ItemType, MenuInfo } from 'rc-menu/es/interface';
import style from './pocket48Login.sass';
import { requestMobileCodeLogin, requestImUserInfo } from './services/pocket48Login';
import { pick, omit } from '../../utils/lodash';
import { setUserInfo, setClearInfo } from './reducers/pocket48Login';
import { source } from '../../utils/snh48';
import LoginForm from './LoginForm/LoginForm';
import TokenForm from './TokenForm/TokenForm';
import type { LoginUserInfo, IMUserInfo } from './services/interface';
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

  // 获取IM信息
  async function getIMInfo(token: string): Promise<IMUserInfo['content'] | undefined> {
    const imUserInfoRes: IMUserInfo = await requestImUserInfo(token);

    console.log('IM信息：', imUserInfoRes);

    if (imUserInfoRes.status === 200) {
      return imUserInfoRes.content;
    } else {
      messageApi.error('获取IM信息失败！');
    }
  }

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
        const im: IMUserInfo['content'] | undefined = await getIMInfo(res.content.userInfo.token);

        if (im) {
          dispatch(setUserInfo(
            {
              ...pick(res.content.userInfo, ['token', 'nickname', 'avatar']),
              ...omit(im, ['userId'])
            }
          ));
          setOpen(false);
          messageApi.success('登录成功！');
        }
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

    const im: IMUserInfo['content'] | undefined = await getIMInfo(value.token);

    if (im) {
      dispatch(setUserInfo({
        token: value.token.trim(),
        nickname: '',
        avatar: '',
        accid: im.accid,
        pwd: im.pwd,
        unknown: true
      }));
      setOpen(false);
    }
  }

  function afterClose(): void {
    loginForm.resetFields();
    tokenForm.resetFields();
    setTabsKey('loginForm');
  }

  // menu的选择
  function handleMenuClick(e: MenuInfo): void {
    switch (e.key) {
      case 'copyToken':
        if (userInfo) {
          clipboard.writeText(userInfo.token);
          messageApi.success('Token复制到剪贴板。');
        }

        break;

      case 'copyInfo':
        if (userInfo) {
          clipboard.writeText(JSON.stringify(userInfo, null, 2));
          messageApi.success('登录信息复制到剪贴板。');
        }

        break;

      case 'exit':
        dispatch(setClearInfo());
        break;
    }
  }

  const menuItems: Array<ItemType> = [
    { label: '复制Token', key: 'copyToken' },
    { label: '复制登录信息', key: 'copyInfo' },
    { type: 'divider' },
    { label: '退出', key: 'exit' }
  ];

  // button的渲染
  function loginButtonRender(): ReactElement {
    let icon: ReactElement | null = null;
    let nickname: string = '口袋48登录';

    if (userInfo) {
      icon = (
        <Avatar key="icon" className={ style.avatar } size="small" src={ userInfo.unknown ? undefined : source(userInfo.avatar) }>
          { userInfo?.unknown ? '?' : undefined }
        </Avatar>
      );
      nickname = userInfo.unknown ? '未知用户' : userInfo.nickname;
    }

    return createElement(
      userInfo ? Dropdown.Button : Button,
      {
        onClick: (event: MouseEvent): void => setOpen(true),
        menu: userInfo ? {
          items: menuItems,
          onClick: handleMenuClick
        } : undefined
      },
      [icon, nickname]
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
      <div className="inline-block">{ loginButtonRender() }</div>
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