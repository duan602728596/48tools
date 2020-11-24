import { combineReducers, ReducersMapObject, Reducer } from '@reduxjs/toolkit';

/* reducers */
const reducers: ReducersMapObject = {};

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