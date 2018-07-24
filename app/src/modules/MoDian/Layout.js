import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Index from './Index/index';

const ModuleLayout: Function = (props: Object): React.Element=>{
  return (
    <Switch>
      <Route path="/MoDian" component={ Index } exact={ true } />
    </Switch>
  );
};

export default ModuleLayout;
export reducer from './store/reducer';