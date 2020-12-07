import type { ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';
import style from '../48/index.sass';
import Download from './Download/Download';

/* B站相关 */
function Index(props: {}): ReactElement {
  const routes: ReactElement | null = useRoutes([
    { path: 'Download', element: <Download /> }
  ]);

  return <div className={ style.content }>{ routes }</div>;
}

export default Index;