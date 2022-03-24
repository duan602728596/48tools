/* 全局的store */
import {
  configureStore,
  combineReducers,
  type Reducer,
  type Store,
  type DeepPartial,
  type ImmutableStateInvariantMiddlewareOptions,
  type SerializableStateInvariantMiddlewareOptions,
  type Middleware
} from '@reduxjs/toolkit';
import type { CurriedGetDefaultMiddleware } from '@reduxjs/toolkit/src/getDefaultMiddleware';
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

function createStore(initialState: DeepPartial<any> = {}): void {
  store = configureStore({
    reducer,
    preloadedState: initialState,
    middleware(getDefaultMiddleware: CurriedGetDefaultMiddleware): ReadonlyArray<Middleware> {
      return getDefaultMiddleware<GetDefaultMiddlewareOptions>().concat(apiMiddlewares);
    }
  });
}

export function storeFactory(initialState: DeepPartial<any> = {}): Store {
  if (!store) {
    createStore(initialState);
  }

  return store;
}