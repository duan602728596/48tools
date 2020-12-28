import type { ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';
import Content from '../../components/Content/Content';
import Pocket48Live from './Pocket48/Pocket48Live/Pocket48Live';
import LiveOptions from './Pocket48/LiveOptions/LiveOptions';
import Pocket48Record from './Pocket48/Pocket48Record/Pocket48Record';
import InLive from './Live48/InLive/InLive';

/* 直播和录播下载 */
function Index(props: {}): ReactElement | null {
  const routes: ReactElement | null = useRoutes([
    { path: 'Pocket48Live', element: <Pocket48Live /> },
    { path: 'LiveOptions', element: <LiveOptions /> },
    { path: 'Pocket48Record', element: <Pocket48Record /> },
    { path: 'InLive', element: <InLive /> }
  ]);

  return <Content>{ routes }</Content>;
}

export default Index;