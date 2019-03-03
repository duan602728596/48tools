// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { LocaleProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import Routers from './router/Routers';
import { storeFactory } from './store/store';
import './components/upgradeDetection/upgradeDetection';

/* app */
ReactDOM.render(
  <Provider store={ storeFactory(window.__INITIAL_STATE__ || {}) }>
    <LocaleProvider locale={ zhCN }>
      <HashRouter>
        <Routers />
      </HashRouter>
    </LocaleProvider>
  </Provider>,
  // $FlowFixMe
  document.getElementById('app')
);