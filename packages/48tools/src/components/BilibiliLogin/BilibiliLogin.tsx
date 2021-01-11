import { Fragment, useState, ReactElement, Dispatch as D, SetStateAction as S } from 'react';
import { Button, Modal } from 'antd';
import Icon from '@ant-design/icons';
import style from './bilibiliLogin.sass';
import Qrcode from './Qrcode';
import { ReactComponent as BilibiliSvgComponent } from './images/bilibili.svg';

/* B站登陆 */
function BilibiliLogin(props: {}): ReactElement {
  const [visible, setVisible]: [boolean, D<S<boolean>>] = useState(false);

  return (
    <Fragment>
      <Button icon={ <Icon className={ style.bilibiliIcon }
        component={ BilibiliSvgComponent } /> }
      >
        B站账号扫码登陆
      </Button>
      <Modal visible={ visible }
        title="B站账号扫码登陆"
        width={ 600 }
        centered={ true }
        destroyOnClose={ true }
      >
        <div className={ style.loginBox }>
          <Qrcode />
        </div>
      </Modal>
    </Fragment>
  );
}

export default BilibiliLogin;