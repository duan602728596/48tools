import React from 'react';
import { render } from 'react-dom';
import { LocaleProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import VideoPlay from './Index/index';

/* app */
render(
  <LocaleProvider locale={ zhCN }>
    <VideoPlay />
  </LocaleProvider>,
  document.getElementById('app')
);