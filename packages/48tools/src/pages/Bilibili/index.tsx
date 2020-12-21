import type { ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';
import style from '../48/index.sass';
import Download from './Download/Download';
import Live from './Live/Live';

/* B站相关 */
function Index(props: {}): ReactElement {
  const routes: ReactElement | null = useRoutes([
    { path: 'Download', element: <Download /> },
    { path: 'Live', element: <Live /> }
  ]);

  return <div className={ style.content }>{ routes }</div>;
}

export default Index;