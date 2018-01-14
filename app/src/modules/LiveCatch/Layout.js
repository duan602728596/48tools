import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Index from './Index/index';
import Option from './Option/index';

const ModuleLayout = (props: Object): Object=>{
  return (
    <Switch>
      <Route path="/LiveCatch" component={ Index } exact />
      <Route path="/LiveCatch/Option" component={ Option } exact />
    </Switch>
  );
};

export default ModuleLayout;
export reducer from './store/reducer';