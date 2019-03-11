import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Index from './Index/index';

class ModuleLayout extends Component {
  render() {
    return (
      <Switch>
        <Route path="/" component={ Index } exact={ true } />
      </Switch>
    );
  }
}

export default ModuleLayout;