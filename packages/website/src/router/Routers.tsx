import type { ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';
import Index from '../pages/Index/index';
import RoomInfo from '../pages/RoomInfo/index';
import Record from '../pages/Record/index';
import Page404 from '../pages/Page404/index';

function Routers(props: {}): ReactElement | null {
  const routes: ReactElement | null = useRoutes([
    { path: '/', element: <Index /> },
    { path: 'RoomInfo', element: <RoomInfo /> },
    { path: 'Record', element: <Record /> },
    { path: '*', element: <Page404 /> }
  ]);

  return routes;
}

export default Routers;