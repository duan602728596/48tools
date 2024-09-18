import type { ReactElement, MouseEvent } from 'react';
import { App, Button } from 'antd';
import type { useAppProps } from 'antd/es/app/context';
import { kuaishouCookie } from './function/kuaishouCookie';
import useKuaishouLogin, { type UseKuaishouLoginReturn } from './useKuaishouLogin';
import Icon from '@ant-design/icons';
import IconKuaishouSvgComponent from '../../pages/Index/images/kuaishou.component.svg';

const IconKuaishouLogo: ReactElement = <Icon className="text-[18px]" component={ IconKuaishouSvgComponent } />;

/* 快手登录 */
function KuaishouLogin(props: {}): ReactElement {
  const { message: messageApi }: useAppProps = App.useApp();
  const kuaishouLogin: UseKuaishouLoginReturn = useKuaishouLogin({});

  // 清除快手的cookie
  function handleClearKuaishouCookie(event: MouseEvent<HTMLButtonElement>): void {
    kuaishouCookie.clean();
    messageApi.success('Cookie已清除！');
  }

  // 快手登录
  function handleKuaishouLoginClick(event: MouseEvent<HTMLButtonElement>): void {
    kuaishouLogin.handleOpenKuaishouLoginWin('');
  }

  return (
    <Button.Group>
      <Button icon={ IconKuaishouLogo } onClick={ handleKuaishouLoginClick }>快手登录</Button>
      <Button type="primary" danger={ true } onClick={ handleClearKuaishouCookie }>清除快手Cookie的缓存</Button>
    </Button.Group>
  );
}

export default KuaishouLogin;