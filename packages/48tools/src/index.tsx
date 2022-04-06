import { render } from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale-provider/zh_CN';
import * as dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { storeFactory } from './store/store';
import Routers from './router/Routers';
import ThemeProvider from './components/Theme/ThemeProvider';
import { netMediaServerInit } from './utils/nodeMediaServer/nodeMediaServer';
import IDBInit from './utils/IDB/IDBInit';
import './main.tailwindcss.css';

dayjs.locale('zh-cn');

/* app */
render(
  <Provider store={ storeFactory() }>
    <ConfigProvider locale={ zhCN }>
      <ThemeProvider>
        <HashRouter>
          <Routers />
        </HashRouter>
      </ThemeProvider>
    </ConfigProvider>
  </Provider>,
  document.getElementById('app')
);

netMediaServerInit();
IDBInit();

declare const module: any;

if (module.hot) {
  module.hot.accept();
}