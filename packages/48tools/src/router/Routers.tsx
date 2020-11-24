import type { ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';
import Index from '../pages/Index/index';

function Routers(props: {}): ReactElement | null {
  const routes: ReactElement | null = useRoutes([
    { path: '//*', element: <Index /> }
  ]);

  return routes;
}

export default Routers;