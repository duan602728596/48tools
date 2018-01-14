import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Index from './Index/index';
import List from './List/index';
import Detail from './Detail/index';

const ModuleLayout = (props: Object): Object=>{
  return (
    <Switch>
      <Route path="/PlayBackDownload" component={ Index } exact />
      <Route path="/PlayBackDownload/List" component={ List } exact />
      <Route path="/PlayBackDownload/Detail" component={ Detail } exact />
    </Switch>
  );
};

export default ModuleLayout;
export reducer from './store/reducer';