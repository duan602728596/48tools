import { ReducersMapObject } from '@reduxjs/toolkit';
import pocket48Reducers from '../pages/48/reducers/pocket48';
import live48Reducers from '../pages/48/reducers/live48';
import bilibiliReducers from '../pages/Bilibili/reducers/reducers';
import concatReducers from '../pages/Concat/reducers/reducers';
import videoCutReducers from '../pages/VideoCut/reducers/reducers';

/* reducers */
export const reducers: ReducersMapObject = {
  ...pocket48Reducers,
  ...live48Reducers,
  ...bilibiliReducers,
  ...concatReducers,
  ...videoCutReducers
};

export const asyncReducers: ReducersMapObject = {}; // 异步的reducers

export const ignoreOptions: any = {
  ignoredPaths: [
    'pocket48.liveChildList',
    'pocket48.recordChildList',
    'live48.inLiveList',
    'live48.videoListChild',
    'bilibili.liveChildList',
    'concat.concatWorker',
    'videoCut.cutChildList'
  ],
  ignoredActions: [
    'pocket48/setAddLiveChildList',
    'pocket48/setDeleteLiveChildList',
    'pocket48/setAddRecordChildList',
    'pocket48/setDeleteRecordChildList',
    'live48/setAddInLiveList',
    'live48/setStopInLiveList',
    'live48/setDeleteInLiveList',
    'live48/setVideoListChildAdd',
    'live48/setVideoListChildDelete',
    'bilibili/setAddLiveBilibiliChildList',
    'bilibili/setDeleteLiveBilibiliChildList',
    'concat/setConcatWorker',
    'videoCut/setCutChildListAdd',
    'videoCut/setCutChildListDelete'
  ]
};