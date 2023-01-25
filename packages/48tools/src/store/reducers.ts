import type { ReducersMapObject } from '@reduxjs/toolkit';
import l48Pocket48Reducers from '../pages/48/reducers/pocket48';
import l48Live48Reducers from '../pages/48/reducers/live48';
import bilibiliDownloadReducers from '../pages/Bilibili/reducers/download';
import bilibiliLiveReducers from '../pages/Bilibili/reducers/live';
import acfunDownloadReducers from '../pages/AcFun/reducers/download';
import acfunLiveReducers from '../pages/AcFun/reducers/live';
import douyinDownloadReducers from '../pages/Toutiao/reducers/douyin';
import videoEditConcatReducers from '../pages/VideoEdit/reducers/concat';
import videoEditVideoCutReducers from '../pages/VideoEdit/reducers/videoCut';
import FFmpegProcessReducer from '../pages/VideoEdit/reducers/FFmpegProcess';
import weiboLoginReducers from '../functionalComponents/WeiboLogin/reducers/weiboLogin';
import weiboSuperReducers from '../pages/WeiboSuper/reducers/weiboSuper';

/* reducers */
export const reducersMapObject: ReducersMapObject = Object.assign({},
  l48Pocket48Reducers,
  l48Live48Reducers,
  bilibiliDownloadReducers,
  bilibiliLiveReducers,
  acfunDownloadReducers,
  acfunLiveReducers,
  douyinDownloadReducers,
  videoEditConcatReducers,
  videoEditVideoCutReducers,
  FFmpegProcessReducer,
  weiboLoginReducers,
  weiboSuperReducers
);

export const ignoreOptions: any = {
  ignoredPaths: [
    'pocket48.liveChildList',
    'pocket48.recordChildList',
    'pocket48.m3u8DownloadWorker',
    'live48.inLiveList',
    'live48.videoListChild',
    'bilibiliLive.liveChildList',
    'acfunDownload.ffmpegDownloadWorkers',
    'acfunLive.liveWorkers',
    'concat.concatWorker',
    'videoCut.cutChildList',
    'FFmpegProcess.entities'
  ],
  ignoredActions: [
    'pocket48/setAddLiveChildList',
    'pocket48/setDeleteLiveChildList',
    'pocket48/setAddRecordChildList',
    'pocket48/setDeleteRecordChildList',
    'pocket48/setM3u8DownloadWorker',
    'live48/setAddInLiveList',
    'live48/setAddWorkerInLiveList',
    'live48/setStopInLiveList',
    'live48/setDeleteInLiveList',
    'live48/setVideoListChildAdd',
    'live48/setVideoListChildDelete',
    'bilibiliLive/setAddLiveBilibiliChildList',
    'bilibiliLive/setDeleteLiveBilibiliChildList',
    'acfunDownload/setAddDownloadWorker',
    'acfunDownload/setDeleteDownloadWorker',
    'acfunLive/setAddLiveWorker',
    'acfunLive/setDeleteLiveWorker',
    'concat/setConcatWorker',
    'videoCut/setCutChildListAdd',
    'videoCut/setCutChildListDelete',
    'FFmpegProcess/setAddProcess',
    'FFmpegProcess/setUpdateProcess'
  ]
};