import { combineReducers, ReducersMapObject, Reducer } from '@reduxjs/toolkit';
import pocket48Reducers from '../pages/48/reducers/pocket48';
import live48Reducers from '../pages/48/reducers/live48';
import bilibiliReducers from '../pages/Bilibili/reducers/reducers';

/* reducers */
const reducers: ReducersMapObject = {
  ...pocket48Reducers,
  ...live48Reducers,
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
    'live48.inLiveList',
    'bilibili.liveChildList'
  ],
  ignoredActions: [
    'pocket48/setAddLiveChildList',
    'pocket48/setDeleteLiveChildList',
    'pocket48/setAddRecordChildList',
    'pocket48/setDeleteRecordChildList',
    'live48/setAddInLiveList',
    'live48/setStopInLiveList',
    'live48/setDeleteInLiveList',
    'bilibili/setLiveBilibiliChildList'
  ]
};