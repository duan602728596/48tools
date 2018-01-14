import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Index from './Index/index';

const ModuleLayout = (props: Object): Object=>{
  return (
    <Switch>
      <Route path="/Cut" component={ Index } exact />
    </Switch>
  );
};

export default ModuleLayout;
export reducer from './store/reducer';