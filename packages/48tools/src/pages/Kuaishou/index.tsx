import type { ReactElement } from 'react';
import { useRoutes } from 'react-router';
import Content from '../../components/Content/Content';
import Live from './Live/Live';
import VideoDownload from './VideoDownload/VideoDownload';

/* 快手 */
function Index(props: {}): ReactElement | null {
  const routes: ReactElement | null = useRoutes([
    { path: 'VideoDownload', element: <VideoDownload /> },
    { path: 'Live', element: <Live /> }
  ]);

  return <Content>{ routes }</Content>;
}

export default Index;