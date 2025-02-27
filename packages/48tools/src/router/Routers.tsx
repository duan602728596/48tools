import type { ReactElement } from 'react';
import { useRoutes, Navigate } from 'react-router';
import Index from '../pages/Index/Index';
import Pocket48 from '../pages/48/Index';
import Bilibili from '../pages/Bilibili/Index';
import AcFun from '../pages/AcFun/Index';
import Toutiao from '../pages/Toutiao/Index';
import Kuaishou from '../pages/Kuaishou/Index';
import VideoEditDynamic from '../pages/VideoEdit/loader';
import Weibo from '../pages/Weibo/Index';
import Agreement from '../pages/Agreement/Index';
import { needToReadPower } from '../pages/Agreement/utils/helper';
import ShowroomLive from '../pages/ShowRoomLive/Index';
import XiaohongshuLive from '../pages/XiaohongshuLive/Index';

function Routers(props: {}): ReactElement | null {
  const routes: ReactElement | null = useRoutes([
    {
      path: '/',
      Component(): ReactElement {
        if (needToReadPower()) {
          return <Navigate to="/Agreement/Power?read=1" />;
        }

        return <Index />;
      }
    },
    { path: '48/*', element: <Pocket48 /> },
    { path: 'Bilibili/*', element: <Bilibili /> },
    { path: 'AcFun/*', element: <AcFun /> },
    { path: 'Toutiao/*', element: <Toutiao /> },
    { path: 'Kuaishou/*', element: <Kuaishou /> },
    { path: 'VideoEdit/*', element: <VideoEditDynamic /> },
    { path: 'Weibo/*', element: <Weibo /> },
    { path: 'Agreement/*', element: <Agreement /> },
    { path: 'ShowroomLive/Live', element: <ShowroomLive /> },
    { path: 'Xiaohongshu/Live', element: <XiaohongshuLive /> }
  ]);

  return routes;
}

export default Routers;