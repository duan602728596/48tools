import { Fragment, useState, ReactElement, Dispatch as D, SetStateAction as S, MouseEvent } from 'react';
import { Button, Modal } from 'antd';
import { WeiboCircleOutlined as IconWeiboCircleOutlined } from '@ant-design/icons';
import style from './weiboLogin.sass';

/* 微博扫码登陆 */
function WeiboLogin(props: {}): ReactElement {
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false);

  // 打开扫码弹出层
  function handleOpenQrcodeClick(event: MouseEvent<HTMLButtonElement>): void {
    setVisible(true);
  }

  // 关闭扫码弹出层
  function handleCloseQrcodeClick(event: MouseEvent<HTMLButtonElement>): void {
    setVisible(false);
  }

  return (
    <Fragment>
      <Button icon={ <IconWeiboCircleOutlined /> } onClick={ handleOpenQrcodeClick }>微博账号扫码登陆</Button>
      <Modal visible={ visible }
        title="微博账号扫码登陆"
        width={ 600 }
        centered={ true }
        destroyOnClose={ true }
        footer={ <Button onClick={ handleCloseQrcodeClick }>关闭</Button> }
        onCancel={ handleCloseQrcodeClick }
      >
        <div className={ style.loginBox }></div>
      </Modal>
    </Fragment>
  );
}

export default WeiboLogin;