import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import asyncModule from './asyncModule';
/* 加载模块 */
import Index from '../modules/Index/Layout';
import LiveCatch from 'bundle-loader?name=livecatch!../modules/LiveCatch/Layout';
import liveCatchReducer from 'bundle-loader?name=livecatch!../modules/LiveCatch/store/reducer';
import PlayBackDownload from 'bundle-loader?name=playbackdownload!../modules/PlayBackDownload/Layout';
import playBackDownloadReducer from 'bundle-loader?name=playbackdownload!../modules/PlayBackDownload/store/reducer';
import BiliBili from 'bundle-loader?name=bilibili!../modules/Bilibili/Layout';
import biliBiliReducer from 'bundle-loader?name=bilibili!../modules/Bilibili/store/reducer';
import Cut from 'bundle-loader?name=cut!../modules/Cut/Layout';
import cutReducer from 'bundle-loader?name=cut!../modules/Cut/store/reducer';
import MergeVideo from 'bundle-loader?name=mergevideo!../modules/MergeVideo/Layout';
import mergeVideoReducer from 'bundle-loader?name=mergevideo!../modules/MergeVideo/store/reducer';
import MoDian from 'bundle-loader?name=modian!../modules/MoDian/Layout';
import moDianReducer from 'bundle-loader?name=modian!../modules/MoDian/store/reducer';
import LiveDownload from 'bundle-loader?name=livedownload!../modules/LiveDownload/Layout';
import liveDownloadReducer from 'bundle-loader?name=livedownload!../modules/LiveDownload/store/reducer';
import InLive48 from 'bundle-loader?name=inlive48!../modules/InLive48/Layout';
import inLive48Reducer from 'bundle-loader?name=inlive48!../modules/InLive48/store/reducer';

const LiveCatchBundle: Function = asyncModule(LiveCatch, liveCatchReducer);
const PlayBackDownloadBundle: Function = asyncModule(PlayBackDownload, playBackDownloadReducer);
const BiliBiliBundle: Function = asyncModule(BiliBili, biliBiliReducer);
const CutBundle: Function = asyncModule(Cut, cutReducer);
const MergeVideoBundle: Function = asyncModule(MergeVideo, mergeVideoReducer);
const MoDianBundle: Function = asyncModule(MoDian, moDianReducer);
const LiveDownloadBundle: Function = asyncModule(LiveDownload, liveDownloadReducer);
const InLive48Bundle: Function = asyncModule(InLive48, inLive48Reducer);

/* 路由模块 */
class Router extends Component{
  render(): Object{
    return (
      <Switch>
        {/* 首页 */}
        <Route path="/" component={ Index } exact />
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
      </Switch>
    );
  }
}

export default Router;