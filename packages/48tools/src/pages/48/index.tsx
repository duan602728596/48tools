import type { ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';
import style from './index.sass';
import Live from './Live/Live';

/* 直播和录播下载 */
function Index(props: {}): ReactElement | null {
  const routes: ReactElement | null = useRoutes([
    { path: 'Live', element: <Live /> },
    { path: 'Record', element: <div /> }
  ]);

  return <div className={ style.content }>{ routes }</div>;
}

export default Index;