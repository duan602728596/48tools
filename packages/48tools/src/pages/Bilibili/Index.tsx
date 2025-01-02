import type { ReactElement } from 'react';
import { useRoutes } from 'react-router';
import Content from '../../components/Content/Content';
import Download from './Download/Download';
import Live from './Live/Live';

/* B站相关 */
function Index(props: {}): ReactElement {
  const routes: ReactElement | null = useRoutes([
    { path: 'Download', element: <Download /> },
    { path: 'Live', element: <Live /> }
  ]);

  return <Content>{ routes }</Content>;
}

export default Index;