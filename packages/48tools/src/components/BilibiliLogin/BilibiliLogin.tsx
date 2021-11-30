import { Fragment, useState, type ReactElement, type Dispatch as D, type SetStateAction as S, type MouseEvent } from 'react';
import { Button, Modal } from 'antd';
import Icon from '@ant-design/icons';
import style from './bilibiliLogin.sass';
import Qrcode from './Qrcode';
import BilibiliSvgComponent from './images/bilibili.component.svg';

/* B站登陆 */
function BilibiliLogin(props: {}): ReactElement {
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
      <Button icon={ <Icon className={ style.bilibiliIcon } component={ BilibiliSvgComponent } /> }
        onClick={ handleOpenQrcodeClick }
      >
        B站账号扫码登陆
      </Button>
      <Modal visible={ visible }
        title="B站账号扫码登陆"
        width={ 600 }
        centered={ true }
        destroyOnClose={ true }
        footer={ <Button onClick={ handleCloseQrcodeClick }>关闭</Button> }
        onCancel={ handleCloseQrcodeClick }
      >
        <div className={ style.loginBox }>
          <Qrcode onCancel={ handleCloseQrcodeClick } />
        </div>
      </Modal>
    </Fragment>
  );
}

export default BilibiliLogin;