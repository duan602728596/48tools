import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import loadReducer from '../../store/loadReducer';
import reducer from './store/reducer';
import Index from './Index/index';
import TotalRanking from './TotalRanking/index';

@loadReducer(reducer)
class ModuleLayout extends Component{
  render(): React.Element{
    return (
      <Switch>
        <Route path="/MoDian" component={ Index } exact={ true } />
        <Route path="/MoDian/TotalRanking" component={ TotalRanking } exact={ true } />
      </Switch>
    );
  }
}

export default ModuleLayout;