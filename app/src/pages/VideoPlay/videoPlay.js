import React from 'react';
import { render } from 'react-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import VideoPlay from './Index/index';

/* app */
render(
  <ConfigProvider locale={ zhCN }>
    <VideoPlay />
  </ConfigProvider>,
  document.getElementById('app')
);