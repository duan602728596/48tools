import { Fragment, ReactElement } from 'react';
import { useRoutes } from 'react-router-dom';
import useTheme, { UseThemeReturn } from '../components/useTheme/useTheme';
import Index from '../pages/Index/index';
import L48 from '../pages/48/index';
import Bilibili from '../pages/Bilibili/index';
import Concat from '../pages/Concat/index';
import VideoCut from '../pages/VideoCut/index';

function Routers(props: {}): ReactElement | null {
  const theme: UseThemeReturn = useTheme();
  const routes: ReactElement | null = useRoutes([
    { path: '//*', element: <Index ChangeThemeElement={ theme.ChangeThemeElement } /> },
    { path: '48/*', element: <L48 /> },
    { path: 'Bilibili/*', element: <Bilibili /> },
    { path: 'Concat/*', element: <Concat /> },
    { path: 'VideoCut/*', element: <VideoCut /> }
  ]);

  return (
    <Fragment>
      { routes }
      { theme.DarkStylesheetElement }
    </Fragment>
  );
}

export default Routers;