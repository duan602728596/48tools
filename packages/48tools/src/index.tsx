import { render } from 'react-dom';
import App from './App';
import './utils/nodeMediaServer';

/* app */
render(
  <App />,
  document.getElementById('app')
);