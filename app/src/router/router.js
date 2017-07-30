import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Bundle from './bundle';
import Index from '../modules/Index/index';
import LiveCache from 'bundle-loader?lazy&name=LiveCache!../modules/LiveCache/Index/index';
import LiveCacheOption from 'bundle-loader?lazy&name=LiveCache!../modules/LiveCache/Option/index';

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
          <Route path="/" component={ Index } exact />
          <Route path="/LiveCache" component={(props)=>(
            <Switch>
              <Route path="/LiveCache" component={ this.asyncModule(LiveCache) } exact />
              <Route path="/LiveCache/Option" component={ this.asyncModule(LiveCacheOption) } exact />
            </Switch>
          )}>
          </Route>
        </Switch>
      </div>
    );
  }
}

export default Router;