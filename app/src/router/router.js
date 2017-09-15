// @flow
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import asyncModule from './asyncModule';
/* 加载模块 */
import Index from '../modules/Index/index';
import LiveCatch from 'bundle-loader?lazy&name=livecatch!../modules/LiveCatch/Index/index';
import LiveCatch_Option from 'bundle-loader?lazy&name=livecatch!../modules/LiveCatch/Option/index';
import PlayBackDownload from 'bundle-loader?lazy&name=playbackdownload!../modules/PlayBackDownload/Index/index';
import PlayBackDownload_Detail from 'bundle-loader?lazy&name=playbackdownload!../modules/PlayBackDownload/Detail/index';
import PlayBackDownload_List from 'bundle-loader?lazy&name=playbackdownload!../modules/PlayBackDownload/List/index';
import BiliBili from 'bundle-loader?lazy&name=bilibili!../modules/Bilibili/Index/index';
import BiliBili_Option from 'bundle-loader?lazy&name=bilibili!../modules/Bilibili/Option/index';
import Cut from 'bundle-loader?lazy&name=cut!../modules/Cut/Index/index';
import Wds from 'bundle-loader?lazy&name=wds!../modules/Wds/Index/index';
import LiveDownload from 'bundle-loader?lazy&name=livedownload!../modules/LiveDownload/Index/index';
/* 加载reducer */
import liveCatchReducer from 'bundle-loader?lazy&name=livecatch!../modules/LiveCatch/store/reducer';
import playBackDownloadReducer from 'bundle-loader?lazy&name=playbackdownload!../modules/PlayBackDownload/store/reducer';
import biliBiliReducer from 'bundle-loader?lazy&name=bilibili!../modules/Bilibili/store/reducer';
import cutReducer from 'bundle-loader?lazy&name=cut!../modules/Cut/store/reducer';
import wdsReducer from 'bundle-loader?lazy&name=wds!../modules/Wds/store/reducer';
import liveDownloadReducer from 'bundle-loader?lazy&name=livedownload!../modules/LiveDownload/store/reducer';

/* 路由模块 */
class Router extends Component{
  render(): Object{
    return(
      <div>
        <Switch>
          {/* 首页 */}
          <Route path="/" component={ Index } exact />
          {/* 直播抓取 */}
          <Route path="/LiveCatch" component={(props: Object): Object=>(
            <Switch>
              <Route path="/LiveCatch" component={ asyncModule(LiveCatch, liveCatchReducer) } exact />
              <Route path="/LiveCatch/Option" component={ asyncModule(LiveCatch_Option, liveCatchReducer) } exact />
            </Switch>
          )}>
          </Route>
          {/* 录播下载 */}
          <Route path="/PlayBackDownload" component={(props: Object): Object=>(
            <Switch>
              <Route path="/PlayBackDownload" component={ asyncModule(PlayBackDownload, playBackDownloadReducer) } exact />
              <Route path="/PlayBackDownload/Detail" component={ asyncModule(PlayBackDownload_Detail, playBackDownloadReducer) } exact />
              <Route path="/PlayBackDownload/List" component={ asyncModule(PlayBackDownload_List, playBackDownloadReducer) } exact />
            </Switch>
          )}>
          </Route>
          {/* B站直播间的视频流抓取 */}
          <Route path="/BiliBili" component={(props: Object): Object=>(
            <Switch>
              <Route path="/BiliBili" component={ asyncModule(BiliBili, biliBiliReducer) } exact />
              <Route path="/BiliBili/Option" component={ asyncModule(BiliBili_Option, biliBiliReducer) } exact />
            </Switch>
          )}>
          </Route>
          {/* 视频剪切 */}
          <Route path="/Cut" component={ asyncModule(Cut, cutReducer) } exact />
          {/* 微打赏 */}
          <Route path="/Wds" component={ asyncModule(Wds, wdsReducer) } exact />
          {/* 公演录播下载 */}
          <Route path="/LiveDownload" component={ asyncModule(LiveDownload, liveDownloadReducer) } exact />
        </Switch>
      </div>
    );
  }
}

export default Router;