import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import asyncModule from '../../router/asyncModule';
import Index from 'bundle-loader?name=playbackdownload!./Index/index';
import List from 'bundle-loader?name=playbackdownload!./List/index';
import Detail from 'bundle-loader?name=playbackdownload!./Detail/index';
import reducer from 'bundle-loader?name=playbackdownload!./store/reducer';

const ModuleLayout = (props: Object): Object=>{
  return (
    <Switch>
      <Route path="/PlayBackDownload" component={ asyncModule(Index, reducer) } exact />
      <Route path="/PlayBackDownload/List" component={ asyncModule(List, reducer) } exact />
      <Route path="/PlayBackDownload/Detail" component={ asyncModule(Detail, reducer) } exact />
    </Switch>
  );
};

export default ModuleLayout;