import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import loadReducer from '../../store/loadReducer';
import reducer from './store/reducer';
import Index from './Index/index';
import List from './List/index';

@loadReducer(reducer)
class ModuleLayout extends Component {
  render() {
    return (
      <Switch>
        <Route path="/LiveDownload" component={ Index } exact={ true } />
        <Route path="/LiveDownload/List" component={ List } exact={ true } />
      </Switch>
    );
  }
}

export default ModuleLayout;