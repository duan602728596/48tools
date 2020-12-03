import { render } from 'react-dom';
import App from './App';
import { netMediaServerInit } from './utils/nodeMediaServer';

/* app */
render(
  <App />,
  document.getElementById('app')
);

netMediaServerInit();