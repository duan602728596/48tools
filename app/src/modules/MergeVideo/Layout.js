import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import asyncModule from '../../router/asyncModule';
import reducer from 'bundle-loader?name=mergevideo!./store/reducer';
import Index from 'bundle-loader?name=mergevideo!./Index/index';

const ModuleLayout = (props: Object): Object=>{
  return (
    <Switch>
      <Route path="/MergeVideo" component={ asyncModule(Index, reducer) } exact />
    </Switch>
  );
};

export default ModuleLayout;