import { clipboard } from 'electron';
import {
  Fragment,
  createElement,
  useState,
  useRef,
  type ReactElement,
  type Dispatch as D,
  type SetStateAction as S,
  type MouseEvent,
  type MutableRefObject
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { Dispatch } from '@reduxjs/toolkit';
import { createStructuredSelector, type Selector } from 'reselect';
import { useLocation, useNavigate, type Location, type NavigateFunction } from 'react-router-dom';
import { Button, Modal, Form, message, Avatar, Tabs, Dropdown, Select, type FormInstance } from 'antd';
import type { ModalFunc } from 'antd/es/modal/confirm';
import type { UseMessageReturnType, UseModalReturnType, LabeledValue } from '@48tools-types/antd';
import type { Tab } from 'rc-tabs/es/interface';
import type { ItemType, MenuInfo } from 'rc-menu/es/interface';
import {
  requestMobileCodeLogin,
  requestImUserInfo,
  requestUserInfoReload,
  requestUserInfoSwitch,
  type LoginUserInfo,
  type IMUserInfo,
  type UserInfoReloadOrSwitch,
  type UserItem
} from '@48tools-api/48/login';
import commonStyle from '../../common.sass';
import style from './pocket48Login.sass';

import { pick, omit } from '../../utils/lodash';
import { setUserInfo, setClearInfo } from './reducers/pocket48Login';
import { source } from '../../utils/snh48';
import LoginForm from './LoginForm/LoginForm';
import TokenForm from './TokenForm/TokenForm';
import type { Pocket48LoginInitialState } from './reducers/pocket48Login';
import type { UserInfo } from './types';

function selectOptions(bigUserInfo: UserItem, smallUserInfo: Array<UserItem> = []): Array<LabeledValue> {
  return [{ label: `${ bigUserInfo.nickname }（主要账号）`, value: `${ bigUserInfo.userId }` }].concat(
    smallUserInfo.map((item: UserItem): LabeledValue => ({ label: `${ item.nickname }（小号）`, value: `${ item.userId }` }))
  );
}

const menuItems: Array<ItemType> = [
  { label: '复制Token', key: 'copyToken' },
  { label: '复制登录信息', key: 'copyInfo' },
  { label: '一键关注', key: 'friends' },
  globalThis.__INITIAL_STATE__.commandLineOptions['enable-48-qingchunshike']
    && { label: '青春时刻统计', key: 'qingchunshike' },
  { type: 'divider' },
  { label: '退出', key: 'exit' }
].filter(Boolean);

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
interface ReloadInfoReturn {
  status: 0 | 1 | 2; // 0 取消 1 有小号 2 无小号
  nickname?: string;
  avatar?: string;
  token?: string;    // switch时返回token
}

function Pocket48Login(props: {}): ReactElement {
  const { userInfo }: Pocket48LoginInitialState = useSelector(selector);
  const dispatch: Dispatch = useDispatch();
  const location: Location = useLocation(),
    navigate: NavigateFunction = useNavigate();
  const [messageApi, messageContextHolder]: UseMessageReturnType = message.useMessage();
  const [modalApi, modalContextHolder]: UseModalReturnType = Modal.useModal();
  const [open, setOpen]: [boolean, D<S<boolean>>] = useState(false);
  const [tabsKey, setTabsKey]: [string, D<S<string>>] = useState('loginForm');
  const userInfoSelectValueRef: MutableRefObject<string | null> = useRef(null);
  const [loginForm]: [FormInstance] = Form.useForm();
  const [tokenForm]: [FormInstance] = Form.useForm();

  // select
  function handleUserInfoSelect(value: string): void {
    userInfoSelectValueRef.current = value;
  }

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

  /**
   * 根据token获取是否有小号
   * 返回三种状态：无小号，有小号，取消
   */
  function reloadInfo(token: string): Promise<ReloadInfoReturn> {
    return new Promise(async (resolve: Function, reject: Function): Promise<void> => {
      const reload: UserInfoReloadOrSwitch = await requestUserInfoReload(token);

      if (!reload.success) {
        messageApi.error(reload.message);
        resolve({ status: 0 });

        return;
      }

      if (reload.content?.bigSmallInfo?.smallUserInfo?.length) {
        const userIdString: string = String(reload.content.userId);

        userInfoSelectValueRef.current = userIdString;

        // 账号有小号时，额外弹出modal，选择小号
        const m: ReturnType<ModalFunc> = modalApi.confirm({
          title: '请选择你要登录的账号',
          content: (
            <div className="h-[200px]">
              <p className={ commonStyle.tips }>
                登录&切换主要账号和小号仍然会踢掉已经登录的账号！
                <br />
                选择粘贴的Token对应的账号则不会踢掉已经登录的账号。
              </p>
              <Select className={ style.select }
                options={ selectOptions(reload.content.bigSmallInfo.bigUserInfo, reload.content.bigSmallInfo.smallUserInfo) }
                defaultValue={ userIdString }
                onSelect={ handleUserInfoSelect }
              />
            </div>
          ),
          width: 400,
          centered: true,
          closable: false,
          maskClosable: false,
          mask: false,
          okText: '选择当前账号',
          onOk(): void {
            if (userIdString === userInfoSelectValueRef.current) {
              // 选择当前账号，直接登录
              resolve({
                status: 1,
                nickname: reload.content.nickname,
                avatar: reload.content.avatar
              });
              userInfoSelectValueRef.current = null;
              m.destroy();
            } else {
              // 选择其他账号，需要switch获取新的token
              requestUserInfoSwitch(token, Number(userInfoSelectValueRef.current)).then((res: UserInfoReloadOrSwitch): void => {
                resolve({
                  status: 2,
                  token: res.content.token,
                  nickname: res.content.nickname,
                  avatar: res.content.avatar
                });
                userInfoSelectValueRef.current = null;
                m.destroy();
              });
            }
          },
          onCancel(): void {
            resolve({ status: 0 });
            userInfoSelectValueRef.current = null;
            m.destroy();
          }
        });
      } else {
        // 账号无小号时，直接使用当前登录的账号信息
        resolve({
          status: 1,
          nickname: reload.content.nickname,
          avatar: reload.content.avatar
        });
      }
    });
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
        const reloadInfoResult: ReloadInfoReturn = await reloadInfo(res.content.userInfo.token);

        if (reloadInfoResult.status === 0) return;

        const token: string = reloadInfoResult.status === 2 && reloadInfoResult.token
          ? reloadInfoResult.token
          : res.content.userInfo.token;
        const im: IMUserInfo['content'] | undefined = await getIMInfo(token);

        if (im) {
          dispatch(setUserInfo(
            {
              ...pick(res.content.userInfo, ['nickname', 'avatar']),
              ...omit(im, ['userId']),
              token
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

    const reloadInfoResult: ReloadInfoReturn = await reloadInfo(value.token.trim());

    if (reloadInfoResult.status === 0) return;

    const token: string = reloadInfoResult.status === 2 && reloadInfoResult.token ? reloadInfoResult.token : value.token.trim();
    const im: IMUserInfo['content'] | undefined = await getIMInfo(token);

    if (im) {
      dispatch(setUserInfo({
        token,
        nickname: reloadInfoResult.nickname ?? '',
        avatar: reloadInfoResult.avatar ?? '',
        accid: im.accid,
        pwd: im.pwd,
        unknown: !(reloadInfoResult.nickname && reloadInfoResult.avatar)
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

      case 'friends':
        navigate('/48/Friends', {
          state: { from: location.pathname }
        });
        break;

      case 'qingchunshike':
        navigate('/48/Qingchunshike', {
          state: { from: location.pathname }
        });
        break;

      case 'exit':
        dispatch(setClearInfo());
        break;
    }
  }

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
        <div className="h-[300px]">
          <Tabs type="card" activeKey={ tabsKey } items={ tabsItem } onChange={ (key: string): void => setTabsKey(key) } />
        </div>
      </Modal>
      { messageContextHolder }
      { modalContextHolder }
    </Fragment>
  );
}

export default Pocket48Login;