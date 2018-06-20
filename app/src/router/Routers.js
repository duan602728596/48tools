import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import asyncModule from './asyncModule';
import Index from '../modules/Index/Layout';
import LiveCatch from 'bundle-loader?lazy&name=livecatch!../modules/LiveCatch/Layout';
import PlayBackDownload from 'bundle-loader?lazy&name=playbackdownload!../modules/PlayBackDownload/Layout';
import BiliBili from 'bundle-loader?lazy&name=bilibili!../modules/Bilibili/Layout';
import Cut from 'bundle-loader?lazy&name=cut!../modules/Cut/Layout';
import MergeVideo from 'bundle-loader?lazy&name=mergevideo!../modules/MergeVideo/Layout';
import MoDian from 'bundle-loader?lazy&name=modian!../modules/MoDian/Layout';
import LiveDownload from 'bundle-loader?lazy&name=livedownload!../modules/LiveDownload/Layout';
import InLive48 from 'bundle-loader?lazy&name=inlive48!../modules/InLive48/Layout';
import AvDownload from 'bundle-loader?lazy&name=avdownload!../modules/AvDownload/Layout';

const LiveCatchBundle: Function = asyncModule(LiveCatch);
const PlayBackDownloadBundle: Function = asyncModule(PlayBackDownload);
const BiliBiliBundle: Function = asyncModule(BiliBili);
const CutBundle: Function = asyncModule(Cut);
const MergeVideoBundle: Function = asyncModule(MergeVideo);
const MoDianBundle: Function = asyncModule(MoDian);
const LiveDownloadBundle: Function = asyncModule(LiveDownload);
const InLive48Bundle: Function = asyncModule(InLive48);
const AvDownloadBundle: Function = asyncModule(AvDownload);

/* 路由模块 */
class Routers extends Component{
  render(): Object{
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
