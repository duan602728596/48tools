import React from 'react';
import { render } from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import Routers from './router/Routers';
import { storeFactory } from './store/store';
import './components/upgradeDetection/upgradeDetection';

/* app */
render(
  <Provider store={ storeFactory(window.__INITIAL_STATE__ || {}) }>
    <ConfigProvider locale={ zhCN }>
      <HashRouter>
        <Routers />
      </HashRouter>
    </ConfigProvider>
  </Provider>,
  document.getElementById('app')
);