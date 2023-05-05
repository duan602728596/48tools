import type { ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';
import Content from '../../components/Content/Content';
import Live from './Live/Live';

/* 快手 */
function Index(props: {}): ReactElement | null {
  const routes: ReactElement | null = useRoutes([
    { path: 'Live', element: <Live /> }
  ]);

  return <Content>{ routes }</Content>;
}

export default Index;