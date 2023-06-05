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
import { reducersMapObject, apiMiddlewares } from './reducers';

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

function createStore(initialState: any = {}): void {
  store = configureStore({
    reducer,
    preloadedState: initialState,
    middleware(getDefaultMiddleware: GetDefaultMiddleware): Tuple<Middlewares<any>> {
      return getDefaultMiddleware<GetDefaultMiddlewareOptions>().concat(apiMiddlewares);
    }
  });
}

export function storeFactory(initialState: any = {}): Store {
  if (!store) {
    createStore(initialState);
  }

  return store;
}