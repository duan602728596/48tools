import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Index from './Index/index';
import List from './List/index';

const ModuleLayout: Function = (props: Object): Object=>{
  return (
    <Switch>
      <Route path="/LiveDownload" component={ Index } exact={ true } />
      <Route path="/LiveDownload/List" component={ List } exact={ true } />
    </Switch>
  );
};

export default ModuleLayout;
export reducer from './store/reducer';