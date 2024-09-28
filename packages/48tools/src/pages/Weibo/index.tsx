import type { ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';
import Content from '../../components/Content/Content';
import WeiboLive from './WeiboLive/WeiboLive';
import WeiboSuperDynamic from './WeiboSuper/loader';
import WeiboImagesDownloadDynamic from './ImagesDownload/loader';

/* B站相关 */
function Index(props: {}): ReactElement {
  const routes: ReactElement | null = useRoutes([
    { path: 'Live', element: <WeiboLive /> },
    { path: 'Super', element: <WeiboSuperDynamic /> },
    { path: 'ImagesDownload', element: <WeiboImagesDownloadDynamic /> }
  ]);

  return <Content>{ routes }</Content>;
}

export default Index;