// @flow
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import asyncModule from '../../router/asyncModule';
import Index from 'bundle-loader?name=livecatch!./Index/index';
import Option from 'bundle-loader?name=livecatch!./Option/index';
import reducer from 'bundle-loader?name=livecatch!./store/reducer';

const ModuleLayout = (props: Object): Object=>{
  return (
    <Switch>
      <Route path="/LiveCatch" component={ asyncModule(Index, reducer) } exact />
      <Route path="/LiveCatch/Option" component={ asyncModule(Option, reducer) } exact />
    </Switch>
  );
};

export default ModuleLayout;