// @flow
import * as React from 'react';
import { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import asyncModule from './asyncModule';
import Index from '../modules/Index/Layout';

const LiveCatchBundle: Function = asyncModule((): Promise<Function> => import('../modules/LiveCatch/Layout'));
const PlayBackDownloadBundle: Function = asyncModule((): Promise<Function> => import('../modules/PlayBackDownload/Layout'));
const BiliBiliBundle: Function = asyncModule((): Promise<Function> => import('../modules/Bilibili/Layout'));
const CutBundle: Function = asyncModule((): Promise<Function> => import('../modules/Cut/Layout'));
const MergeVideoBundle: Function = asyncModule((): Promise<Function> => import('../modules/MergeVideo/Layout'));
const MoDianBundle: Function = asyncModule((): Promise<Function> => import('../modules/MoDian/Layout'));
const LiveDownloadBundle: Function = asyncModule((): Promise<Function> => import('../modules/LiveDownload/Layout'));
const InLive48Bundle: Function = asyncModule((): Promise<Function> => import('../modules/InLive48/Layout'));
const AvDownloadBundle: Function = asyncModule((): Promise<Function> => import('../modules/AvDownload/Layout'));

/* 路由模块 */
class Routers extends Component<{}> {
  render(): React.Node {
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
        <Route path="/AvDownload" component={ AvDownloadBundle } />
      </Switch>
    );
  }
}

export default Routers;