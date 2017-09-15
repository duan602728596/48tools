// @flow
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import asyncModule from './asyncModule';
/* 加载模块 */
import Index from '../modules/Index/Layout';
import LiveCatch from '../modules/LiveCatch/Layout';
import PlayBackDownload from '../modules/PlayBackDownload/Layout';
import BiliBili from '../modules/Bilibili/Layout';
import Cut from '../modules/Cut/Layout';
import Wds from '../modules/Wds/Layout';
import LiveDownload from '../modules/LiveDownload/Layout';

/* 路由模块 */
class Router extends Component{
  render(): Object{
    return (
      <div>
        <Switch>
          {/* 首页 */}
          <Route path="/" component={ Index } exact />
          {/* 直播抓取 */}
          <Route path="/LiveCatch" component={ LiveCatch } />
          {/* 录播下载 */}
          <Route path="/PlayBackDownload" component={ PlayBackDownload } />
          {/* B站直播间的视频流抓取 */}
          <Route path="/BiliBili" component={ BiliBili } />
          {/* 视频剪切 */}
          <Route path="/Cut" component={ Cut } />
          {/* 微打赏 */}
          <Route path="/Wds" component={ Wds } />
          {/* 公演录播下载 */}
          <Route path="/LiveDownload" component={ LiveDownload } />
        </Switch>
      </div>
    );
  }
}

export default Router;