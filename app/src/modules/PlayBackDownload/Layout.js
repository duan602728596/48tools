import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import reducer from './store/reducer';
import Index from './Index/index';
import List from './List/index';
import Detail from './Detail/index';

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
        <Route path="/PlayBackDownload" component={ Index } exact={ true } />
        <Route path="/PlayBackDownload/List" component={ List } exact={ true } />
        <Route path="/PlayBackDownload/Detail" component={ Detail } exact={ true } />
      </Switch>
    );
  }
}

export default ModuleLayout;