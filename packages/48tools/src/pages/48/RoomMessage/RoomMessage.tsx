import { useEffect, type ReactElement } from 'react';
import style from './roomMessage.sass';
import SearchMessage from './SearchMessage/SearchMessage';

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

export default RoomMessage;