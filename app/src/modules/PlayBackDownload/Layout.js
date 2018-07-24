import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Index from './Index/index';
import List from './List/index';
import Detail from './Detail/index';

const ModuleLayout: Function = (props: Object): React.Element=>{
  return (
    <Switch>
      <Route path="/PlayBackDownload" component={ Index } exact={ true } />
      <Route path="/PlayBackDownload/List" component={ List } exact={ true } />
      <Route path="/PlayBackDownload/Detail" component={ Detail } exact={ true } />
    </Switch>
  );
};

export default ModuleLayout;
export reducer from './store/reducer';