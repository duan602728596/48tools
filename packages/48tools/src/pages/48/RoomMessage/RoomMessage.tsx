import { Fragment, useEffect, type ReactElement } from 'react';
import style from './roomMessage.sass';
import Pocket48Login from '../../../functionalComponents/Pocket48Login/Pocket48Login';
import Header from '../../../components/Header/Header';

/* 导出房间消息 */
function RoomMessage(props: {}): ReactElement {
  useEffect(function(): () => void {
    document.getElementById('app')!.classList.add(style.app);

    return function(): void {
      document.getElementById('app')!.classList.remove(style.app);
    };
  }, []);

  return (
    <Fragment>
      <Header>
        <Pocket48Login />
      </Header>
      <div className="flex-grow" />
    </Fragment>
  );
}

export default RoomMessage;