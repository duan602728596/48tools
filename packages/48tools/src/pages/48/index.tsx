import type { ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';
import Content from '../../components/Content/Content';
import Live from './Live/Live';
import Record from './Record/Record';

/* 直播和录播下载 */
function Index(props: {}): ReactElement | null {
  const routes: ReactElement | null = useRoutes([
    { path: 'Live', element: <Live /> },
    { path: 'Record', element: <Record /> }
  ]);

  return <Content>{ routes }</Content>;
}

export default Index;