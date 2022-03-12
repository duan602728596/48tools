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
import { reducersMapObject, ignoreOptions } from './reducers';

interface ThunkOptions<E = any> {
  extraArgument: E;
}

interface GetDefaultMiddlewareOptions {
  thunk?: boolean | ThunkOptions;
  immutableCheck?: boolean | ImmutableStateInvariantMiddlewareOptions;
  serializableCheck?: boolean | SerializableStateInvariantMiddlewareOptions;
}

type Middlewares = ReadonlyArray<Middleware<{}, any>>;

/* reducer列表 */
const reducer: Reducer = combineReducers(reducersMapObject);

/* store */
export let store: Store;

function createStore(initialState: DeepPartial<any> = {}): void {
  store = configureStore({
    reducer,
    preloadedState: initialState,
    middleware(getDefaultMiddleware: CurriedGetDefaultMiddleware): Middlewares {
      return getDefaultMiddleware<GetDefaultMiddlewareOptions>({
        immutableCheck: ignoreOptions,
        serializableCheck: ignoreOptions
      });
    }
  });
}

export function storeFactory(initialState: DeepPartial<any> = {}): Store {
  if (!store) {
    createStore(initialState);
  }

  return store;
}