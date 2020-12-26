import { createSlice, Slice, SliceCaseReducers, PayloadAction, CaseReducerActions, ActionCreator } from '@reduxjs/toolkit';
import { findIndex } from 'lodash';
import dbRedux, { bilibiliLiveObjectStoreName } from '../../../utils/idb/dbRedux';
import type { WebWorkerChildItem } from '../../../types';
import type { DownloadItem, LiveItem } from '../types';
import type { MessageEventData } from '../Download/downloadBilibiliVideo.worker';

export interface BilibiliInitialState {
  downloadList: Array<DownloadItem>;
  downloadProgress: { [key: string]: number };
  bilibiliLiveList: Array<LiveItem>;
  liveChildList: Array<WebWorkerChildItem>;
}

type CaseReducers = SliceCaseReducers<BilibiliInitialState>;

const { actions, reducer }: Slice = createSlice<BilibiliInitialState, CaseReducers>({
  name: 'bilibili',
  initialState: {
    downloadList: [],     // 下载列表
    downloadProgress: {}, // 下载进度
    bilibiliLiveList: [], // 数据库内获取的直播间列表
    liveChildList: []     // 直播下载
  },
  reducers: {
    // 设置下载列表
    setDownloadList(state: BilibiliInitialState, action: PayloadAction<Array<DownloadItem>>): BilibiliInitialState {
      state.downloadList = action.payload;

      return state;
    },

    // 设置下载进度
    setDownloadProgress(state: BilibiliInitialState, action: PayloadAction<MessageEventData>): BilibiliInitialState {
      const { type, qid, data }: MessageEventData = action.payload;

      if (type === 'progress') {
        state.downloadProgress[qid] = data;
      } else if (type === 'success') {
        delete state.downloadProgress[qid]; // 下载完成
      }

      state.downloadProgress = { ...state.downloadProgress };

      return state;
    },

    // 获取直播间列表
    setBilibiliLiveList(state: BilibiliInitialState, action: PayloadAction<{ result: Array<LiveItem> }>): BilibiliInitialState {
      state.bilibiliLiveList = action.payload.result;

      return state;
    },

    // 直播间列表内添加一个直播间
    setBilibiliLiveListAddRoom(state: BilibiliInitialState, action: PayloadAction<{ data: LiveItem }>): BilibiliInitialState {
      state.bilibiliLiveList = state.bilibiliLiveList.concat([action.payload.data]);

      return state;
    },

    // 直播间列表内删除一个直播间
    setBilibiliLiveListDeleteRoom(state: BilibiliInitialState, action: PayloadAction<{ query: string }>): BilibiliInitialState {
      const index: number = findIndex(state.bilibiliLiveList, { id: action.payload.query });

      if (index >= 0) {
        const newBilibiliLiveList: Array<LiveItem> = [...state.bilibiliLiveList];

        newBilibiliLiveList.splice(index, 1);
        state.bilibiliLiveList = newBilibiliLiveList;
      }

      return state;
    },

    // 添加一个直播下载队列
    setAddLiveBilibiliChildList(state: BilibiliInitialState, action: PayloadAction<WebWorkerChildItem>): BilibiliInitialState {
      state.liveChildList = state.liveChildList.concat([action.payload]);

      return state;
    },

    // 删除一个直播下载队列
    setDeleteLiveBilibiliChildList(state: BilibiliInitialState, action: PayloadAction<LiveItem>): BilibiliInitialState {
      const index: number = findIndex(state.liveChildList, { id: action.payload.id });

      if (index >= 0) {
        state.liveChildList.splice(index, 1);
        state.liveChildList = [...state.liveChildList];
      }

      return state;
    }
  }
});

export const {
  setDownloadList,
  setDownloadProgress,
  setBilibiliLiveListAddRoom,
  setBilibiliLiveList,
  setBilibiliLiveListDeleteRoom,
  setAddLiveBilibiliChildList,
  setDeleteLiveBilibiliChildList
}: CaseReducerActions<CaseReducers> = actions;

// 保存数据
export const saveFormData: ActionCreator<any> = dbRedux.putAction({
  objectStoreName: bilibiliLiveObjectStoreName,
  successAction: setBilibiliLiveListAddRoom
});

// 请求所有列表
export const cursorFormData: ActionCreator<any> = dbRedux.cursorAction({
  objectStoreName: bilibiliLiveObjectStoreName,
  successAction: setBilibiliLiveList
});

// 删除
export const deleteFormData: ActionCreator<any> = dbRedux.deleteAction({
  objectStoreName: bilibiliLiveObjectStoreName,
  successAction: setBilibiliLiveListDeleteRoom
});

export default { bilibili: reducer };