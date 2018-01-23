import React from 'react';
import ReactDOM from 'react-dom';
import { LocaleProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import './common.sass';
import VideoPlay from './modules/VideoPlay/Index/index';

/* app */
ReactDOM.render(
  <LocaleProvider locale={ zhCN }>
    <VideoPlay />
  </LocaleProvider>,
  document.getElementById('react-app')
);