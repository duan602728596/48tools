/* 全局的store */
import {
  configureStore,
  combineReducers,
  Reducer,
  Store,
  DeepPartial,
  ImmutableStateInvariantMiddlewareOptions,
  SerializableStateInvariantMiddlewareOptions,
  MiddlewareArray
} from '@reduxjs/toolkit';
import type { CurriedGetDefaultMiddleware, ThunkMiddlewareFor } from '@reduxjs/toolkit/src/getDefaultMiddleware';
import type { Middleware } from 'redux';
import { reducersMapObject, ignoreOptions } from './reducers';

interface ThunkOptions<E = any> {
  extraArgument: E;
}

interface GetDefaultMiddlewareOptions {
  thunk?: boolean | ThunkOptions;
  immutableCheck?: boolean | ImmutableStateInvariantMiddlewareOptions;
  serializableCheck?: boolean | SerializableStateInvariantMiddlewareOptions;
}

type MiddlewareCbReturn = MiddlewareArray<
  Middleware<{}, any>
  | ThunkMiddlewareFor<any, GetDefaultMiddlewareOptions>
>;

/* reducer列表 */
const reducer: Reducer = combineReducers(reducersMapObject);

/* store */
export let store: Store;

export function storeFactory(initialState: DeepPartial<any> = {}): Store {
  // 避免热替换导致redux的状态丢失
  if (!store) {
    /* store */
    store = configureStore({
      reducer,
      preloadedState: initialState,
      middleware(getDefaultMiddleware: CurriedGetDefaultMiddleware): MiddlewareCbReturn {
        return getDefaultMiddleware<GetDefaultMiddlewareOptions>({
          immutableCheck: ignoreOptions,
          serializableCheck: ignoreOptions
        });
      }
    });
  }

  return store;
}