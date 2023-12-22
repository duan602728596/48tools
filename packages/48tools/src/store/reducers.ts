import type { ReducersMapObject, Middleware } from '@reduxjs/toolkit';
import l48Pocket48Reducers from '../pages/48/reducers/pocket48';
import l48Live48Reducers from '../pages/48/reducers/live48';
import roomVoiceReducers from '../pages/48/reducers/roomVoice';
import pocket48LoginReducers from '../functionalComponents/Pocket48Login/reducers/pocket48Login';
import bilibiliDownloadReducers from '../pages/Bilibili/reducers/bilibiliDownload';
import bilibiliLiveReducers, {
  ignoredPaths as bilibiliLiveIgnoredPaths,
  ignoredActions as bilibiliLiveIgnoredActions
} from '../pages/Bilibili/reducers/bilibiliLive';
import acfunDownloadReducers from '../pages/AcFun/reducers/acfunDownload';
import acfunLiveReducers, {
  ignoredPaths as acfunLiveIgnoredPaths,
  ignoredActions as acfunLiveIgnoredActions
} from '../pages/AcFun/reducers/acfunLive';
import douyinDownloadReducers from '../pages/Toutiao/reducers/douyinDownload';
import douyinLiveReducers, {
  ignoredPaths as douyinLiveIgnoredPaths,
  ignoredActions as douyinLiveIgnoredActions
} from '../pages/Toutiao/reducers/douyinLive';
import kuaishouLiveReducers, {
  ignoredPaths as kuaishouLiveIgnoredPaths,
  ignoredActions as kuaishouLiveIgnoredActions
} from '../pages/Kuaishou/reducers/kuaishouLive';
import KuaishouVideoDownloadReducers from '../pages/Kuaishou/reducers/kuaishouVideoDownload';
import pocketFriendsApi from '../pages/48/reducers/pocketFriends.api';

/* reducers */
export const reducersMapObject: ReducersMapObject = Object.assign({},
  l48Pocket48Reducers,
  l48Live48Reducers,
  roomVoiceReducers,
  pocket48LoginReducers,
  bilibiliDownloadReducers,
  bilibiliLiveReducers,
  acfunDownloadReducers,
  acfunLiveReducers,
  douyinDownloadReducers,
  douyinLiveReducers,
  kuaishouLiveReducers,
  KuaishouVideoDownloadReducers,
  { [pocketFriendsApi.reducerPath]: pocketFriendsApi.reducer }
);

export const ignoreOptions: any = {
  ignoredPaths: [
    'pocket48.liveChildList',
    'pocket48.recordChildList',
    'pocket48.m3u8DownloadWorker',
    'pocket48.progress',
    'roomMessage.localMessageBrowser',
    'roomVoice.entities',
    'live48.OpenLiveListOptions',
    'live48.inLiveList',
    'live48.videoListChild',
    'live48.progress',
    ...bilibiliLiveIgnoredPaths,
    'bilibiliDownload.downloadWorkerList',
    'bilibiliDownload.downloadProgress',
    'acfunDownload.ffmpegDownloadWorkers',
    'acfunDownload.progress',
    ...acfunLiveIgnoredPaths,
    ...douyinLiveIgnoredPaths,
    'douyinDownload.downloadProgress',
    ...kuaishouLiveIgnoredPaths,
    'kuaishouVideoDownload.downloadProgress',
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
    'live48/setOpenLiveListOptions',
    'live48/setAddInLiveList',
    'live48/setAddWorkerInLiveList',
    'live48/setStopInLiveList',
    'live48/setDeleteInLiveList',
    'live48/setVideoListChildAdd',
    'live48/setVideoListChildDelete',
    'roomMessage/setLocalMessageBrowser',
    'roomVoice/setAddDownloadWorker',
    'roomVoice/setRemoveDownloadWorker',
    ...bilibiliLiveIgnoredActions,
    'bilibiliDownload/setAddDownloadWorker',
    'bilibiliDownload/setDeleteDownloadWorker',
    'acfunDownload/setAddDownloadWorker',
    'acfunDownload/setDeleteDownloadWorker',
    ...acfunLiveIgnoredActions,
    ...douyinLiveIgnoredActions,
    ...kuaishouLiveIgnoredActions,
    'concat/setConcatWorker',
    'videoCut/setCutChildListAdd',
    'videoCut/setCutChildListDelete',
    'FFmpegProcess/setAddProcess',
    'FFmpegProcess/setUpdateProcess'
  ]
};

/* middlewares */
export const apiMiddlewares: Array<Middleware> = [
  pocketFriendsApi.middleware
];