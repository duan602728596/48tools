import type { ReactElement } from 'react';
import { useRoutes, Navigate } from 'react-router-dom';
import Index from '../pages/Index/index';
import Pocket48 from '../pages/48/index';
import Bilibili from '../pages/Bilibili/index';
import AcFun from '../pages/AcFun/index';
import Toutiao from '../pages/Toutiao/index';
import Kuaishou from '../pages/Kuaishou/index';
import VideoEditDynamic from '../pages/VideoEdit/loader';
import WeiboLive from '../pages/Weibo/WeiboLive/WeiboLive';
import WeiboSuperDynamic from '../pages/Weibo/WeiboSuper/loader';
import WeiboImagesDownloadDynamic from '../pages/Weibo/ImagesDownload/loader';
import Agreement from '../pages/Agreement/index';
import { needToReadPower } from '../pages/Agreement/function/helper';

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
    { path: 'WeiboLive', element: <WeiboLive /> },
    { path: 'WeiboSuper', element: <WeiboSuperDynamic /> },
    { path: 'WeiboImagesDownload', element: <WeiboImagesDownloadDynamic /> },
    { path: 'Agreement/*', element: <Agreement /> }
  ]);

  return routes;
}

export default Routers;