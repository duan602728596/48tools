import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import loadReducer from '../../store/loadReducer';
import reducer from './store/reducer';
import Index from './Index/index';

@loadReducer(reducer)
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
        <Route path="/MergeVideo" component={ Index } exact={ true } />
      </Switch>
    );
  }
}

export default ModuleLayout;