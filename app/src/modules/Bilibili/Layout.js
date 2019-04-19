import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import loadReducer from '../../store/loadReducer';
import reducer from './store/reducer';
import Index from './Index/index';
import Option from './Option/index';

@loadReducer(reducer)
class ModuleLayout extends Component {
  render() {
    return (
      <Switch>
        <Route path="/BiliBili" component={ Index } exact={ true } />
        <Route path="/BiliBili/Option" component={ Option } exact={ true } />
      </Switch>
    );
  }
}

export default ModuleLayout;