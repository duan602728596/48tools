/**
 * 全局的store
 *
 * @flow
 */
import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import * as Immutable from 'immutable';
import { fromJS, Map } from 'immutable';
import { createReducer } from './reducers';

/* reducer列表 */
const reducer: Function = createReducer({});

/* 中间件 */
const middlewares: Function = applyMiddleware(thunk);

/* store */
const store: Object = {
  asyncReducers: {}
};

export function storeFactory(initialState: Object = {}): Object {
  /* initialState */
  const state: any = fromJS(initialState);
  const $$initialState: Immutable.Map<string, any> = Map(state);

  /* store */
  Object.assign(store, createStore(reducer, $$initialState, compose(middlewares)));

  return store;
}

export default store;

/* 注入store */
export function injectReducers(asyncReducer: Object): void {
  for (const key: string in asyncReducer) {
    const item: Object = asyncReducer[key];

    // 获取reducer的key值，并将reducer保存起来
    if (!(key in store.asyncReducers)) {
      store.asyncReducers[key] = item;
    }
  }

  // 异步注入reducer
  store.replaceReducer(createReducer(store.asyncReducers));
}