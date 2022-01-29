import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd-mobile';
import zhCN from 'antd-mobile/es/locales/zh-CN';
import Routers from './router/Routers';
import Main from './components/Main/Main';
import './main.tailwindcss.css';
import './global.sass';

/* app */
render(
  <ConfigProvider locale={ zhCN }>
    <Main>
      <BrowserRouter>
        <Routers />
      </BrowserRouter>
    </Main>
  </ConfigProvider>,
  document.getElementById('app')
);

// @ts-ignore
if (import.meta.hot) {
  // @ts-ignore
  import.meta.hot.accept();
}