import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import asyncModule from './asyncModule';
/* 加载模块 */
import Index from '../modules/Index/Layout';
import LiveCatch from '../modules/LiveCatch/Layout';
import PlayBackDownload from '../modules/PlayBackDownload/Layout';
import BiliBili from '../modules/Bilibili/Layout';
import Cut from '../modules/Cut/Layout';
import MergeVideo from '../modules/MergeVideo/Layout';
import Wds from '../modules/Wds/Layout';
import LiveDownload from '../modules/LiveDownload/Layout';
import InLive48 from '../modules/InLive48/Layout';

/* 路由模块 */
class Router extends Component{
  render(): Object{
    return (
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
        {/* 视频合并 */}
        <Route path="/MergeVideo" component={ MergeVideo } />
        {/* 微打赏 */}
        <Route path="/Wds" component={ Wds } />
        {/* 公演录播下载 */}
        <Route path="/LiveDownload" component={ LiveDownload } />
        {/* 公演官方直播抓取 */}
        <Route path="/InLive48" component={ InLive48 } />
      </Switch>
    );
  }
}

export default Router;