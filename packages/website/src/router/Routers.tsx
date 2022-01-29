import type { ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';
import Index from '../pages/Index/index';
import RoomInfo from '../pages/RoomInfo/index';

function Routers(props: {}): ReactElement | null {
  const routes: ReactElement | null = useRoutes([
    { path: '/*', element: <Index /> },
    { path: '/RoomInfo', element: <RoomInfo /> }
  ]);

  return routes;
}

export default Routers;