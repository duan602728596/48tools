import { render } from 'react-dom';
import PlayerApp from './PlayerApp';

/* app */
render(
  <PlayerApp />,
  document.getElementById('app')
);

if (process.env.NODE_ENV === 'development') {
  const VConsole: any = require('vconsole');
  const vconsole: any = new VConsole();
}