// @flow
/* 全局的store */
import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { Map } from 'immutable';
import { combineReducers } from 'redux-immutable';
import reducers from './reducers';

/* reducer列表 */
const reducer: Function = combineReducers(reducers);

/* initialState */
const initialState: Object = Map();

/* 日志 */
const logger: Function = createLogger({
  stateTransformer: (state: Object): Object => state.toJS()
});

/* 中间件 */
const middlewares: Function = applyMiddleware(thunk, logger);

/* store */
const store: Object = createStore(reducer, initialState, compose(middlewares));
// debug
window.store = store;

export default store;