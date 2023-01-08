import { createRoot, type Root } from 'react-dom/client';
import 'antd/dist/reset.css';
import AntdConfig from './components/AntdConfig/AntdConfig';
import ThemeProvider from './components/Theme/ThemeProvider';
import LiveVideo from './pages/48/Pocket48/Player/LiveVideo';
import './main.tailwindcss.css';

/* app */
const root: Root = createRoot(document.getElementById('app')!);

root.render(
  <ThemeProvider isChildrenWindow={ true }>
    <AntdConfig>
      <LiveVideo />
    </AntdConfig>
  </ThemeProvider>
);