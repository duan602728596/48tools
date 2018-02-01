import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Index from './Index/index';
import Option from './Option/index';

const ModuleLayout: Function = (props: Object): Object=>{
  return (
    <Switch>
      <Route path="/LiveCatch" component={ Index } exact={ true } />
      <Route path="/LiveCatch/Option" component={ Option } exact={ true } />
    </Switch>
  );
};

export default ModuleLayout;
export reducer from './store/reducer';