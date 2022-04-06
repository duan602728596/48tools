import { render } from 'react-dom';
import PlayerApp from './PlayerApp';
import '../../../../main.tailwindcss.css';

/* app */
render(
  <PlayerApp />,
  document.getElementById('app')
);

declare const module: any;

if (module.hot) {
  module.hot.accept();
}