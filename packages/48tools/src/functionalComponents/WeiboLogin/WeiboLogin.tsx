import { Fragment, useState, type ReactElement, type Dispatch as D, type SetStateAction as S, type MouseEvent } from 'react';
import { Button, Modal } from 'antd';
import { WeiboCircleOutlined as IconWeiboCircleOutlined } from '@ant-design/icons';
import OpenWeiboWindow from './Login/OpenWeiboWindow';
import LoginTable from './LoginTable';

/* 微博扫码登陆 */
function WeiboLogin(props: {}): ReactElement {
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false);

  // 打开扫码弹出层
  function handleOpenQrcodeClick(event: MouseEvent): void {
    setVisible(true);
  }

  // 关闭扫码弹出层
  function handleCloseQrcodeClick(event: MouseEvent): void {
    setVisible(false);
  }

  return (
    <Fragment>
      <Button icon={ <IconWeiboCircleOutlined /> } onClick={ handleOpenQrcodeClick }>微博账号登陆</Button>
      <Modal open={ visible }
        title="微博账号登陆"
        width={ 750 }
        centered={ true }
        destroyOnClose={ true }
        footer={ <Button onClick={ handleCloseQrcodeClick }>关闭</Button> }
        onCancel={ handleCloseQrcodeClick }
      >
        <div className="h-[420px]">
          <OpenWeiboWindow onCancel={ handleCloseQrcodeClick } />
          <LoginTable />
        </div>
      </Modal>
    </Fragment>
  );
}

export default WeiboLogin;