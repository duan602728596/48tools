import { combineReducers, ReducersMapObject, Reducer } from '@reduxjs/toolkit';
import l48Reducers from '../pages/48/reducers/reducers';

/* reducers */
const reducers: ReducersMapObject = {
  ...l48Reducers
};

/* 创建reducer */
export function createReducer(asyncReducers: ReducersMapObject): Reducer {
  return combineReducers({
    ...reducers,
    ...asyncReducers
  });
}

export const ignoreOptions: any = {
  ignoredPaths: [],
  ignoredActions: []
};