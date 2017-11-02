import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import asyncModule from '../../router/asyncModule';
import Index from 'bundle-loader?name=livedownload!./Index/index';
import List from 'bundle-loader?name=livedownload!./List/index';
import reducer from 'bundle-loader?name=livedownload!./store/reducer';

const ModuleLayout = (props: Object): Object=>{
  return (
    <Switch>
      <Route path="/LiveDownload" component={ asyncModule(Index, reducer) } exact />
      <Route path="/LiveDownload/List" component={ asyncModule(List, reducer) } exact />
    </Switch>
  );
};

export default ModuleLayout;