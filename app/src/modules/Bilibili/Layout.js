// @flow
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import asyncModule from '../../router/asyncModule';
import Index from 'bundle-loader?lazy&name=bilibili!./Index/index';
import Option from 'bundle-loader?lazy&name=bilibili!./Option/index';
import reducer from 'bundle-loader?lazy&name=bilibili!./store/reducer';

const ModuleLayout = (props: Object): Object=>{
  return (
    <Switch>
      <Route path="/BiliBili" component={ asyncModule(Index, reducer) } exact />
      <Route path="/BiliBili/Option" component={ asyncModule(Option, reducer) } exact />
    </Switch>
  );
};

export default ModuleLayout;