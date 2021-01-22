/* 全局的store */
import {
  configureStore,
  combineReducers,
  getDefaultMiddleware,
  Reducer,
  Store,
  DeepPartial
} from '@reduxjs/toolkit';
import { reducersMapObject, ignoreOptions } from './reducers';

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
      middleware: getDefaultMiddleware({
        immutableCheck: ignoreOptions,
        serializableCheck: ignoreOptions
      })
    });
  }

  return store;
}