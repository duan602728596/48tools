import { useEffect, type ReactElement } from 'react';
import style from './roomMessage.sass';
import SearchMessage from './SearchMessage/SearchMessage';
import dynamicReducers from '../../../store/dynamicReducers';
import roomMessageReducers from '../reducers/roomMessage';

/* 导出房间消息 */
function RoomMessage(props: {}): ReactElement {
  useEffect(function(): () => void {
    document.getElementById('app')!.classList.add(style.app);

    return function(): void {
      document.getElementById('app')!.classList.remove(style.app);
    };
  }, []);

  return <SearchMessage />;
}

export default dynamicReducers([roomMessageReducers])(RoomMessage);