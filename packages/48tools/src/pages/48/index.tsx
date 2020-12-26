import type { ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';
import Content from '../../components/Content/Content';
import Pocket48Live from './Pocket48Live/Pocket48Live';
import Pocket48Record from './Pocket48Record/Pocket48Record';
import Live48 from './Live48/Live48';

/* 直播和录播下载 */
function Index(props: {}): ReactElement | null {
  const routes: ReactElement | null = useRoutes([
    { path: 'Pocket48Live', element: <Pocket48Live /> },
    { path: 'Pocket48Record', element: <Pocket48Record /> },
    { path: 'Live48', element: <Live48 /> }
  ]);

  return <Content>{ routes }</Content>;
}

export default Index;