/* 全局的store */
import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { Map } from 'immutable';
import { createReducer } from './reducers';

/* reducer列表 */
const reducer: Function = createReducer({});

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
store.asyncReducers = {};

export default store;

/* 注入store */
export function injectReducers(asyncReducer: Object): void{
  // 获取reducer的key值，并将reducer保存起来
  let name: ?string = null;
  for(const key: string in asyncReducer){
    name = key;
  }
  // 异步注入reducer
  store.asyncReducers[name] = asyncReducer[name];
  store.replaceReducer(createReducer(store.asyncReducers));
}