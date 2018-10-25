import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import reducer from './store/reducer';
import Index from './Index/index';
import TotalRanking from './TotalRanking/index';

class ModuleLayout extends Component{
  static propTypes: Object = {
    injectReducers: PropTypes.func
  };

  constructor(): void{
    super(...arguments);

    this.props.injectReducers(reducer);
  }
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