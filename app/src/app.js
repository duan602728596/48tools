// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import Routers from './router/router';
import store from './store/store';
import './common.sass';

/* app */
ReactDOM.render(
  <Provider store={ store }>
    <HashRouter>
      <Routers />
    </HashRouter>
  </Provider>,
  document.getElementById('react-app')
);