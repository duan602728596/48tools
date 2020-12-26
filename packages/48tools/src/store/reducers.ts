import { combineReducers, ReducersMapObject, Reducer } from '@reduxjs/toolkit';
import pocket48Reducers from '../pages/48/reducers/pocket48';
import bilibiliReducers from '../pages/Bilibili/reducers/reducers';

/* reducers */
const reducers: ReducersMapObject = {
  ...pocket48Reducers,
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
    'pocket48.liveChildList',
    'pocket48.recordChildList',
    'bilibili.liveChildList'
  ],
  ignoredActions: [
    'pocket48/setLiveChildList',
    'pocket48/setRecordChildList',
    'bilibili/setLiveBilibiliChildList'
  ]
};