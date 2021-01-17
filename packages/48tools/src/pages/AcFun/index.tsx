import type { ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';
import Content from '../../components/Content/Content';
import Download from './Download/Download';
import Live from './Live/Live';

/* A站相关 */
function Index(props: {}): ReactElement | null {
  const routes: ReactElement | null = useRoutes([
    { path: 'Download', element: <Download /> },
    { path: 'Live', element: <Live /> }
  ]);

  return <Content>{ routes }</Content>;
}

export default Index;