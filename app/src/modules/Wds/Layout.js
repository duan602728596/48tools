// @flow
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import asyncModule from '../../router/asyncModule';
import Index from 'bundle-loader?lazy&name=wds!./Index/index';
import reducer from 'bundle-loader?lazy&name=wds!./store/reducer';

const ModuleLayout = (props: Object): Object=>{
  return (
    <Switch>
      <Route path="/Wds" component={ asyncModule(Index, reducer) } exact />
    </Switch>
  );
};

export default ModuleLayout;