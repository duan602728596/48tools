import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Index from './Index/index';
import TotalRanking from './TotalRanking/index';

const ModuleLayout: Function = (props: Object): React.Element=>{
  return (
    <Switch>
      <Route path="/MoDian" component={ Index } exact={ true } />
      <Route path="/MoDian/TotalRanking" component={ TotalRanking } exact={ true } />
    </Switch>
  );
};

export default ModuleLayout;
export reducer from './store/reducer';