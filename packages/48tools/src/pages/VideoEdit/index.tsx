import type { ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';
import Content from '../../components/Content/Content';
import Concat from './Concat/Concat';
import VideoCut from './VideoCut/VideoCut';
import FFmpegProcess from './FFmpegProcess/FFmpegProcess';

/* 视频编辑相关功能 */
function Index(props: {}): ReactElement {
  const router: ReactElement | null = useRoutes([
    { path: 'Concat', element: <Concat /> },
    { path: 'VideoCut', element: <VideoCut /> },
    { path: 'FFmpegProcess', element: <FFmpegProcess /> }
  ]);

  return <Content>{ router }</Content>;
}

export default Index;