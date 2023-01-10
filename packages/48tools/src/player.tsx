import { createRoot, type Root } from 'react-dom/client';
import 'antd/dist/reset.css';
import AntdConfig from './components/AntdConfig/AntdConfig';
import ThemeProvider from './components/Theme/ThemeProvider';
import PlayerWindow from './pages/PlayerWindow/PlayerWindow';
import './main.tailwindcss.css';
import './player.global.sass';

/* app */
const root: Root = createRoot(document.getElementById('app')!);

root.render(
  <ThemeProvider isChildrenWindow={ true }>
    <AntdConfig>
      <PlayerWindow />
    </AntdConfig>
  </ThemeProvider>
);