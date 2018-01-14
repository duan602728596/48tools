import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Index from './Index/index';
import Option from './Option/index';

const ModuleLayout = (props: Object): Object=>{
  return (
    <Switch>
      <Route path="/BiliBili" component={ Index } exact />
      <Route path="/BiliBili/Option" component={ Option } exact />
    </Switch>
  );
};

export default ModuleLayout;