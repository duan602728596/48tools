import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import loadReducer from '../../store/loadReducer';
import reducer from './reducer/reducer';
import Index from './Index/index';
import Option from './Option/index';

@loadReducer(reducer)
class ModuleLayout extends Component {
  render() {
    return (
      <Switch>
        <Route path="/LiveCatch" component={ Index } exact={ true } />
        <Route path="/LiveCatch/Option" component={ Option } exact={ true } />
      </Switch>
    );
  }
}

export default ModuleLayout;