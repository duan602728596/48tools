import type { ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';
import Content from '../../components/Content/Content';
import Douyin from './Douyin/Douyin';

/* 头条相关 */
function Index(props: {}): ReactElement {
  const routes: ReactElement | null = useRoutes([
    { path: 'Douyin', element: <Douyin /> }
  ]);

  return <Content>{ routes }</Content>;
}

export default Index;