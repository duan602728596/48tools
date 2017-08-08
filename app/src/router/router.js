import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Bundle from './bundle';
import Index from '../modules/Index/index';
import LiveCache from 'bundle-loader?lazy&name=LiveCache!../modules/LiveCache/Index/index';
import LiveCache_Option from 'bundle-loader?lazy&name=LiveCache!../modules/LiveCache/Option/index';
import PlayBackDownload from 'bundle-loader?lazy&name=PlayBackDownload!../modules/PlayBackDownload/Index/index';
import PlayBackDownload_Detail from 'bundle-loader?lazy&name=PlayBackDownload!../modules/PlayBackDownload/Detail/index';
import PlayBackDownload_List from 'bundle-loader?lazy&name=PlayBackDownload!../modules/PlayBackDownload/List/index';
import BiliBili from 'bundle-loader?lazy&name=BiliBili!../modules/Bilibili/Index/index';

/* 路由模块 */
class Router extends Component{
  // 异步加载模块
  asyncModule(module){
    return ()=>(
      <Bundle load={ module }>
        { (M)=><M /> }
      </Bundle>
    );
  }
  render(){
    return(
      <div>
        <Switch>
          {/* 首页 */}
          <Route path="/" component={ Index } exact />
          {/* 直播抓取 */}
          <Route path="/LiveCache" component={(props)=>(
            <Switch>
              <Route path="/LiveCache" component={ this.asyncModule(LiveCache) } exact />
              <Route path="/LiveCache/Option" component={ this.asyncModule(LiveCache_Option) } exact />
            </Switch>
          )}>
          </Route>
          {/* 录播下载 */}
          <Route path="/PlayBackDownload" component={(props)=>(
            <Switch>
              <Route path="/PlayBackDownload" component={ this.asyncModule(PlayBackDownload) } exact />
              <Route path="/PlayBackDownload/Detail" component={ this.asyncModule(PlayBackDownload_Detail) } exact />
              <Route path="/PlayBackDownload/List" component={ this.asyncModule(PlayBackDownload_List) } exact />
            </Switch>
          )}>
          </Route>
          {/* B站直播间的视频流抓取 */}
          <Route path="/BiliBili" component={(props)=>(
            <Switch>
              <Route path="/BiliBili" component={ this.asyncModule(BiliBili) } exact />
            </Switch>
          )}>
          </Route>
        </Switch>
      </div>
    );
  }
}

export default Router;