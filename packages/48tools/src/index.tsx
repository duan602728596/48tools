import { render } from 'react-dom';
import App from './App';
import { netMediaServerInit } from './utils/nodeMediaServer';
import dbInit from './utils/idb/dbInit';

/* app */
render(
  <App />,
  document.getElementById('app')
);

netMediaServerInit();
dbInit();