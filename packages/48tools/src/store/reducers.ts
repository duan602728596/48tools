import type { ReducersMapObject, Middleware } from '@reduxjs/toolkit';
import l48Pocket48Reducers from '../pages/48/reducers/pocket48';
import l48Live48Reducers from '../pages/48/reducers/live48';
import roomMessageReducers from '../pages/48/reducers/roomMessage';
import roomVoiceReducers from '../pages/48/reducers/roomVoice';
import qingchunshikeReducers from '../pages/48/reducers/qingchunshike';
import pocket48LoginReducers from '../functionalComponents/Pocket48Login/reducers/pocket48Login';
import bilibiliDownloadReducers from '../pages/Bilibili/reducers/bilibiliDownload';
import bilibiliLiveReducers from '../pages/Bilibili/reducers/bilibiliLive';
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
import videoEditConcatReducers from '../pages/VideoEdit/reducers/concat';
import videoEditVideoCutReducers from '../pages/VideoEdit/reducers/videoCut';
import FFmpegProcessReducer from '../pages/VideoEdit/reducers/FFmpegProcess';
import weiboLoginReducers from '../functionalComponents/WeiboLogin/reducers/weiboLogin';
import weiboSuperReducers from '../pages/WeiboSuper/reducers/weiboSuper';
import pocketFriendsApi from '../pages/48/reducers/pocketFriends.api';

/* reducers */
export const reducersMapObject: ReducersMapObject = Object.assign({},
  l48Pocket48Reducers,
  l48Live48Reducers,
  roomMessageReducers,
  roomVoiceReducers,
  qingchunshikeReducers,
  pocket48LoginReducers,
  bilibiliDownloadReducers,
  bilibiliLiveReducers,
  acfunDownloadReducers,
  acfunLiveReducers,
  douyinDownloadReducers,
  douyinLiveReducers,
  kuaishouLiveReducers,
  KuaishouVideoDownloadReducers,
  videoEditConcatReducers,
  videoEditVideoCutReducers,
  FFmpegProcessReducer,
  weiboLoginReducers,
  weiboSuperReducers,
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
    'live48.inLiveList',
    'live48.videoListChild',
    'live48.progress',
    'bilibiliLive.liveChildList',
    'bilibiliLive.autoRecordTimer',
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
    'live48/setAddInLiveList',
    'live48/setAddWorkerInLiveList',
    'live48/setStopInLiveList',
    'live48/setDeleteInLiveList',
    'live48/setVideoListChildAdd',
    'live48/setVideoListChildDelete',
    'roomMessage/setLocalMessageBrowser',
    'roomVoice/setAddDownloadWorker',
    'roomVoice/setRemoveDownloadWorker',
    'bilibiliLive/setAddLiveBilibiliChildList',
    'bilibiliLive/setDeleteLiveBilibiliChildList',
    'bilibiliLive/setAutoRecordTimer',
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