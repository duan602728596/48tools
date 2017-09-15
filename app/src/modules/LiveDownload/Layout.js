// @flow
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import asyncModule from '../../router/asyncModule';
import Index from 'bundle-loader?lazy&name=livedownload!./Index/index';
import reducer from 'bundle-loader?lazy&name=livedownload!./store/reducer';

const ModuleLayout = (props: Object): Object=>{
  return(
    <Switch>
      <Route path="/LiveDownload" component={ asyncModule(Index, reducer) } exact />
    </Switch>
  );
};

export default ModuleLayout;