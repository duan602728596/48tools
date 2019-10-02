import React from 'react';
import { Route, Switch } from 'react-router-dom';
import loadReducer from '../../store/loadReducer';
import reducer from './reducer/reducer';
import Index from './Index/index';

function ModuleLayout(props) {
  return (
    <Switch>
      <Route path="/MediaDownload" component={ Index } exact={ true } />
    </Switch>
  );
}

export default loadReducer(reducer)(ModuleLayout);