import type { ReactElement } from 'react';
import { useRoutes } from 'react-router';
import Content from '../../components/Content/Content';
import Douyin from './Douyin/Douyin';
import DouyinLive from './DouyinLive/DouyinLive';

/* 头条相关 */
function Index(props: {}): ReactElement {
  const routes: ReactElement | null = useRoutes([
    { path: 'Douyin', element: <Douyin /> },
    { path: 'DouyinLive', element: <DouyinLive /> }
  ]);

  return <Content>{ routes }</Content>;
}

export default Index;