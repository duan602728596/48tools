import { createRoot, type Root } from 'react-dom/client';
import 'antd/dist/reset.css';
import AntdConfig from './components/basic/AntdConfig/AntdConfig';
import ThemeProvider from './components/basic/Theme/ThemeProvider';
import PlayerWindow from './pages/PlayerWindow/PlayerWindow';
import './entry/main.tailwindcss.css';
import './entry/player/player.global.sass';
import './components/basic/Accessibility/Accessibility';

/* app */
const root: Root = createRoot(document.getElementById('app')!);

root.render(
  <ThemeProvider isChildrenWindow={ true }>
    <AntdConfig>
      <PlayerWindow />
    </AntdConfig>
  </ThemeProvider>
);