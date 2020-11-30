import type { ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';
import Index from '../pages/Index/index';
import L48 from '../pages/48/index';

function Routers(props: {}): ReactElement | null {
  const routes: ReactElement | null = useRoutes([
    { path: '//*', element: <Index /> },
    { path: '48/*', element: <L48 /> }
  ]);

  return routes;
}

export default Routers;