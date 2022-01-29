import type { ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';
import Index from '../pages/Index/index';
import RoomInfo from '../pages/RoomInfo/index';
import Record from '../pages/Record/index';

function Routers(props: {}): ReactElement | null {
  const routes: ReactElement | null = useRoutes([
    { path: '/*', element: <Index /> },
    { path: 'RoomInfo', element: <RoomInfo /> },
    { path: 'Record', element: <Record /> }
  ]);

  return routes;
}

export default Routers;