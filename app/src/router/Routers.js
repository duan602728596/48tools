import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import asyncModule from './asyncModule';
import Index from '../pages/Index/Layout';

const LiveCatchBundle = asyncModule(() => import('../pages/LiveCatch/Layout'));
const PlayBackDownloadBundle = asyncModule(() => import('../pages/PlayBackDownload/Layout'));
const BiliBiliBundle = asyncModule(() => import('../pages/Bilibili/Layout'));
const CutBundle = asyncModule(() => import('../pages/Cut/Layout'));
const MergeVideoBundle = asyncModule(() => import('../pages/MergeVideo/Layout'));
const MoDianBundle = asyncModule(() => import('../pages/MoDian/Layout'));
const LiveDownloadBundle = asyncModule(() => import('../pages/LiveDownload/Layout'));
const InLive48Bundle = asyncModule(() => import('../pages/InLive48/Layout'));
const MediaDownloadBundle = asyncModule(() => import('../pages/MediaDownload/Layout'));

/* 路由模块 */
class Routers extends Component {
  render() {
    return (
      <Switch>
        {/* 首页 */}
        <Route path="/" component={ Index } exact={ true } />
        {/* 直播抓取 */}
        <Route path="/LiveCatch" component={ LiveCatchBundle } />
        {/* 录播下载 */}
        <Route path="/PlayBackDownload" component={ PlayBackDownloadBundle } />
        {/* B站直播间的视频流抓取 */}
        <Route path="/BiliBili" component={ BiliBiliBundle } />
        {/* 视频剪切 */}
        <Route path="/Cut" component={ CutBundle } />
        {/* 视频合并 */}
        <Route path="/MergeVideo" component={ MergeVideoBundle } />
        {/* 摩点项目集资统计 */}
        <Route path="/MoDian" component={ MoDianBundle } />
        {/* 公演录播下载 */}
        <Route path="/LiveDownload" component={ LiveDownloadBundle } />
        {/* 公演官方直播抓取 */}
        <Route path="/InLive48" component={ InLive48Bundle } />
        {/* B站的视频下载 */}
        <Route path="/MediaDownload" component={ MediaDownloadBundle } />
      </Switch>
    );
  }
}

export default Routers;