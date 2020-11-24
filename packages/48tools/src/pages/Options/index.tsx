import type { ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';
import Options from './Options/index';
import Edit from './Edit/index';

/* options routers */
function Index(props: {}): ReactElement | null {
  const routers: ReactElement | null = useRoutes([
    { path: '/', element: <Options /> },
    { path: 'Edit', element: <Edit /> },
    { path: 'Edit/:id', element: <Edit /> }
  ]);

  return routers;
}

export default Index;