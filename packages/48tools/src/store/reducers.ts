import { combineReducers, ReducersMapObject, Reducer } from '@reduxjs/toolkit';
import bilibiliReducers from '../pages/Bilibili/reducers/reducers';

/* reducers */
const reducers: ReducersMapObject = {
  ...bilibiliReducers
};

/* 创建reducer */
export function createReducer(asyncReducers: ReducersMapObject): Reducer {
  return combineReducers({
    ...reducers,
    ...asyncReducers
  });
}

export const ignoreOptions: any = {
  ignoredPaths: [
    'l48.liveChildList',
    'l48.recordChildList',
    'bilibili.liveChildList'
  ],
  ignoredActions: [
    'l48/setLiveChildList',
    'l48/setRecordChildList',
    'bilibili/setLiveBilibiliChildList'
  ]
};