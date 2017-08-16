// @flow
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Bundle from './bundle';
import Index from '../modules/Index/index';
import LiveCatch from 'bundle-loader?lazy&name=LiveCatch!../modules/LiveCatch/Index/index';
import LiveCatch_Option from 'bundle-loader?lazy&name=LiveCatch!../modules/LiveCatch/Option/index';
import PlayBackDownload from 'bundle-loader?lazy&name=PlayBackDownload!../modules/PlayBackDownload/Index/index';
import PlayBackDownload_Detail from 'bundle-loader?lazy&name=PlayBackDownload!../modules/PlayBackDownload/Detail/index';
import PlayBackDownload_List from 'bundle-loader?lazy&name=PlayBackDownload!../modules/PlayBackDownload/List/index';
import BiliBili from 'bundle-loader?lazy&name=BiliBili!../modules/Bilibili/Index/index';
import BiliBili_Option from 'bundle-loader?lazy&name=BiliBili!../modules/Bilibili/Option/index';
import Cut from 'bundle-loader?lazy&name=Cut!../modules/Cut/Index/index';
import Wds from 'bundle-loader?lazy&name=Wds!../modules/Wds/Index/index';

/* 路由模块 */
class Router extends Component{
  // 异步加载模块
  asyncModule(module: Function): Function{
    return (): Object=>(
      <Bundle load={ module }>
        { (M)=><M /> }
      </Bundle>
    );
  }
  render(): Object{
    return(
      <div>
        <Switch>
          {/* 首页 */}
          <Route path="/" component={ Index } exact />
          {/* 直播抓取 */}
          <Route path="/LiveCatch" component={(props: Object): Object=>(
            <Switch>
              <Route path="/LiveCatch" component={ this.asyncModule(LiveCatch) } exact />
              <Route path="/LiveCatch/Option" component={ this.asyncModule(LiveCatch_Option) } exact />
            </Switch>
          )}>
          </Route>
          {/* 录播下载 */}
          <Route path="/PlayBackDownload" component={(props: Object): Object=>(
            <Switch>
              <Route path="/PlayBackDownload" component={ this.asyncModule(PlayBackDownload) } exact />
              <Route path="/PlayBackDownload/Detail" component={ this.asyncModule(PlayBackDownload_Detail) } exact />
              <Route path="/PlayBackDownload/List" component={ this.asyncModule(PlayBackDownload_List) } exact />
            </Switch>
          )}>
          </Route>
          {/* B站直播间的视频流抓取 */}
          <Route path="/BiliBili" component={(props: Object): Object=>(
            <Switch>
              <Route path="/BiliBili" component={ this.asyncModule(BiliBili) } exact />
              <Route path="/BiliBili/Option" component={ this.asyncModule(BiliBili_Option) } exact />
            </Switch>
          )}>
          </Route>
          {/* 视频剪切 */}
          <Route path="/Cut" component={ this.asyncModule(Cut) } exact />
          {/* 微打赏 */}
          <Route path="/Wds" component={ this.asyncModule(Wds) } exact />
        </Switch>
      </div>
    );
  }
}

export default Router;