import type { ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';
import Agreement from './Agreement';
import Power from './Power/Power';
import CreditsDynamic from './Credits/loader';

/* 声明和协议等 */
function Index(props: {}): ReactElement | null {
  const routes: ReactElement | null = useRoutes([
    { path: 'Agreement', element: <Agreement /> },
    { path: 'Power', element: <Power /> },
    { path: 'Credits', element: <CreditsDynamic /> }
  ]);

  return routes;
}

export default Index;