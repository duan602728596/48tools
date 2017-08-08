/* 全局的store */
import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { Map } from 'immutable';
import { combineReducers } from 'redux-immutable';
import reducers from './reducers';

/* reducer列表 */
const reducer = combineReducers(reducers);

/* initialState */
const initialState = Map();

/* 日志 */
const logger = createLogger({
  stateTransformer: (state) => state.toJS()
});

/* 中间件 */
const middlewares = applyMiddleware(thunk, logger);

/* store */
const store = createStore(reducer, initialState, compose(middlewares));

export default store;