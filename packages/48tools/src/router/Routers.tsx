import type { ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';
import Index from '../pages/Index/index';
import L48 from '../pages/48/index';
import Bilibili from '../pages/Bilibili/index';
import AcFun from '../pages/AcFun/index';
import Toutiao from '../pages/Toutiao/index';
import VideoEdit from '../pages/VideoEdit/index';
import WeiboSuper from '../pages/WeiboSuper/index';
import TaobaEncrypt from '../pages/TaobaEncrypt/index';

function Routers(props: {}): ReactElement | null {
  const routes: ReactElement | null = useRoutes([
    { path: '//*', element: <Index /> },
    { path: '48/*', element: <L48 /> },
    { path: 'Bilibili/*', element: <Bilibili /> },
    { path: 'AcFun/*', element: <AcFun /> },
    { path: 'Toutiao/*', element: <Toutiao /> },
    { path: 'VideoEdit/*', element: <VideoEdit /> },
    { path: 'WeiboSuper', element: <WeiboSuper /> },
    { path: 'TaobaEncrypt', element: <TaobaEncrypt /> }
  ]);

  return routes;
}

export default Routers;