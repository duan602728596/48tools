import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import asyncModule from '../../router/asyncModule';
import Index from 'bundle-loader?name=modian!./Index/index';
import reducer from 'bundle-loader?name=modian!./store/reducer';

const ModuleLayout = (props: Object): Object=>{
  return (
    <Switch>
      <Route path="/MoDian" component={ asyncModule(Index, reducer) } exact />
    </Switch>
  );
};

export default ModuleLayout;