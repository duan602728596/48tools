import type { ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';
import Index from '../pages/Index/index';
import L48 from '../pages/48/index';
import Bilibili from '../pages/Bilibili/index';
import Concat from '../pages/Concat/index';

function Routers(props: {}): ReactElement | null {
  const routes: ReactElement | null = useRoutes([
    { path: '//*', element: <Index /> },
    { path: '48/*', element: <L48 /> },
    { path: 'Bilibili/*', element: <Bilibili /> },
    { path: 'Concat/*', element: <Concat /> }
  ]);

  return routes;
}

export default Routers;