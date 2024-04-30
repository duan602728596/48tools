/* 全局的store */
import {
  configureStore,
  combineReducers,
  type Reducer,
  type Store,
  type ImmutableStateInvariantMiddlewareOptions,
  type SerializableStateInvariantMiddlewareOptions
} from '@reduxjs/toolkit';
import type { GetDefaultMiddleware } from '@reduxjs/toolkit/src/getDefaultMiddleware';
import type { Middlewares } from '@reduxjs/toolkit/src/configureStore';
import type { Tuple } from '@reduxjs/toolkit/src/utils';
import createSagaMiddleware, { type SagaMiddleware, type Saga, type Task } from 'redux-saga';
import { reducersMapObject, ignoreOptions, apiMiddlewares, sagasArray } from './reducers';

interface ThunkOptions<E = any> {
  extraArgument: E;
}

interface GetDefaultMiddlewareOptions {
  thunk?: boolean | ThunkOptions;
  immutableCheck?: boolean | ImmutableStateInvariantMiddlewareOptions;
  serializableCheck?: boolean | SerializableStateInvariantMiddlewareOptions;
}

/* reducer列表 */
const reducer: Reducer = combineReducers(reducersMapObject);

/* store */
export let store: Store;
export const sagaMiddleware: SagaMiddleware<any> = createSagaMiddleware<any>();

/* 运行saga */
export function runSagas(sagas: Array<Saga>): void {
  sagas.forEach((sage: Saga): Task => sagaMiddleware.run(sage));
}

/* 创建store */
function createStore(initialState: any = {}): void {
  store = configureStore({
    reducer,
    preloadedState: initialState,
    middleware(getDefaultMiddleware: GetDefaultMiddleware): Tuple<Middlewares<any>> {
      return getDefaultMiddleware<GetDefaultMiddlewareOptions>({
        immutableCheck: ignoreOptions,
        serializableCheck: ignoreOptions
      }).concat(apiMiddlewares, sagaMiddleware as any);
    }
  });

  runSagas(sagasArray);
}

/* 创建（一次）并返回store */
export function storeFactory(initialState: any = {}): Store {
  if (!store) {
    createStore(initialState);
  }

  return store;
}

/* 异步注入store */
export function replaceReducers(dynamicReducers: Array<Record<string, Reducer>> ): void {
  Object.assign(reducersMapObject, ...dynamicReducers);
  store.replaceReducer(combineReducers(reducersMapObject));
}